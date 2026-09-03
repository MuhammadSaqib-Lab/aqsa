import type { CookieOptions, Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { ApiError } from "../../utils/ApiError";
import * as patientAuthService from "../../services/patient-auth.service";
import type { LoginInput, SignupInput } from "../../validators/patient.validators";
import { isProduction } from "../../config/env";

const COOKIE_NAME = "patient_token";

/** Same cross-site requirement as the admin cookie — see admin/auth.controller.ts. */
function cookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  };
}

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { token, patient } = await patientAuthService.signupPatient(req.body as SignupInput);
  res.cookie(COOKIE_NAME, token, cookieOptions());
  sendSuccess(res, { patient, token }, "Account created successfully", 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { token, patient } = await patientAuthService.loginPatient(req.body as LoginInput);
  res.cookie(COOKIE_NAME, token, cookieOptions());
  sendSuccess(res, { patient, token }, "Logged in successfully");
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions(), maxAge: undefined });
  sendSuccess(res, null, "Logged out successfully");
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.patient) throw ApiError.unauthorized();
  const profile = await patientAuthService.getPatientProfile(req.patient.id);
  sendSuccess(res, profile, "Current patient profile");
});
