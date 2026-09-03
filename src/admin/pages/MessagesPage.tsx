import { useEffect, useState } from "react";
import { MessageSquare, Search } from "lucide-react";
import * as adminApi from "../api/adminApi";
import { ApiRequestError } from "../../lib/apiClient";
import type { AdminContactMessage, ContactStatus, Paginated } from "../types";
import { LoadingBlock } from "../components/LoadingBlock";
import { ErrorBlock } from "../components/ErrorBlock";
import { EmptyState } from "../components/EmptyState";
import { Pagination } from "../components/Pagination";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { MessageDetailModal } from "../components/MessageDetailModal";
import { formatDateTime } from "../utils/format";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

const LIMIT = 20;
const statusOptions: (ContactStatus | "")[] = ["", "NEW", "READ", "REPLIED", "ARCHIVED"];

function truncate(text: string, max = 80) {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function MessagesPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<ContactStatus | "">("");
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput);

  const [result, setResult] = useState<Paginated<AdminContactMessage> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AdminContactMessage | null>(null);

  const load = () => {
    setIsLoading(true);
    setError(null);
    adminApi
      .listMessages({ page, limit: LIMIT, status: status || undefined, search: search || undefined })
      .then(setResult)
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Failed to load messages."))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, [page, status, search]);
  useEffect(() => setPage(1), [status, search]);

  const handleUpdated = (updated: AdminContactMessage) => {
    setResult((prev) => (prev ? { ...prev, items: prev.items.map((m) => (m.id === updated.id ? updated : m)) } : prev));
    setSelected(updated);
  };

  const handleDeleted = (id: string) => {
    setResult((prev) =>
      prev
        ? { ...prev, items: prev.items.filter((m) => m.id !== id), pagination: { ...prev.pagination, total: prev.pagination.total - 1 } }
        : prev
    );
    setSelected(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-primary-dark">Contact Messages</h1>
        <p className="mt-1 text-sm text-text-soft">Inquiries submitted through the site.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-soft" aria-hidden="true" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or email"
            aria-label="Search messages"
            className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-4 text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ContactStatus | "")}
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
          <LoadingBlock label="Loading messages…" />
        ) : error ? (
          <ErrorBlock message={error} onRetry={load} />
        ) : !result || result.items.length === 0 ? (
          <EmptyState icon={MessageSquare} title="No messages found" description="Try adjusting your search or filters." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-bg-subtle text-xs uppercase tracking-wide text-text-soft">
                  <tr>
                    <th className="px-4 py-3 font-medium sm:px-6">From</th>
                    <th className="px-4 py-3 font-medium sm:px-6">Message</th>
                    <th className="px-4 py-3 font-medium sm:px-6">Received</th>
                    <th className="px-4 py-3 font-medium sm:px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {result.items.map((message) => (
                    <tr
                      key={message.id}
                      onClick={() => setSelected(message)}
                      className="cursor-pointer transition-colors hover:bg-bg-subtle"
                    >
                      <td className="px-4 py-3.5 sm:px-6">
                        <p className="font-medium text-text">{message.name}</p>
                        <p className="text-xs text-text-soft">{message.email ?? message.phone ?? "—"}</p>
                      </td>
                      <td className="px-4 py-3.5 text-text-muted sm:px-6">{truncate(message.message)}</td>
                      <td className="px-4 py-3.5 text-text-muted sm:px-6">{formatDateTime(message.createdAt)}</td>
                      <td className="px-4 py-3.5 sm:px-6">
                        <StatusBadge status={message.status} />
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
        <MessageDetailModal message={selected} onClose={() => setSelected(null)} onUpdated={handleUpdated} onDeleted={handleDeleted} />
      )}
    </div>
  );
}
