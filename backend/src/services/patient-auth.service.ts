import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { hashPassword, verifyPassword } from "../utils/password";
import { signPatientToken } from "../utils/jwt";
import type { LoginInput, SignupInput } from "../validators/patient.validators";

function toSafeProfile(patient: { id: string; name: string; email: string; phone: string | null }) {
  return { id: patient.id, name: patient.name, email: patient.email, phone: patient.phone };
}

export async function signupPatient(input: SignupInput) {
  const existing = await prisma.patient.findUnique({ where: { email: input.email } });
  if (existing) {
    throw ApiError.conflict("An account with this email already exists. Please log in instead.");
  }

  const passwordHash = await hashPassword(input.password);
  const patient = await prisma.patient.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone || null,
      passwordHash,
      lastLoginAt: new Date(),
    },
  });

  const token = signPatientToken({ sub: patient.id, email: patient.email });
  return { token, patient: toSafeProfile(patient) };
}

export async function loginPatient(input: LoginInput) {
  const patient = await prisma.patient.findUnique({ where: { email: input.email } });
  if (!patient || !patient.isActive) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const valid = await verifyPassword(input.password, patient.passwordHash);
  if (!valid) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  await prisma.patient.update({ where: { id: patient.id }, data: { lastLoginAt: new Date() } });

  const token = signPatientToken({ sub: patient.id, email: patient.email });
  return { token, patient: toSafeProfile(patient) };
}

export async function getPatientProfile(id: string) {
  const patient = await prisma.patient.findUnique({ where: { id } });
  if (!patient) throw ApiError.notFound("Patient account not found");
  return toSafeProfile(patient);
}
