import pino from "pino";
import { env, isProduction } from "./env";

/**
 * Structured logger. Never pass request bodies, headers, tokens, or
 * passwords into log calls — the redact list below is a safety net, not
 * a substitute for keeping secrets out of log calls in the first place.
 */
export const logger = pino({
  level: env.NODE_ENV === "test" ? "silent" : "info",
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "*.password",
      "*.passwordHash",
      "*.token",
      "*.jwt",
    ],
    censor: "[redacted]",
  },
  transport: isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: { colorize: true, translateTime: "HH:MM:ss", ignore: "pid,hostname" },
      },
});
