import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { prisma } from "./lib/prisma";

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`Aqsa Physiotherapy Centre API listening on port ${env.PORT} (${env.NODE_ENV})`);
  if (env.RESEND_API_KEY && env.EMAIL_FROM) {
    logger.info({ emailFrom: env.EMAIL_FROM }, "Email notifications ENABLED (Resend API)");
  } else {
    // Log presence (not values) of each related var so a misnamed/blank key
    // in the hosting provider's dashboard is visible without exposing secrets.
    logger.warn(
      {
        RESEND_API_KEY_set: Boolean(process.env.RESEND_API_KEY),
        EMAIL_FROM_set: Boolean(process.env.EMAIL_FROM),
      },
      "Email notifications DISABLED — RESEND_API_KEY and/or EMAIL_FROM resolved to empty. Appointment/contact " +
        "submissions still work; patients and the clinic just won't receive emails until both are set on THIS " +
        "service in the hosting provider's dashboard (exact key names, no extra whitespace) and the service is " +
        "redeployed."
    );
  }
});

async function shutdown(signal: string) {
  logger.info(`${signal} received — shutting down`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  logger.error({ err: reason }, "Unhandled promise rejection");
});
