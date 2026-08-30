import { Router } from "express";
import {
  listAppointments,
  getAppointment,
  updateAppointment,
  deleteAppointment,
} from "../../controllers/admin/appointment.controller";
import { validate } from "../../middleware/validate";
import {
  appointmentFiltersSchema,
  updateAppointmentSchema,
  idParamSchema,
} from "../../validators/appointment.validators";
import { authenticate } from "../../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", validate(appointmentFiltersSchema, "query"), listAppointments);
router.get("/:id", validate(idParamSchema, "params"), getAppointment);
router.patch(
  "/:id",
  validate(idParamSchema, "params"),
  validate(updateAppointmentSchema),
  updateAppointment
);
router.delete("/:id", validate(idParamSchema, "params"), deleteAppointment);

export default router;
