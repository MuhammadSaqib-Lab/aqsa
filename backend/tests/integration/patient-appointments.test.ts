import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import { mockPrisma, resetPrismaMock } from "../mocks/prisma.mock";

vi.mock("../../src/lib/prisma", () => ({ prisma: mockPrisma }));

import { createApp } from "../../src/app";
import { signPatientToken } from "../../src/utils/jwt";

const PATIENT_A = { id: "patient-a", name: "Patient A", email: "a@test.com", isActive: true };
const PATIENT_B = { id: "patient-b", name: "Patient B", email: "b@test.com", isActive: true };

function cookieFor(patient: { id: string; email: string }) {
  return `patient_token=${signPatientToken({ sub: patient.id, email: patient.email })}`;
}

const APPOINTMENT_A = {
  id: "22222222-2222-2222-2222-222222222222",
  patientName: "Patient A",
  phone: "0300-1111111",
  email: PATIENT_A.email,
  preferredDate: new Date("2026-10-01T00:00:00.000Z"),
  preferredTime: "10:00",
  service: "Pain Management",
  message: null,
  status: "PENDING",
  adminNotes: "Internal note — must never reach the patient.",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("GET /api/patient/appointments", () => {
  const app = createApp();

  beforeEach(() => {
    resetPrismaMock();
  });

  it("rejects an unauthenticated request", async () => {
    const res = await request(app).get("/api/patient/appointments");
    expect(res.status).toBe(401);
  });

  it("only ever queries the authenticated patient's own appointments, never a client-supplied id", async () => {
    mockPrisma.patient.findUnique.mockResolvedValue(PATIENT_A);
    mockPrisma.appointment.findMany.mockResolvedValue([APPOINTMENT_A]);
    mockPrisma.appointment.count.mockResolvedValue(1);

    // Attempt to smuggle a different patientId via query string — must be ignored.
    const res = await request(app)
      .get("/api/patient/appointments?patientId=patient-b")
      .set("Cookie", cookieFor(PATIENT_A));

    expect(res.status).toBe(200);
    expect(mockPrisma.appointment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { patientId: PATIENT_A.id } })
    );
  });

  it("never includes adminNotes in the response, not even as null", async () => {
    mockPrisma.patient.findUnique.mockResolvedValue(PATIENT_A);
    // The mock returns whatever we tell it to, but the real Prisma `select`
    // clause is what actually strips adminNotes in production — this test
    // pins the contract at the HTTP/JSON level regardless.
    mockPrisma.appointment.findMany.mockResolvedValue([
      {
        id: APPOINTMENT_A.id,
        patientName: APPOINTMENT_A.patientName,
        phone: APPOINTMENT_A.phone,
        email: APPOINTMENT_A.email,
        preferredDate: APPOINTMENT_A.preferredDate,
        preferredTime: APPOINTMENT_A.preferredTime,
        service: APPOINTMENT_A.service,
        message: APPOINTMENT_A.message,
        status: APPOINTMENT_A.status,
        createdAt: APPOINTMENT_A.createdAt,
        updatedAt: APPOINTMENT_A.updatedAt,
      },
    ]);
    mockPrisma.appointment.count.mockResolvedValue(1);

    const res = await request(app).get("/api/patient/appointments").set("Cookie", cookieFor(PATIENT_A));

    expect(res.status).toBe(200);
    expect(res.body.data.items[0]).not.toHaveProperty("adminNotes");
  });

  it("verifies the real Prisma select clause excludes adminNotes (not just the test fixture)", async () => {
    mockPrisma.patient.findUnique.mockResolvedValue(PATIENT_A);
    mockPrisma.appointment.findMany.mockResolvedValue([]);
    mockPrisma.appointment.count.mockResolvedValue(0);

    await request(app).get("/api/patient/appointments").set("Cookie", cookieFor(PATIENT_A));

    const call = mockPrisma.appointment.findMany.mock.calls[0][0];
    expect(call.select).toBeDefined();
    expect(call.select.adminNotes).toBeUndefined();
    expect(call.select.patientId).toBeUndefined();
  });

  it("patient B can never see patient A's appointment", async () => {
    mockPrisma.patient.findUnique.mockResolvedValue(PATIENT_B);
    mockPrisma.appointment.findMany.mockResolvedValue([]); // real DB would return none for patient-b
    mockPrisma.appointment.count.mockResolvedValue(0);

    const res = await request(app).get("/api/patient/appointments").set("Cookie", cookieFor(PATIENT_B));

    expect(res.status).toBe(200);
    expect(mockPrisma.appointment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { patientId: PATIENT_B.id } })
    );
    expect(res.body.data.items).toEqual([]);
  });
});
