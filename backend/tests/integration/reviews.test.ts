import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import { mockPrisma, resetPrismaMock } from "../mocks/prisma.mock";

vi.mock("../../src/lib/prisma", () => ({ prisma: mockPrisma }));

import { createApp } from "../../src/app";
import { signPatientToken } from "../../src/utils/jwt";

const PATIENT = { id: "patient-1", name: "Test Patient", email: "patient@example.com", isActive: true };

function authCookie() {
  const token = signPatientToken({ sub: PATIENT.id, email: PATIENT.email });
  return `patient_token=${token}`;
}

describe("Reviews", () => {
  const app = createApp();

  beforeEach(() => {
    resetPrismaMock();
    mockPrisma.patient.findUnique.mockResolvedValue(PATIENT);
  });

  describe("POST /api/reviews", () => {
    it("rejects an unauthenticated submission", async () => {
      const res = await request(app).post("/api/reviews").send({ rating: 5 });
      expect(res.status).toBe(401);
    });

    it("accepts a valid review from a logged-in patient and creates it as PENDING", async () => {
      mockPrisma.review.create.mockResolvedValue({
        id: "44444444-4444-4444-4444-444444444444",
        patientId: PATIENT.id,
        patientName: PATIENT.name,
        rating: 5,
        reviewText: "Great experience.",
        status: "PENDING",
      });

      const res = await request(app)
        .post("/api/reviews")
        .set("Cookie", authCookie())
        .send({ rating: 5, reviewText: "Great experience." });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(mockPrisma.review.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ patientId: PATIENT.id, patientName: PATIENT.name, rating: 5 }) })
      );
    });

    it("rejects a rating outside 1-5", async () => {
      const res = await request(app).post("/api/reviews").set("Cookie", authCookie()).send({ rating: 6 });
      expect(res.status).toBe(400);
    });

    it("rejects a rating of 0", async () => {
      const res = await request(app).post("/api/reviews").set("Cookie", authCookie()).send({ rating: 0 });
      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/reviews (public)", () => {
    it("only ever returns approved reviews", async () => {
      mockPrisma.review.findMany.mockResolvedValue([
        { id: "1", patientName: "A", rating: 5, reviewText: "Good", createdAt: new Date() },
      ]);
      mockPrisma.review.count.mockResolvedValue(1);

      const res = await request(app).get("/api/reviews");

      expect(res.status).toBe(200);
      expect(mockPrisma.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: "APPROVED" } })
      );
      expect(res.body.data.items).toHaveLength(1);
    });

    it("does not require authentication", async () => {
      mockPrisma.review.findMany.mockResolvedValue([]);
      mockPrisma.review.count.mockResolvedValue(0);

      const res = await request(app).get("/api/reviews");

      expect(res.status).toBe(200);
    });
  });
});
