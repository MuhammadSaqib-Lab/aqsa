import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import * as contactService from "../services/contact.service";
import type { CreateContactInput } from "../validators/contact.validators";

export const createContactMessage = asyncHandler(async (req: Request, res: Response) => {
  const message = await contactService.createContactMessage(req.body as CreateContactInput);
  sendSuccess(res, { id: message.id }, "Message sent successfully", 201);
});
