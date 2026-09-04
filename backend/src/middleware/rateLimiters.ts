import rateLimit from "express-rate-limit";

const jsonHandler = (message: string) => (_req: unknown, res: import("express").Response) => {
  res.status(429).json({ success: false, message });
};

/** Generous default applied to all /api traffic. */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler("Too many requests. Please try again later."),
});

/**
 * Public form submissions — tighter to deter spam/abuse. Appointment and
 * contact each get their own instance/counter: they're independent forms,
 * and a visitor correcting a few validation mistakes on one shouldn't burn
 * through their allowance on the other.
 */
export const appointmentSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler("Too many submissions from this device. Please try again later or call us directly."),
});

export const contactSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler("Too many submissions from this device. Please try again later or call us directly."),
});

export const reviewSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler("Too many submissions from this device. Please try again later or call us directly."),
});

/** Admin login — brute-force protection. */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: jsonHandler("Too many login attempts. Please try again later."),
});

/** Patient signup — deter spam account creation. */
export const patientSignupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler("Too many accounts created from this device. Please try again later."),
});

/** Patient login — brute-force protection, same shape as the admin one. */
export const patientLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: jsonHandler("Too many login attempts. Please try again later."),
});
