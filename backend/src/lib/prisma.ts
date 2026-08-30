import { PrismaClient } from "@prisma/client";
import { isProduction } from "../config/env";

declare global {
  var __prisma: PrismaClient | undefined;
}

/**
 * Singleton PrismaClient. Reused across hot reloads in dev (tsx watch
 * restarts the module but not the process boundary the same way Next.js
 * dev does, but guarding against duplicate clients is cheap and safe).
 */
export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: isProduction ? ["error", "warn"] : ["warn", "error"],
  });

if (!isProduction) {
  global.__prisma = prisma;
}
