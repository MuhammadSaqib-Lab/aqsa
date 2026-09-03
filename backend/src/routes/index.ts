import { Router } from "express";
import healthRoutes from "./health.routes";
import appointmentRoutes from "./appointment.routes";
import contactRoutes from "./contact.routes";
import adminRoutes from "./admin";
import patientRoutes from "./patient";

const router = Router();

router.use("/health", healthRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/contact", contactRoutes);
router.use("/admin", adminRoutes);
router.use("/patient", patientRoutes);

export default router;
