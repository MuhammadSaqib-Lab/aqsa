import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import * as chatbotService from "../services/chatbot.service";
import type { ChatRequestInput } from "../validators/chat.validators";

export const sendChatMessage = asyncHandler(async (req: Request, res: Response) => {
  const { messages } = req.body as ChatRequestInput;
  const reply = await chatbotService.getChatReply(messages);
  sendSuccess(res, { reply }, "Reply generated");
});
