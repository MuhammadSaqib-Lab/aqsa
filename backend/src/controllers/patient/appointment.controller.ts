import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { ApiError } from "../../utils/ApiError";
import * as appointmentService from "../../services/appointment.service";
import type { PatientAppointmentFilters } from "../../services/appointment.service";

/** patientId is always taken from the authenticated session, never from the client. */
export const listMine = asyncHandler(async (req: Request, res: Response) => {
  if (!req.patient) throw ApiError.unauthorized();
  const result = await appointmentService.listPatientAppointments(
    req.patient.id,
    req.query as unknown as PatientAppointmentFilters
  );
  sendSuccess(res, result, "Appointments retrieved");
});
