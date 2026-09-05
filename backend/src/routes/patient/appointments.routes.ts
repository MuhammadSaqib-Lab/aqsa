import { Router } from "express";
import { listMine } from "../../controllers/patient/appointment.controller";
import { validate } from "../../middleware/validate";
import { patientAppointmentFiltersSchema } from "../../validators/appointment.validators";
import { authenticatePatient } from "../../middleware/patientAuth";

const router = Router();

router.use(authenticatePatient);

router.get("/", validate(patientAppointmentFiltersSchema, "query"), listMine);

export default router;
