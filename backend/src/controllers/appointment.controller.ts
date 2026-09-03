import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { ApiError } from "../utils/ApiError";
import * as appointmentService from "../services/appointment.service";
import * as availabilityService from "../services/availability.service";
import type { CreateAppointmentInput } from "../validators/appointment.validators";

/** Booking now always requires a logged-in patient — see middleware/patientAuth.ts on this route. */
export const createAppointment = asyncHandler(async (req: Request, res: Response) => {
  if (!req.patient) throw ApiError.unauthorized();
  const appointment = await appointmentService.createAppointment(
    req.body as CreateAppointmentInput,
    req.patient
  );
  sendSuccess(res, { id: appointment.id }, "Appointment request submitted successfully", 201);
});

export const getAvailability = asyncHandler(async (req: Request, res: Response) => {
  const { date } = req.query as { date: string };
  const result = await availabilityService.getAvailability(date);
  sendSuccess(res, result, "Availability retrieved");
});
