import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  PORT: z.coerce.number().int().positive().default(5000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  FRONTEND_URL: z.string().min(1).default("http://localhost:5173"),

  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  JWT_EXPIRES_IN: z.string().default("1d"),

  ADMIN_EMAIL: z.string().optional(),
  ADMIN_PASSWORD: z.string().optional(),

  SMTP_HOST: z.string().optional().default(""),
  SMTP_PORT: z.coerce.number().int().positive().optional().default(587),
  SMTP_USER: z.string().optional().default(""),
  SMTP_PASSWORD: z.string().optional().default(""),
  EMAIL_FROM: z.string().optional().default(""),
  CLINIC_NOTIFICATION_EMAIL: z.string().optional().default(""),

  CLINIC_TIMEZONE: z.string().default("Asia/Karachi"),
  CLINIC_OPEN_TIME: z.string().default("09:00"),
  CLINIC_CLOSE_TIME: z.string().default("20:00"),
  CLINIC_SLOT_MINUTES: z.coerce.number().int().positive().default(30),
  CLINIC_WORKING_DAYS: z.string().default("1,2,3,4,5,6"),

  ENABLE_API_DOCS: z
    .string()
    .optional()
    .default("false")
    .transform((v) => v === "true"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration — check .env against .env.example");
}

export const env = parsed.data;

export const isProduction = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";

/**
 * Recovers a plain origin from a value someone pasted as a rendered markdown
 * link — `[https://example.com](https://example.com)` — instead of the bare
 * URL. This has repeatedly been how FRONTEND_URL/VITE_API_URL get
 * misconfigured in practice, so this is deliberately defensive rather than
 * assuming operators will always paste clean values. Also strips a trailing
 * slash so origin comparisons ("https://x.com" vs "https://x.com/") don't
 * fail on that alone.
 */
export function sanitizeOrigin(raw: string): string {
  const trimmed = raw.trim();
  const markdownLink = trimmed.match(/^\[(https?:\/\/[^\]]+)\]\(https?:\/\/[^)]+\)$/);
  const url = markdownLink ? markdownLink[1] : trimmed;
  return url.replace(/\/$/, "");
}

/** Comma-separated FRONTEND_URL supports multiple allowed origins. */
export const allowedOrigins = env.FRONTEND_URL.split(",")
  .map((s) => sanitizeOrigin(s))
  .filter(Boolean);
