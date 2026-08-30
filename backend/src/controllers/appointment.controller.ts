import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import * as appointmentService from "../services/appointment.service";
import * as availabilityService from "../services/availability.service";
import type { CreateAppointmentInput } from "../validators/appointment.validators";

export const createAppointment = asyncHandler(async (req: Request, res: Response) => {
  const appointment = await appointmentService.createAppointment(
    req.body as CreateAppointmentInput
  );
  sendSuccess(res, { id: appointment.id }, "Appointment request submitted successfully", 201);
});

export const getAvailability = asyncHandler(async (req: Request, res: Response) => {
  const { date } = req.query as { date: string };
  const result = await availabilityService.getAvailability(date);
  sendSuccess(res, result, "Availability retrieved");
});
