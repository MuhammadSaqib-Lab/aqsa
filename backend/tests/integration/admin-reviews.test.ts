import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import { mockPrisma, resetPrismaMock } from "../mocks/prisma.mock";

vi.mock("../../src/lib/prisma", () => ({ prisma: mockPrisma }));

import { createApp } from "../../src/app";
import { signAdminToken } from "../../src/utils/jwt";

const ADMIN_ID = "admin-1";
const REVIEW_ID = "44444444-4444-4444-4444-444444444444";

function authCookie() {
  const token = signAdminToken({ sub: ADMIN_ID, email: "admin@test.com", role: "SUPER_ADMIN" });
  return `admin_token=${token}`;
}

describe("Admin review moderation — security and updates", () => {
  const app = createApp();

  beforeEach(() => {
    resetPrismaMock();
    mockPrisma.adminUser.findUnique.mockResolvedValue({
      id: ADMIN_ID,
      email: "admin@test.com",
      role: "SUPER_ADMIN",
      isActive: true,
    });
  });

  it("rejects unauthenticated access to the admin reviews list", async () => {
    const res = await request(app).get("/api/admin/reviews");
    expect(res.status).toBe(401);
  });

  it("lists reviews with pagination metadata when authenticated", async () => {
    mockPrisma.review.findMany.mockResolvedValue([]);
    mockPrisma.review.count.mockResolvedValue(0);

    const res = await request(app).get("/api/admin/reviews?page=1&limit=20").set("Cookie", authCookie());

    expect(res.status).toBe(200);
    expect(res.body.data.pagination).toEqual({ page: 1, limit: 20, total: 0, totalPages: 1 });
  });

  it("filters reviews by status", async () => {
    mockPrisma.review.findMany.mockResolvedValue([]);
    mockPrisma.review.count.mockResolvedValue(0);

    const res = await request(app).get("/api/admin/reviews?status=PENDING").set("Cookie", authCookie());

    expect(res.status).toBe(200);
    expect(mockPrisma.review.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: "PENDING" } })
    );
  });

  it("rejects malformed input on status update", async () => {
    const res = await request(app)
      .patch(`/api/admin/reviews/${REVIEW_ID}`)
      .set("Cookie", authCookie())
      .send({ status: "NOT_A_REAL_STATUS" });
    expect(res.status).toBe(400);
  });

  it("approves a review", async () => {
    mockPrisma.review.findUnique.mockResolvedValue({ id: REVIEW_ID, status: "PENDING" });
    mockPrisma.review.update.mockResolvedValue({ id: REVIEW_ID, status: "APPROVED" });

    const res = await request(app)
      .patch(`/api/admin/reviews/${REVIEW_ID}`)
      .set("Cookie", authCookie())
      .send({ status: "APPROVED" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("APPROVED");
    expect(mockPrisma.review.update).toHaveBeenCalledWith({ where: { id: REVIEW_ID }, data: { status: "APPROVED" } });
  });

  it("rejects a review", async () => {
    mockPrisma.review.findUnique.mockResolvedValue({ id: REVIEW_ID, status: "PENDING" });
    mockPrisma.review.update.mockResolvedValue({ id: REVIEW_ID, status: "REJECTED" });

    const res = await request(app)
      .patch(`/api/admin/reviews/${REVIEW_ID}`)
      .set("Cookie", authCookie())
      .send({ status: "REJECTED" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("REJECTED");
  });

  it("returns 404 when updating a review that does not exist", async () => {
    mockPrisma.review.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .patch(`/api/admin/reviews/${REVIEW_ID}`)
      .set("Cookie", authCookie())
      .send({ status: "APPROVED" });

    expect(res.status).toBe(404);
  });

  it("deletes a review", async () => {
    mockPrisma.review.findUnique.mockResolvedValue({ id: REVIEW_ID, status: "PENDING" });
    mockPrisma.review.delete.mockResolvedValue({ id: REVIEW_ID });

    const res = await request(app).delete(`/api/admin/reviews/${REVIEW_ID}`).set("Cookie", authCookie());

    expect(res.status).toBe(200);
    expect(mockPrisma.review.delete).toHaveBeenCalledWith({ where: { id: REVIEW_ID } });
  });
});
