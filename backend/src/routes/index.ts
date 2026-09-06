import { Router } from "express";
import healthRoutes from "./health.routes";
import appointmentRoutes from "./appointment.routes";
import contactRoutes from "./contact.routes";
import reviewRoutes from "./review.routes";
import adminRoutes from "./admin";
import patientRoutes from "./patient";
import galleryRoutes from "./gallery.routes";
import chatRoutes from "./chat.routes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/contact", contactRoutes);
router.use("/reviews", reviewRoutes);
router.use("/admin", adminRoutes);
router.use("/patient", patientRoutes);
router.use("/gallery", galleryRoutes);
router.use("/chat", chatRoutes);

export default router;
