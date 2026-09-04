import type { Review, ReviewStatus, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { buildPaginationMeta, toSkipTake } from "../utils/pagination";
import type { PaginatedData } from "../types/api";
import type { CreateReviewInput } from "../validators/review.validators";

export async function createReview(
  input: CreateReviewInput,
  patient: { id: string; name: string }
): Promise<Review> {
  return prisma.review.create({
    data: {
      patientId: patient.id,
      patientName: patient.name,
      rating: input.rating,
      reviewText: input.reviewText || null,
    },
  });
}

export interface ReviewFilters {
  page: number;
  limit: number;
  status?: ReviewStatus;
  search?: string;
}

export async function listReviews(filters: ReviewFilters): Promise<PaginatedData<Review>> {
  const where: Prisma.ReviewWhereInput = {};
  if (filters.status) where.status = filters.status;
  if (filters.search) {
    where.OR = [
      { patientName: { contains: filters.search, mode: "insensitive" } },
      { reviewText: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  const { skip, take } = toSkipTake(filters);
  const [items, total] = await prisma.$transaction([
    prisma.review.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
    prisma.review.count({ where }),
  ]);
  return { items, pagination: buildPaginationMeta(filters.page, filters.limit, total) };
}

export async function getReviewById(id: string): Promise<Review> {
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) throw ApiError.notFound("Review not found");
  return review;
}

export async function updateReviewStatus(id: string, status: ReviewStatus): Promise<Review> {
  await getReviewById(id);
  return prisma.review.update({ where: { id }, data: { status } });
}

export async function deleteReview(id: string): Promise<void> {
  await getReviewById(id);
  await prisma.review.delete({ where: { id } });
}

/** Explicit whitelist for public display — never leaks patientId or internal fields. */
const PUBLIC_REVIEW_SELECT = {
  id: true,
  patientName: true,
  rating: true,
  reviewText: true,
  createdAt: true,
} satisfies Prisma.ReviewSelect;

export type PublicReviewView = Prisma.ReviewGetPayload<{ select: typeof PUBLIC_REVIEW_SELECT }>;

export interface PublicReviewFilters {
  page: number;
  limit: number;
}

export async function listApprovedReviews(filters: PublicReviewFilters): Promise<PaginatedData<PublicReviewView>> {
  const where: Prisma.ReviewWhereInput = { status: "APPROVED" };
  const { skip, take } = toSkipTake(filters);
  const [items, total] = await prisma.$transaction([
    prisma.review.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, select: PUBLIC_REVIEW_SELECT }),
    prisma.review.count({ where }),
  ]);
  return { items, pagination: buildPaginationMeta(filters.page, filters.limit, total) };
}

/** patientId must come from the authenticated session in the caller — never from client input. */
export async function listMyReviews(
  patientId: string,
  filters: { page: number; limit: number }
): Promise<PaginatedData<Review>> {
  const where: Prisma.ReviewWhereInput = { patientId };
  const { skip, take } = toSkipTake(filters);
  const [items, total] = await prisma.$transaction([
    prisma.review.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
    prisma.review.count({ where }),
  ]);
  return { items, pagination: buildPaginationMeta(filters.page, filters.limit, total) };
}
