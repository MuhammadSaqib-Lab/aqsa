import jwt from "jsonwebtoken";
import type { AdminRole } from "@prisma/client";
import { env } from "../config/env";

export interface AdminTokenPayload {
  sub: string;
  email: string;
  role: AdminRole;
  type: "admin";
}

export interface PatientTokenPayload {
  sub: string;
  email: string;
  type: "patient";
}

export function signAdminToken(payload: Omit<AdminTokenPayload, "type">): string {
  return jwt.sign({ ...payload, type: "admin" }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

/** Rejects a token that verifies (correct signature) but isn't actually an admin token — e.g. a patient token, since both share JWT_SECRET. */
export function verifyAdminToken(token: string): AdminTokenPayload {
  const payload = jwt.verify(token, env.JWT_SECRET) as AdminTokenPayload;
  if (payload.type !== "admin") throw new Error("Not an admin token");
  return payload;
}

export function signPatientToken(payload: Omit<PatientTokenPayload, "type">): string {
  return jwt.sign({ ...payload, type: "patient" }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

/** Rejects a token that verifies (correct signature) but isn't actually a patient token — e.g. an admin token, since both share JWT_SECRET. */
export function verifyPatientToken(token: string): PatientTokenPayload {
  const payload = jwt.verify(token, env.JWT_SECRET) as PatientTokenPayload;
  if (payload.type !== "patient") throw new Error("Not a patient token");
  return payload;
}
