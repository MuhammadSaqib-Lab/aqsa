import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { verifyPatientToken } from "../utils/jwt";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../lib/prisma";

function extractToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice("Bearer ".length);
  return req.cookies?.patient_token;
}

/** Verifies the JWT and confirms the patient account still exists and is active. */
export const authenticatePatient = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized();

  let payload;
  try {
    payload = verifyPatientToken(token);
  } catch {
    throw ApiError.unauthorized("Invalid or expired session");
  }

  const patient = await prisma.patient.findUnique({ where: { id: payload.sub } });
  if (!patient || !patient.isActive) throw ApiError.unauthorized("Invalid or expired session");

  req.patient = { id: patient.id, email: patient.email, name: patient.name };
  next();
});
