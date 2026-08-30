import { Router } from "express";
import { login, logout, me } from "../../controllers/admin/auth.controller";
import { validate } from "../../middleware/validate";
import { loginSchema } from "../../validators/auth.validators";
import { loginLimiter } from "../../middleware/rateLimiters";
import { authenticate } from "../../middleware/auth";

const router = Router();

router.post("/login", loginLimiter, validate(loginSchema), login);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, me);

export default router;
