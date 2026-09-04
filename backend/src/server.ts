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
    logger.warn(
      "Email notifications DISABLED — SMTP_HOST is not set. Appointment/contact submissions still work; " +
        "patients and the clinic just won't receive emails until SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASSWORD are configured."
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
