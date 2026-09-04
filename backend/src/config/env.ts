import "dotenv/config";
import { z } from "zod";

/**
 * Recovers a plain value from something pasted as a rendered markdown link —
 * `[smtp.gmail.com](smtp.gmail.com)` instead of the bare value. This exact
 * paste mistake has repeatedly corrupted FRONTEND_URL/VITE_API_URL in this
 * project's Render/Vercel env vars, so SMTP_HOST and friends are sanitized
 * the same defensive way rather than assuming a clean paste.
 */
function stripMarkdownLink(raw: string): string {
  const trimmed = raw.trim();
  const match = trimmed.match(/^\[([^\]]+)\]\([^)]+\)$/);
  return match ? match[1].trim() : trimmed;
}

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  PORT: z.coerce.number().int().positive().default(5000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  FRONTEND_URL: z.string().min(1).default("http://localhost:5173"),

  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  JWT_EXPIRES_IN: z.string().default("1d"),

  ADMIN_EMAIL: z.string().optional(),
  ADMIN_PASSWORD: z.string().optional(),

  // Resend (HTTPS API) — not SMTP. Render blocks/throttles outbound SMTP
  // ports on its free/standard plans, which made Nodemailer+SMTP time out
  // (ETIMEDOUT) in production; an HTTPS-based provider avoids that entirely.
  RESEND_API_KEY: z.string().optional().default("").transform(stripMarkdownLink),
  EMAIL_FROM: z.string().optional().default("").transform(stripMarkdownLink),
  CLINIC_NOTIFICATION_EMAIL: z.string().optional().default("").transform(stripMarkdownLink),

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
