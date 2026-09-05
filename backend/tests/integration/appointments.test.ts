import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import { mockPrisma, resetPrismaMock } from "../mocks/prisma.mock";

vi.mock("../../src/lib/prisma", () => ({ prisma: mockPrisma }));

// This file's test count exceeds the real submission limiter's threshold
// (by design — the limiter protects real visitors, not test coverage), and
// the limiter is a module-level singleton shared across every createApp()
// call, so a fresh app per test wouldn't reset it either. Bypass just this
// one limiter here; its own behavior is covered by contact.test.ts.
vi.mock("../../src/middleware/rateLimiters", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/middleware/rateLimiters")>();
  return { ...actual, appointmentSubmissionLimiter: (_req: unknown, _res: unknown, next: () => void) => next() };
});

// Imported after the mocks above are registered so the app picks up both.
import { createApp } from "../../src/app";
import { signPatientToken } from "../../src/utils/jwt";

function futureDate(daysAhead = 7): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

const PATIENT = {
  id: "patient-1",
  name: "Test Patient",
  email: "patient@example.com",
  phone: "0300-1234567",
  isActive: true,
};

function authCookie() {
  const token = signPatientToken({ sub: PATIENT.id, email: PATIENT.email });
  return `patient_token=${token}`;
}

const validPayload = {
  fullName: "Test Patient",
  phone: "0300-1234567",
  gender: "MALE",
  preferredDate: futureDate(),
  preferredTime: "10:30",
  service: "Back & Neck Pain",
  message: "Lower back pain for two weeks.",
};

describe("POST /api/appointments", () => {
  const app = createApp();

  beforeEach(() => {
    resetPrismaMock();
    mockPrisma.patient.findUnique.mockResolvedValue(PATIENT);
  });

  it("rejects an unauthenticated submission", async () => {
    const res = await request(app).post("/api/appointments").send(validPayload);
    expect(res.status).toBe(401);
  });

  it("accepts a valid appointment from a logged-in patient and creates it as PENDING", async () => {
    mockPrisma.appointment.findFirst.mockResolvedValue(null); // slot free
    mockPrisma.appointment.create.mockResolvedValue({
      id: "11111111-1111-1111-1111-111111111111",
      ...validPayload,
      email: PATIENT.email,
      status: "PENDING",
    });

    const res = await request(app)
      .post("/api/appointments")
      .set("Cookie", authCookie())
      .send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe("11111111-1111-1111-1111-111111111111");
    expect(mockPrisma.appointment.create).toHaveBeenCalledTimes(1);
    // The stored email is always the authenticated account's, never client-supplied.
    expect(mockPrisma.appointment.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ patientId: PATIENT.id, email: PATIENT.email }) })
    );
  });

  it("rejects an empty submission with field errors", async () => {
    const res = await request(app).post("/api/appointments").set("Cookie", authCookie()).send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it("rejects a past date", async () => {
    const res = await request(app)
      .post("/api/appointments")
      .set("Cookie", authCookie())
      .send({ ...validPayload, preferredDate: "2000-01-01" });
    expect(res.status).toBe(400);
    expect(res.body.errors.some((e: { path: string }) => e.path === "preferredDate")).toBe(true);
  });

  it("rejects an unknown service", async () => {
    const res = await request(app)
      .post("/api/appointments")
      .set("Cookie", authCookie())
      .send({ ...validPayload, service: "Not A Real Service" });
    expect(res.status).toBe(400);
  });

  it("rejects a duplicate booking for an already-taken slot", async () => {
    mockPrisma.appointment.findFirst.mockResolvedValue({ id: "existing" });

    const res = await request(app)
      .post("/api/appointments")
      .set("Cookie", authCookie())
      .send(validPayload);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(mockPrisma.appointment.create).not.toHaveBeenCalled();
  });

  it("defaults visitType to CLINIC when omitted, for backward compatibility", async () => {
    mockPrisma.appointment.findFirst.mockResolvedValue(null);
    mockPrisma.appointment.create.mockResolvedValue({
      id: "11111111-1111-1111-1111-111111111111",
      ...validPayload,
      email: PATIENT.email,
      status: "PENDING",
      visitType: "CLINIC",
    });

    const res = await request(app).post("/api/appointments").set("Cookie", authCookie()).send(validPayload);

    expect(res.status).toBe(201);
    expect(mockPrisma.appointment.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ visitType: "CLINIC", homeAddress: null }) })
    );
  });

  it("rejects a home visit request with no home address", async () => {
    const res = await request(app)
      .post("/api/appointments")
      .set("Cookie", authCookie())
      .send({ ...validPayload, visitType: "HOME" });

    expect(res.status).toBe(400);
    expect(res.body.errors.some((e: { path: string }) => e.path === "homeAddress")).toBe(true);
  });

  it("accepts a home visit request with a home address", async () => {
    mockPrisma.appointment.findFirst.mockResolvedValue(null);
    mockPrisma.appointment.create.mockResolvedValue({
      id: "11111111-1111-1111-1111-111111111111",
      ...validPayload,
      email: PATIENT.email,
      status: "PENDING",
      visitType: "HOME",
      homeAddress: "House 12, Street 4, Haripur",
    });

    const res = await request(app)
      .post("/api/appointments")
      .set("Cookie", authCookie())
      .send({ ...validPayload, visitType: "HOME", homeAddress: "House 12, Street 4, Haripur" });

    expect(res.status).toBe(201);
    expect(mockPrisma.appointment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ visitType: "HOME", homeAddress: "House 12, Street 4, Haripur" }),
      })
    );
  });

  it("rejects a submission with no gender", async () => {
    const payloadWithoutGender: Partial<typeof validPayload> = { ...validPayload };
    delete payloadWithoutGender.gender;
    const res = await request(app).post("/api/appointments").set("Cookie", authCookie()).send(payloadWithoutGender);
    expect(res.status).toBe(400);
    expect(res.body.errors.some((e: { path: string }) => e.path === "gender")).toBe(true);
  });

  it("rejects an invalid gender value", async () => {
    const res = await request(app)
      .post("/api/appointments")
      .set("Cookie", authCookie())
      .send({ ...validPayload, gender: "OTHER" });
    expect(res.status).toBe(400);
    expect(res.body.errors.some((e: { path: string }) => e.path === "gender")).toBe(true);
  });

  it("accepts a valid gender and stores it", async () => {
    mockPrisma.appointment.findFirst.mockResolvedValue(null);
    mockPrisma.appointment.create.mockResolvedValue({
      id: "11111111-1111-1111-1111-111111111111",
      ...validPayload,
      email: PATIENT.email,
      status: "PENDING",
      gender: "FEMALE",
    });

    const res = await request(app)
      .post("/api/appointments")
      .set("Cookie", authCookie())
      .send({ ...validPayload, gender: "FEMALE" });

    expect(res.status).toBe(201);
    expect(mockPrisma.appointment.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ gender: "FEMALE" }) })
    );
  });
});
