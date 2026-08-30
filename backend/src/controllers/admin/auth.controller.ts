import type { CookieOptions, Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { ApiError } from "../../utils/ApiError";
import * as authService from "../../services/auth.service";
import type { LoginInput } from "../../validators/auth.validators";
import { isProduction } from "../../config/env";

const COOKIE_NAME = "admin_token";

function cookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  };
}

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { token, admin } = await authService.loginAdmin(req.body as LoginInput);
  res.cookie(COOKIE_NAME, token, cookieOptions());
  sendSuccess(res, { admin, token }, "Logged in successfully");
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions(), maxAge: undefined });
  sendSuccess(res, null, "Logged out successfully");
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.admin) throw ApiError.unauthorized();
  const profile = await authService.getAdminProfile(req.admin.id);
  sendSuccess(res, profile, "Current admin profile");
});
