import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { ApiError } from "../../utils/ApiError";
import * as reviewService from "../../services/review.service";

/** patientId is always taken from the authenticated session, never from the client. */
export const listMine = asyncHandler(async (req: Request, res: Response) => {
  if (!req.patient) throw ApiError.unauthorized();
  const result = await reviewService.listMyReviews(
    req.patient.id,
    req.query as unknown as { page: number; limit: number }
  );
  sendSuccess(res, result, "Reviews retrieved");
});
