import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import * as appointmentService from "../../services/appointment.service";
import type { AppointmentFilters } from "../../services/appointment.service";

export const listAppointments = asyncHandler(async (req: Request, res: Response) => {
  const result = await appointmentService.listAppointments(req.query as unknown as AppointmentFilters);
  sendSuccess(res, result, "Appointments retrieved");
});

export const getAppointment = asyncHandler(async (req: Request, res: Response) => {
  const appointment = await appointmentService.getAppointmentById(req.params.id);
  sendSuccess(res, appointment, "Appointment retrieved");
});

export const updateAppointment = asyncHandler(async (req: Request, res: Response) => {
  const appointment = await appointmentService.updateAppointment(req.params.id, req.body);
  sendSuccess(res, appointment, "Appointment updated");
});

export const deleteAppointment = asyncHandler(async (req: Request, res: Response) => {
  await appointmentService.deleteAppointment(req.params.id);
  sendSuccess(res, null, "Appointment deleted");
});
