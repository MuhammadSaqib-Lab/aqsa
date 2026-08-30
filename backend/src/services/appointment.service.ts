import type { Appointment, AppointmentStatus, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { buildPaginationMeta, toSkipTake } from "../utils/pagination";
import type { PaginatedData } from "../types/api";
import type { CreateAppointmentInput } from "../validators/appointment.validators";
import { isSlotTaken } from "./availability.service";
import { notifyClinicOfNewAppointment, notifyPatientOfAppointmentReceived } from "./email.service";

export async function createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
  const taken = await isSlotTaken(input.preferredDate, input.preferredTime);
  if (taken) {
    throw ApiError.conflict(
      "This time slot is already booked. Please choose a different date or time."
    );
  }

  const appointment = await prisma.appointment.create({
    data: {
      patientName: input.fullName,
      phone: input.phone,
      email: input.email || null,
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
  if (appointment.email) {
    notifyPatientOfAppointmentReceived({
      patientEmail: appointment.email,
      patientName: appointment.patientName,
      preferredDate: input.preferredDate,
      preferredTime: appointment.preferredTime,
    });
  }

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
  await getAppointmentById(id);
  return prisma.appointment.update({ where: { id }, data });
}

export async function deleteAppointment(id: string): Promise<void> {
  await getAppointmentById(id);
  await prisma.appointment.delete({ where: { id } });
}
