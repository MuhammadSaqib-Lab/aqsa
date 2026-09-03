import { Router } from "express";
import { signup, login, logout, me } from "../../controllers/patient/auth.controller";
import { validate } from "../../middleware/validate";
import { signupSchema, loginSchema } from "../../validators/patient.validators";
import { patientSignupLimiter, patientLoginLimiter } from "../../middleware/rateLimiters";
import { authenticatePatient } from "../../middleware/patientAuth";

const router = Router();

router.post("/signup", patientSignupLimiter, validate(signupSchema), signup);
router.post("/login", patientLoginLimiter, validate(loginSchema), login);
router.post("/logout", authenticatePatient, logout);
router.get("/me", authenticatePatient, me);

export default router;
