import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import * as contactService from "../../services/contact.service";
import type { ContactFilters } from "../../services/contact.service";

export const listMessages = asyncHandler(async (req: Request, res: Response) => {
  const result = await contactService.listContactMessages(req.query as unknown as ContactFilters);
  sendSuccess(res, result, "Messages retrieved");
});

export const getMessage = asyncHandler(async (req: Request, res: Response) => {
  const message = await contactService.getContactMessageById(req.params.id);
  sendSuccess(res, message, "Message retrieved");
});

export const updateMessage = asyncHandler(async (req: Request, res: Response) => {
  const message = await contactService.updateContactMessageStatus(req.params.id, req.body.status);
  sendSuccess(res, message, "Message updated");
});

export const deleteMessage = asyncHandler(async (req: Request, res: Response) => {
  await contactService.deleteContactMessage(req.params.id);
  sendSuccess(res, null, "Message deleted");
});
