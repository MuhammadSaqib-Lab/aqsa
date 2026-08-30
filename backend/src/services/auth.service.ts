import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { verifyPassword } from "../utils/password";
import { signAdminToken } from "../utils/jwt";
import type { LoginInput } from "../validators/auth.validators";

export async function loginAdmin(input: LoginInput) {
  const admin = await prisma.adminUser.findUnique({ where: { email: input.email } });
  if (!admin || !admin.isActive) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const valid = await verifyPassword(input.password, admin.passwordHash);
  if (!valid) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  await prisma.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });

  const token = signAdminToken({ sub: admin.id, email: admin.email, role: admin.role });

  return {
    token,
    admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
  };
}

export async function getAdminProfile(id: string) {
  const admin = await prisma.adminUser.findUnique({ where: { id } });
  if (!admin) throw ApiError.notFound("Admin account not found");
  return { id: admin.id, name: admin.name, email: admin.email, role: admin.role, lastLoginAt: admin.lastLoginAt };
}
