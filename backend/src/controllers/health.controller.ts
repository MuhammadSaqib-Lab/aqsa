import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../lib/prisma";

export const getHealth = (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "Aqsa Physiotherapy Centre API is running" });
};

/** Readiness check — also verifies the database connection. */
export const getReadiness = asyncHandler(async (_req: Request, res: Response) => {
  await prisma.$queryRaw`SELECT 1`;
  res.status(200).json({ success: true, message: "API and database are ready" });
});
