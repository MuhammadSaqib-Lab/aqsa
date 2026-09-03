import type { Appointment, AppointmentStatus, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { buildPaginationMeta, toSkipTake } from "../utils/pagination";
import type { PaginatedData } from "../types/api";
import type { CreateAppointmentInput } from "../validators/appointment.validators";
import { isSlotTaken } from "./availability.service";
import {
  notifyClinicOfNewAppointment,
  notifyPatientOfAppointmentReceived,
  notifyPatientOfStatusChange,
} from "./email.service";

/**
 * Booking now always happens through an authenticated patient session, so
 * the stored contact email is always the account's real email — never a
 * value copied from the request body — to remove any "email a stranger"
 * vector through the booking form.
 */
export async function createAppointment(
  input: CreateAppointmentInput,
  patient: { id: string; email: string }
): Promise<Appointment> {
  const taken = await isSlotTaken(input.preferredDate, input.preferredTime);
  if (taken) {
    throw ApiError.conflict(
      "This time slot is already booked. Please choose a different date or time."
    );
  }

  const appointment = await prisma.appointment.create({
    data: {
      patientId: patient.id,
      patientName: input.fullName,
      phone: input.phone,
      email: patient.email,
      preferredDate: new Date(`${input.preferredDate}T00:00:00.000Z`),
      preferredTime: input.preferredTime,
      service: input.service,
      message: input.message || null,
    },
  });

  notifyClinicOfNewAppointment({
    patientName: appointment.patientName,
    phone: appointment.phone,
    email: appointment.email,
    preferredDate: input.preferredDate,
    preferredTime: appointment.preferredTime,
    service: appointment.service,
    message: appointment.message,
  });
  notifyPatientOfAppointmentReceived({
    patientEmail: appointment.email as string,
    patientName: appointment.patientName,
    preferredDate: input.preferredDate,
    preferredTime: appointment.preferredTime,
  });

  return appointment;
}

export interface AppointmentFilters {
  page: number;
  limit: number;
  status?: AppointmentStatus;
  date?: string;
  search?: string;
}

export async function listAppointments(
  filters: AppointmentFilters
): Promise<PaginatedData<Appointment>> {
  const where: Prisma.AppointmentWhereInput = {};
  if (filters.status) where.status = filters.status;
  if (filters.date) where.preferredDate = new Date(`${filters.date}T00:00:00.000Z`);
  if (filters.search) {
    where.OR = [
      { patientName: { contains: filters.search, mode: "insensitive" } },
      { phone: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const { skip, take } = toSkipTake(filters);
  const [items, total] = await prisma.$transaction([
    prisma.appointment.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
    prisma.appointment.count({ where }),
  ]);

  return { items, pagination: buildPaginationMeta(filters.page, filters.limit, total) };
}

export async function getAppointmentById(id: string): Promise<Appointment> {
  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) throw ApiError.notFound("Appointment not found");
  return appointment;
}

export async function updateAppointment(
  id: string,
  data: { status?: AppointmentStatus; adminNotes?: string }
): Promise<Appointment> {
  const existing = await getAppointmentById(id);
  const updated = await prisma.appointment.update({ where: { id }, data });

  if (data.status && data.status !== existing.status && updated.email) {
    notifyPatientOfStatusChange({
      patientEmail: updated.email,
      patientName: updated.patientName,
      status: updated.status,
      preferredDate: updated.preferredDate.toISOString().slice(0, 10),
      preferredTime: updated.preferredTime,
    });
  }

  return updated;
}

export async function deleteAppointment(id: string): Promise<void> {
  await getAppointmentById(id);
  await prisma.appointment.delete({ where: { id } });
}

/**
 * Explicit field whitelist for patient-facing responses — deliberately not a
 * reuse of listAppointments with a bolted-on filter, so a future admin-only
 * field (like adminNotes today) can never leak here just because someone
 * forgot to update a blacklist.
 */
const PATIENT_SAFE_SELECT = {
  id: true,
  patientName: true,
  phone: true,
  email: true,
  preferredDate: true,
  preferredTime: true,
  service: true,
  message: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.AppointmentSelect;

export type PatientAppointmentView = Prisma.AppointmentGetPayload<{ select: typeof PATIENT_SAFE_SELECT }>;

export interface PatientAppointmentFilters {
  page: number;
  limit: number;
}

/** patientId must come from the authenticated session in the caller — never from client input. */
export async function listPatientAppointments(
  patientId: string,
  filters: PatientAppointmentFilters
): Promise<PaginatedData<PatientAppointmentView>> {
  const where: Prisma.AppointmentWhereInput = { patientId };
  const { skip, take } = toSkipTake(filters);

  const [items, total] = await prisma.$transaction([
    prisma.appointment.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, select: PATIENT_SAFE_SELECT }),
    prisma.appointment.count({ where }),
  ]);

  return { items, pagination: buildPaginationMeta(filters.page, filters.limit, total) };
}
