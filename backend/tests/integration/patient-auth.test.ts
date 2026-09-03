import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import request from "supertest";
import { mockPrisma, resetPrismaMock } from "../mocks/prisma.mock";

vi.mock("../../src/lib/prisma", () => ({ prisma: mockPrisma }));

import { createApp } from "../../src/app";
import { hashPassword } from "../../src/utils/password";
import { signAdminToken } from "../../src/utils/jwt";

const PATIENT = {
  id: "patient-1",
  name: "Test Patient",
  email: "patient@test.com",
  phone: "0300-1234567",
  isActive: true,
  lastLoginAt: null,
};

describe("Patient authentication", () => {
  const app = createApp();
  let passwordHash: string;

  beforeAll(async () => {
    passwordHash = await hashPassword("correct-horse-battery-staple");
  });

  beforeEach(() => {
    resetPrismaMock();
  });

  describe("signup", () => {
    it("creates an account and logs in immediately", async () => {
      mockPrisma.patient.findUnique.mockResolvedValueOnce(null); // no existing account
      mockPrisma.patient.create.mockResolvedValue({ ...PATIENT, passwordHash });

      const res = await request(app).post("/api/patient/auth/signup").send({
        name: PATIENT.name,
        email: PATIENT.email,
        phone: PATIENT.phone,
        password: "correct-horse-battery-staple",
      });

      expect(res.status).toBe(201);
      expect(res.body.data.patient.email).toBe(PATIENT.email);
      expect(res.body.data.patient.passwordHash).toBeUndefined();
      expect(res.headers["set-cookie"]?.[0]).toMatch(/patient_token=.*HttpOnly/i);
    });

    it("lowercases email so case variants can't create duplicate accounts", async () => {
      mockPrisma.patient.findUnique.mockResolvedValueOnce(null);
      mockPrisma.patient.create.mockResolvedValue({ ...PATIENT, passwordHash });

      await request(app).post("/api/patient/auth/signup").send({
        name: PATIENT.name,
        email: "Patient@Test.com",
        password: "correct-horse-battery-staple",
      });

      expect(mockPrisma.patient.findUnique).toHaveBeenCalledWith({ where: { email: "patient@test.com" } });
    });

    it("rejects a duplicate email", async () => {
      mockPrisma.patient.findUnique.mockResolvedValueOnce({ ...PATIENT, passwordHash });

      const res = await request(app).post("/api/patient/auth/signup").send({
        name: PATIENT.name,
        email: PATIENT.email,
        password: "correct-horse-battery-staple",
      });

      expect(res.status).toBe(409);
      expect(mockPrisma.patient.create).not.toHaveBeenCalled();
    });

    it("rejects a password shorter than 8 characters", async () => {
      const res = await request(app).post("/api/patient/auth/signup").send({
        name: PATIENT.name,
        email: PATIENT.email,
        password: "short",
      });

      expect(res.status).toBe(400);
      expect(mockPrisma.patient.create).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("logs in with correct credentials and sets an httpOnly cookie", async () => {
      mockPrisma.patient.findUnique.mockResolvedValue({ ...PATIENT, passwordHash });
      mockPrisma.patient.update.mockResolvedValue({ ...PATIENT, passwordHash });

      const res = await request(app)
        .post("/api/patient/auth/login")
        .send({ email: PATIENT.email, password: "correct-horse-battery-staple" });

      expect(res.status).toBe(200);
      expect(res.body.data.patient.email).toBe(PATIENT.email);
      expect(res.headers["set-cookie"]?.[0]).toMatch(/patient_token=.*HttpOnly/i);
    });

    it("rejects an incorrect password", async () => {
      mockPrisma.patient.findUnique.mockResolvedValue({ ...PATIENT, passwordHash });

      const res = await request(app)
        .post("/api/patient/auth/login")
        .send({ email: PATIENT.email, password: "wrong-password" });

      expect(res.status).toBe(401);
    });

    it("rejects an unknown email", async () => {
      mockPrisma.patient.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post("/api/patient/auth/login")
        .send({ email: "nobody@test.com", password: "whatever" });

      expect(res.status).toBe(401);
    });
  });

  describe("protected routes", () => {
    it("rejects access to /me without a session", async () => {
      const res = await request(app).get("/api/patient/auth/me");
      expect(res.status).toBe(401);
    });

    it("allows access to /me with a valid session cookie", async () => {
      mockPrisma.patient.findUnique.mockResolvedValue({ ...PATIENT, passwordHash });
      mockPrisma.patient.update.mockResolvedValue({ ...PATIENT, passwordHash });

      const agent = request.agent(app);
      const loginRes = await agent
        .post("/api/patient/auth/login")
        .send({ email: PATIENT.email, password: "correct-horse-battery-staple" });
      expect(loginRes.status).toBe(200);

      const meRes = await agent.get("/api/patient/auth/me");
      expect(meRes.status).toBe(200);
      expect(meRes.body.data.email).toBe(PATIENT.email);
    });

    it("rejects an admin token on a patient-protected route", async () => {
      // Signature-valid (same JWT_SECRET) but signed as an admin token — must
      // still be rejected because of the type discriminator, not just luck.
      const adminToken = signAdminToken({ sub: "admin-1", email: "admin@test.com", role: "SUPER_ADMIN" });

      const res = await request(app).get("/api/patient/auth/me").set("Cookie", `patient_token=${adminToken}`);

      expect(res.status).toBe(401);
    });
  });
});
