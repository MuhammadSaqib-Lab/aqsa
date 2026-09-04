import { Router } from "express";
import authRoutes from "./auth.routes";
import appointmentRoutes from "./appointments.routes";
import reviewsRoutes from "./reviews.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/reviews", reviewsRoutes);

export default router;
