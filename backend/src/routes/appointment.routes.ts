import { Router } from "express";
import { createAppointment, getAvailability } from "../controllers/appointment.controller";
import { validate } from "../middleware/validate";
import { createAppointmentSchema, availabilityQuerySchema } from "../validators/appointment.validators";
import { appointmentSubmissionLimiter } from "../middleware/rateLimiters";
import { authenticatePatient } from "../middleware/patientAuth";

const router = Router();

router.post(
  "/",
  authenticatePatient,
  appointmentSubmissionLimiter,
  validate(createAppointmentSchema),
  createAppointment
);
router.get("/availability", validate(availabilityQuerySchema, "query"), getAvailability);

export default router;
