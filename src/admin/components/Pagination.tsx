import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationMeta } from "../types";

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  const { page, totalPages, total, limit } = meta;
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row sm:px-6">
      <p className="text-sm text-text-soft">
        {total === 0 ? "No results" : `Showing ${start}–${end} of ${total}`}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted transition-colors hover:bg-bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <span className="text-sm text-text-muted">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted transition-colors hover:bg-bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
