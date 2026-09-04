import { Router } from "express";
import { authenticatePatient } from "../../middleware/patientAuth";
import { validate } from "../../middleware/validate";
import { paginationSchema } from "../../validators/pagination.validators";
import { listMine } from "../../controllers/patient/review.controller";

const router = Router();
router.use(authenticatePatient);

router.get("/", validate(paginationSchema, "query"), listMine);

export default router;
