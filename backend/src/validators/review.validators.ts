import { z } from "zod";
import { paginationSchema } from "./pagination.validators";

export const createReviewSchema = z.object({
  rating: z.coerce.number().int().min(1, "Rating must be between 1 and 5.").max(5, "Rating must be between 1 and 5."),
  reviewText: z.string().trim().max(1500, "Review is too long.").optional().or(z.literal("")),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

export const reviewStatusEnum = z.enum(["PENDING", "APPROVED", "REJECTED"]);

export const updateReviewSchema = z.object({
  status: reviewStatusEnum,
});

export const reviewFiltersSchema = paginationSchema.extend({
  status: reviewStatusEnum.optional(),
  search: z.string().trim().min(1).max(200).optional(),
});

export const idParamSchema = z.object({
  id: z.string().uuid("Invalid id"),
});
