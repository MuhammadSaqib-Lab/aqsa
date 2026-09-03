import { Router } from "express";
import authRoutes from "./auth.routes";
import appointmentRoutes from "./appointments.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/appointments", appointmentRoutes);

export default router;
