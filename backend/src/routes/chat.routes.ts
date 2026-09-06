import { Router } from "express";
import { sendChatMessage } from "../controllers/chat.controller";
import { validate } from "../middleware/validate";
import { chatMessageSchema } from "../validators/chat.validators";
import { chatMessageLimiter } from "../middleware/rateLimiters";

const router = Router();

router.post("/", chatMessageLimiter, validate(chatMessageSchema), sendChatMessage);

export default router;
