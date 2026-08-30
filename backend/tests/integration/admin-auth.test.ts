import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import request from "supertest";
import { mockPrisma, resetPrismaMock } from "../mocks/prisma.mock";

vi.mock("../../src/lib/prisma", () => ({ prisma: mockPrisma }));

import { createApp } from "../../src/app";
import { hashPassword } from "../../src/utils/password";

const ADMIN = {
  id: "admin-1",
  name: "Test Admin",
  email: "admin@test.com",
  role: "SUPER_ADMIN" as const,
  isActive: true,
  lastLoginAt: null,
};

describe("Admin authentication", () => {
  const app = createApp();
  let passwordHash: string;

  beforeAll(async () => {
    passwordHash = await hashPassword("correct-horse-battery-staple");
  });

  beforeEach(() => {
    resetPrismaMock();
  });

  it("logs in with correct credentials and sets an httpOnly cookie", async () => {
    mockPrisma.adminUser.findUnique.mockResolvedValue({ ...ADMIN, passwordHash });
    mockPrisma.adminUser.update.mockResolvedValue({ ...ADMIN, passwordHash });

    const res = await request(app)
      .post("/api/admin/auth/login")
      .send({ email: ADMIN.email, password: "correct-horse-battery-staple" });

    expect(res.status).toBe(200);
    expect(res.body.data.admin.email).toBe(ADMIN.email);
    expect(res.body.data.admin.passwordHash).toBeUndefined();
    expect(res.headers["set-cookie"]?.[0]).toMatch(/admin_token=.*HttpOnly/i);
  });

  it("rejects an incorrect password", async () => {
    mockPrisma.adminUser.findUnique.mockResolvedValue({ ...ADMIN, passwordHash });

    const res = await request(app)
      .post("/api/admin/auth/login")
      .send({ email: ADMIN.email, password: "wrong-password" });

    expect(res.status).toBe(401);
  });

  it("rejects an unknown email", async () => {
    mockPrisma.adminUser.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/admin/auth/login")
      .send({ email: "nobody@test.com", password: "whatever" });

    expect(res.status).toBe(401);
  });

  it("rejects access to a protected route without a session", async () => {
    const res = await request(app).get("/api/admin/auth/me");
    expect(res.status).toBe(401);
  });

  it("allows access to a protected route with a valid session cookie", async () => {
    mockPrisma.adminUser.findUnique.mockResolvedValue({ ...ADMIN, passwordHash });
    mockPrisma.adminUser.update.mockResolvedValue({ ...ADMIN, passwordHash });

    const agent = request.agent(app);
    const loginRes = await agent
      .post("/api/admin/auth/login")
      .send({ email: ADMIN.email, password: "correct-horse-battery-staple" });
    expect(loginRes.status).toBe(200);

    const meRes = await agent.get("/api/admin/auth/me");
    expect(meRes.status).toBe(200);
    expect(meRes.body.data.email).toBe(ADMIN.email);
  });
});
