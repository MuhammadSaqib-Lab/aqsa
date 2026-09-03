import { Router } from "express";
import { listMine } from "../../controllers/patient/appointment.controller";
import { validate } from "../../middleware/validate";
import { paginationSchema } from "../../validators/pagination.validators";
import { authenticatePatient } from "../../middleware/patientAuth";

const router = Router();

router.use(authenticatePatient);

router.get("/", validate(paginationSchema, "query"), listMine);

export default router;
