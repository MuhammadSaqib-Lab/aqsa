import { useEffect, useState } from "react";
import { Search, Star } from "lucide-react";
import * as adminApi from "../api/adminApi";
import { ApiRequestError } from "../../lib/apiClient";
import type { AdminReview, ReviewStatus, Paginated } from "../types";
import { LoadingBlock } from "../components/LoadingBlock";
import { ErrorBlock } from "../components/ErrorBlock";
import { EmptyState } from "../components/EmptyState";
import { Pagination } from "../components/Pagination";
import { ReviewStatusBadge } from "../components/ReviewStatusBadge";
import { ReviewDetailModal } from "../components/ReviewDetailModal";
import { formatDateTime } from "../utils/format";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

const LIMIT = 20;
const statusOptions: (ReviewStatus | "")[] = ["", "PENDING", "APPROVED", "REJECTED"];

function truncate(text: string, max = 80) {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function ReviewsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<ReviewStatus | "">("");
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput);

  const [result, setResult] = useState<Paginated<AdminReview> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AdminReview | null>(null);

  const load = () => {
    setIsLoading(true);
    setError(null);
    adminApi
      .listReviews({ page, limit: LIMIT, status: status || undefined, search: search || undefined })
      .then(setResult)
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Failed to load reviews."))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, [page, status, search]);
  useEffect(() => setPage(1), [status, search]);

  const handleUpdated = (updated: AdminReview) => {
    setResult((prev) => (prev ? { ...prev, items: prev.items.map((r) => (r.id === updated.id ? updated : r)) } : prev));
    setSelected(updated);
  };

  const handleDeleted = (id: string) => {
    setResult((prev) =>
      prev
        ? { ...prev, items: prev.items.filter((r) => r.id !== id), pagination: { ...prev.pagination, total: prev.pagination.total - 1 } }
        : prev
    );
    setSelected(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-primary-dark">Reviews</h1>
        <p className="mt-1 text-sm text-text-soft">Patient ratings and reviews awaiting moderation.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-soft" aria-hidden="true" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by patient name or review text"
            aria-label="Search reviews"
            className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-4 text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ReviewStatus | "")}
          aria-label="Filter by status"
          className="rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
        >
          {statusOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt === "" ? "All statuses" : opt.charAt(0) + opt.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
        {isLoading ? (
          <LoadingBlock label="Loading reviews…" />
        ) : error ? (
          <ErrorBlock message={error} onRetry={load} />
        ) : !result || result.items.length === 0 ? (
          <EmptyState icon={Star} title="No reviews found" description="Try adjusting your search or filters." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-bg-subtle text-xs uppercase tracking-wide text-text-soft">
                  <tr>
                    <th className="px-4 py-3 font-medium sm:px-6">Patient</th>
                    <th className="px-4 py-3 font-medium sm:px-6">Rating</th>
                    <th className="px-4 py-3 font-medium sm:px-6">Review</th>
                    <th className="px-4 py-3 font-medium sm:px-6">Submitted</th>
                    <th className="px-4 py-3 font-medium sm:px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {result.items.map((review) => (
                    <tr
                      key={review.id}
                      onClick={() => setSelected(review)}
                      className="cursor-pointer transition-colors hover:bg-bg-subtle"
                    >
                      <td className="px-4 py-3.5 font-medium text-text sm:px-6">{review.patientName}</td>
                      <td className="px-4 py-3.5 text-text-muted sm:px-6">{review.rating}/5</td>
                      <td className="px-4 py-3.5 text-text-muted sm:px-6">
                        {review.reviewText ? truncate(review.reviewText) : "—"}
                      </td>
                      <td className="px-4 py-3.5 text-text-muted sm:px-6">{formatDateTime(review.createdAt)}</td>
                      <td className="px-4 py-3.5 sm:px-6">
                        <ReviewStatusBadge status={review.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination meta={result.pagination} onPageChange={setPage} />
          </>
        )}
      </div>

      {selected && (
        <ReviewDetailModal review={selected} onClose={() => setSelected(null)} onUpdated={handleUpdated} onDeleted={handleDeleted} />
      )}
    </div>
  );
}
