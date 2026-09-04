import { apiRequest } from "./apiClient";
import type { PublicReview } from "../types";

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

export function listPublicReviews(filters: PublicReviewFilters) {
  return apiRequest<Paginated<PublicReview>>(`/reviews?page=${filters.page}&limit=${filters.limit}`);
}
