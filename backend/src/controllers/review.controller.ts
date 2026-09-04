import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { ApiError } from "../utils/ApiError";
import * as reviewService from "../services/review.service";

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  if (!req.patient) throw ApiError.unauthorized();
  const review = await reviewService.createReview(req.body, req.patient);
  sendSuccess(res, { id: review.id }, "Review submitted for approval", 201);
});

export const listPublicReviews = asyncHandler(async (req: Request, res: Response) => {
  const result = await reviewService.listApprovedReviews(req.query as unknown as reviewService.PublicReviewFilters);
  sendSuccess(res, result, "Reviews retrieved");
});
