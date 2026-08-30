import type { NextFunction, Request, Response } from "express";
import type { AdminRole } from "@prisma/client";
import { ApiError } from "../utils/ApiError";
import { verifyAdminToken } from "../utils/jwt";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../lib/prisma";

function extractToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice("Bearer ".length);
  return req.cookies?.admin_token;
}

/** Verifies the JWT and confirms the admin account still exists and is active. */
export const authenticate = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized();

  let payload;
  try {
    payload = verifyAdminToken(token);
  } catch {
    throw ApiError.unauthorized("Invalid or expired session");
  }

  const admin = await prisma.adminUser.findUnique({ where: { id: payload.sub } });
  if (!admin || !admin.isActive) throw ApiError.unauthorized("Invalid or expired session");

  req.admin = { id: admin.id, email: admin.email, role: admin.role };
  next();
});

export function authorize(...roles: AdminRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.admin) return next(ApiError.unauthorized());
    if (roles.length > 0 && !roles.includes(req.admin.role)) {
      return next(ApiError.forbidden());
    }
    next();
  };
}
