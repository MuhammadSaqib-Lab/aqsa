import { describe, it, expect, vi } from "vitest";
import request from "supertest";

const mockCreate = vi.fn();

vi.mock("@anthropic-ai/sdk", () => {
  class MockAnthropic {
    messages = { create: mockCreate };
  }
  class RateLimitError extends Error {}
  class AuthenticationError extends Error {}
  class APIError extends Error {}
  return { default: Object.assign(MockAnthropic, { RateLimitError, AuthenticationError, APIError }) };
});

import { createApp } from "../../src/app";

describe("Chat endpoint", () => {
  const app = createApp();

  it("rejects an empty message list", async () => {
    const res = await request(app).post("/api/chat").send({ messages: [] });
    expect(res.status).toBe(400);
  });

  it("rejects an invalid role", async () => {
    const res = await request(app)
      .post("/api/chat")
      .send({ messages: [{ role: "system", content: "hi" }] });
    expect(res.status).toBe(400);
  });

  it("returns a clean error when ANTHROPIC_API_KEY is not set", async () => {
    // tests/setup.ts sets ANTHROPIC_API_KEY = "" for the whole suite.
    const res = await request(app)
      .post("/api/chat")
      .send({ messages: [{ role: "user", content: "What are your clinic hours?" }] });

    expect(res.status).toBe(500);
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
