import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import { mockPrisma, resetPrismaMock } from "../mocks/prisma.mock";

vi.mock("../../src/lib/prisma", () => ({ prisma: mockPrisma }));

import { createApp } from "../../src/app";
import { signAdminToken } from "../../src/utils/jwt";

const ADMIN_ID = "admin-1";
const APPOINTMENT_ID = "33333333-3333-3333-3333-333333333333";

function authCookie() {
  const token = signAdminToken({ sub: ADMIN_ID, email: "admin@test.com", role: "SUPER_ADMIN" });
  return `admin_token=${token}`;
}

describe("Admin appointment management — security and updates", () => {
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

  it("rejects unauthenticated access to the admin appointments list", async () => {
    const res = await request(app).get("/api/admin/appointments");
    expect(res.status).toBe(401);
  });

  it("rejects a malformed/invalid token", async () => {
    const res = await request(app)
      .get("/api/admin/appointments")
      .set("Cookie", "admin_token=not-a-real-jwt");
    expect(res.status).toBe(401);
  });

  it("rejects malformed input on status update", async () => {
    const res = await request(app)
      .patch(`/api/admin/appointments/${APPOINTMENT_ID}`)
      .set("Cookie", authCookie())
      .send({ status: "NOT_A_REAL_STATUS" });
    expect(res.status).toBe(400);
  });

  it("lists appointments with pagination metadata when authenticated", async () => {
    mockPrisma.appointment.findMany.mockResolvedValue([]);
    mockPrisma.appointment.count.mockResolvedValue(0);

    const res = await request(app)
      .get("/api/admin/appointments?page=1&limit=20")
      .set("Cookie", authCookie());

    expect(res.status).toBe(200);
    expect(res.body.data.pagination).toEqual({ page: 1, limit: 20, total: 0, totalPages: 1 });
  });

  it("updates an appointment's status", async () => {
    mockPrisma.appointment.findUnique.mockResolvedValue({ id: APPOINTMENT_ID, status: "PENDING" });
    mockPrisma.appointment.update.mockResolvedValue({ id: APPOINTMENT_ID, status: "CONFIRMED" });

    const res = await request(app)
      .patch(`/api/admin/appointments/${APPOINTMENT_ID}`)
      .set("Cookie", authCookie())
      .send({ status: "CONFIRMED" });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("CONFIRMED");
    expect(mockPrisma.appointment.update).toHaveBeenCalledWith({
      where: { id: APPOINTMENT_ID },
      data: { status: "CONFIRMED" },
    });
  });

  it("returns 404 when updating an appointment that does not exist", async () => {
    mockPrisma.appointment.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .patch(`/api/admin/appointments/${APPOINTMENT_ID}`)
      .set("Cookie", authCookie())
      .send({ status: "CANCELLED" });

    expect(res.status).toBe(404);
  });
});
