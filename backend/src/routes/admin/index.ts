import { Router } from "express";
import authRoutes from "./auth.routes";
import appointmentRoutes from "./appointment.routes";
import messageRoutes from "./message.routes";
import dashboardRoutes from "./dashboard.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/messages", messageRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
