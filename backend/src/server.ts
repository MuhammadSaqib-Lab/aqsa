import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { prisma } from "./lib/prisma";

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`Aqsa Physiotherapy Centre API listening on port ${env.PORT} (${env.NODE_ENV})`);
  if (env.SMTP_HOST) {
    logger.info(
      { smtpHost: env.SMTP_HOST, smtpPort: env.SMTP_PORT, emailFrom: env.EMAIL_FROM || env.SMTP_USER },
      "Email notifications ENABLED"
    );
  } else {
    // Log presence (not values) of each related var so a misnamed/blank key
    // in the hosting provider's dashboard is visible without exposing secrets.
    logger.warn(
      {
        SMTP_HOST: JSON.stringify(process.env.SMTP_HOST ?? null),
        SMTP_PORT_set: process.env.SMTP_PORT !== undefined,
        SMTP_USER_set: Boolean(process.env.SMTP_USER),
        SMTP_PASSWORD_set: Boolean(process.env.SMTP_PASSWORD),
        EMAIL_FROM_set: Boolean(process.env.EMAIL_FROM),
      },
      "Email notifications DISABLED — SMTP_HOST resolved to empty. Appointment/contact submissions still work; " +
        "patients and the clinic just won't receive emails until SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASSWORD are " +
        "set on THIS service in the hosting provider's dashboard (exact key names, no extra whitespace) and the " +
        "service is redeployed."
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
