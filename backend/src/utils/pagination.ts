import type { PaginationMeta } from "../types/api";

export interface PageQuery {
  page: number;
  limit: number;
}

export function toSkipTake({ page, limit }: PageQuery) {
  return { skip: (page - 1) * limit, take: limit };
}

export function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}
