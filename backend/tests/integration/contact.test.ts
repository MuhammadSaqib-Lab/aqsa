import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import { mockPrisma, resetPrismaMock } from "../mocks/prisma.mock";

vi.mock("../../src/lib/prisma", () => ({ prisma: mockPrisma }));

import { createApp } from "../../src/app";

const validPayload = {
  name: "Jane Doe",
  phone: "0300-1234567",
  email: "jane@example.com",
  message: "I'd like to ask about post-surgical rehab availability.",
};

describe("POST /api/contact", () => {
  const app = createApp();

  beforeEach(() => {
    resetPrismaMock();
  });

  it("accepts a valid message", async () => {
    mockPrisma.contactMessage.create.mockResolvedValue({ id: "22222222-2222-2222-2222-222222222222" });

    const res = await request(app).post("/api/contact").send(validPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe("22222222-2222-2222-2222-222222222222");
  });

  it("rejects a message missing required fields", async () => {
    const res = await request(app).post("/api/contact").send({ name: "Jane" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rate-limits repeated submissions from the same client", async () => {
    mockPrisma.contactMessage.create.mockResolvedValue({ id: "any" });

    let lastStatus = 200;
    for (let i = 0; i < 6; i += 1) {
      const res = await request(app).post("/api/contact").send(validPayload);
      lastStatus = res.status;
    }

    expect(lastStatus).toBe(429);
  });
});
