import { apiRequest } from "./apiClient";
import type { PublicReview, ReviewStats } from "../types";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface PublicReviewFilters {
  page: number;
  limit: number;
}

export interface PublicReviewsResponse extends Paginated<PublicReview> {
  stats: ReviewStats;
}

export function listPublicReviews(filters: PublicReviewFilters) {
  return apiRequest<PublicReviewsResponse>(`/reviews?page=${filters.page}&limit=${filters.limit}`);
}
