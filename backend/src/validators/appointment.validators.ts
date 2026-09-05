import { z } from "zod";
import { SERVICE_TITLES } from "../config/services";
import { isTodayOrFuture, isValidDateString, isValidTimeString } from "../utils/clinicDate";
import { paginationSchema } from "./pagination.validators";

const PHONE_RE = /^[0-9+\-\s()]{7,20}$/;

const dateField = z
  .string()
  .refine(isValidDateString, "preferredDate must be a valid date (YYYY-MM-DD)")
  .refine(isTodayOrFuture, "preferredDate cannot be in the past");

const timeField = z.string().refine(isValidTimeString, "preferredTime must be in HH:mm format");

export const visitTypeEnum = z.enum(["CLINIC", "HOME"]);
export const genderEnum = z.enum(["MALE", "FEMALE"]);

/** Matches AppointmentFormValues from the frontend's src/types/index.ts exactly. */
export const createAppointmentSchema = z
  .object({
    fullName: z.string().trim().min(2, "Please enter your full name.").max(120),
    phone: z.string().trim().regex(PHONE_RE, "Please enter a valid phone number."),
    email: z.string().trim().email("Please enter a valid email address.").max(200).optional().or(z.literal("")),
    gender: genderEnum,
    preferredDate: dateField,
    preferredTime: timeField,
    services: z
      .array(z.enum(SERVICE_TITLES, { errorMap: () => ({ message: "Please select a valid service." }) }))
      .min(1, "Please select at least one service."),
    message: z.string().trim().max(1000).optional().or(z.literal("")),
    visitType: visitTypeEnum.default("CLINIC"),
    homeAddress: z.string().trim().max(500).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.visitType === "HOME" && !data.homeAddress?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["homeAddress"],
        message: "Home address is required for a home visit.",
      });
    }
  });

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

export const availabilityQuerySchema = z.object({
  date: z.string().refine(isValidDateString, "date must be a valid date (YYYY-MM-DD)"),
});

export const appointmentStatusEnum = z.enum([
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
]);

export const updateAppointmentSchema = z
  .object({
    status: appointmentStatusEnum.optional(),
    adminNotes: z.string().trim().max(2000).optional(),
  })
  .refine((v) => v.status !== undefined || v.adminNotes !== undefined, {
    message: "Provide at least one field to update (status or adminNotes).",
  });

export const appointmentFiltersSchema = paginationSchema.extend({
  status: appointmentStatusEnum.optional(),
  date: z.string().refine(isValidDateString, "date must be a valid date (YYYY-MM-DD)").optional(),
  search: z.string().trim().min(1).max(200).optional(),
  visitType: visitTypeEnum.optional(),
});

export const patientAppointmentFiltersSchema = paginationSchema.extend({
  visitType: visitTypeEnum.optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid("Invalid id"),
});
