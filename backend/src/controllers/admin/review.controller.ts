import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import * as reviewService from "../../services/review.service";
import type { ReviewFilters } from "../../services/review.service";

export const listReviews = asyncHandler(async (req: Request, res: Response) => {
  const result = await reviewService.listReviews(req.query as unknown as ReviewFilters);
  sendSuccess(res, result, "Reviews retrieved");
});

export const getReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await reviewService.getReviewById(req.params.id);
  sendSuccess(res, review, "Review retrieved");
});

export const updateReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await reviewService.updateReviewStatus(req.params.id, req.body.status);
  sendSuccess(res, review, "Review updated");
});

export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  await reviewService.deleteReview(req.params.id);
  sendSuccess(res, null, "Review deleted");
});
