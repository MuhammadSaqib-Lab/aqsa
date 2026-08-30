import { Router } from "express";
import { createAppointment, getAvailability } from "../controllers/appointment.controller";
import { validate } from "../middleware/validate";
import { createAppointmentSchema, availabilityQuerySchema } from "../validators/appointment.validators";
import { appointmentSubmissionLimiter } from "../middleware/rateLimiters";

const router = Router();

router.post("/", appointmentSubmissionLimiter, validate(createAppointmentSchema), createAppointment);
router.get("/availability", validate(availabilityQuerySchema, "query"), getAvailability);

export default router;
