import { Router } from "express";
import { createContactMessage } from "../controllers/contact.controller";
import { validate } from "../middleware/validate";
import { createContactSchema } from "../validators/contact.validators";
import { contactSubmissionLimiter } from "../middleware/rateLimiters";

const router = Router();

router.post("/", contactSubmissionLimiter, validate(createContactSchema), createContactMessage);

export default router;
