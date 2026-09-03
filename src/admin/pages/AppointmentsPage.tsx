import { useEffect, useState } from "react";
import { CalendarClock, Search } from "lucide-react";
import * as adminApi from "../api/adminApi";
import { ApiRequestError } from "../../lib/apiClient";
import type { AdminAppointment, AppointmentStatus, Paginated } from "../types";
import { LoadingBlock } from "../components/LoadingBlock";
import { ErrorBlock } from "../components/ErrorBlock";
import { EmptyState } from "../components/EmptyState";
import { Pagination } from "../components/Pagination";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { AppointmentDetailModal } from "../components/AppointmentDetailModal";
import { formatDateOnly } from "../utils/format";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

const LIMIT = 20;
const statusOptions: (AppointmentStatus | "")[] = ["", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"];

export function AppointmentsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<AppointmentStatus | "">("");
  const [date, setDate] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput);

  const [result, setResult] = useState<Paginated<AdminAppointment> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = () => {
    setIsLoading(true);
    setError(null);
    adminApi
      .listAppointments({ page, limit: LIMIT, status: status || undefined, date: date || undefined, search: search || undefined })
      .then(setResult)
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Failed to load appointments."))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, [page, status, date, search]);
  useEffect(() => setPage(1), [status, date, search]);

  const handleUpdated = (updated: AdminAppointment) => {
    setResult((prev) =>
      prev ? { ...prev, items: prev.items.map((a) => (a.id === updated.id ? updated : a)) } : prev
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-primary-dark">Appointments</h1>
        <p className="mt-1 text-sm text-text-soft">Review and manage appointment requests.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-soft" aria-hidden="true" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, phone, or email"
            aria-label="Search appointments"
            className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-4 text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as AppointmentStatus | "")}
          aria-label="Filter by status"
          className="rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
        >
          {statusOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt === "" ? "All statuses" : opt.replace("_", "-")}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Filter by date"
          className="rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
        {isLoading ? (
          <LoadingBlock label="Loading appointments…" />
        ) : error ? (
          <ErrorBlock message={error} onRetry={load} />
        ) : !result || result.items.length === 0 ? (
          <EmptyState icon={CalendarClock} title="No appointments found" description="Try adjusting your search or filters." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-bg-subtle text-xs uppercase tracking-wide text-text-soft">
                  <tr>
                    <th className="px-4 py-3 font-medium sm:px-6">Patient</th>
                    <th className="px-4 py-3 font-medium sm:px-6">Contact</th>
                    <th className="px-4 py-3 font-medium sm:px-6">Date &amp; Time</th>
                    <th className="px-4 py-3 font-medium sm:px-6">Service</th>
                    <th className="px-4 py-3 font-medium sm:px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {result.items.map((appointment) => (
                    <tr
                      key={appointment.id}
                      onClick={() => setSelectedId(appointment.id)}
                      className="cursor-pointer transition-colors hover:bg-bg-subtle"
                    >
                      <td className="px-4 py-3.5 font-medium text-text sm:px-6">{appointment.patientName}</td>
                      <td className="px-4 py-3.5 text-text-muted sm:px-6">{appointment.phone}</td>
                      <td className="px-4 py-3.5 text-text-muted sm:px-6">
                        {formatDateOnly(appointment.preferredDate)} · {appointment.preferredTime}
                      </td>
                      <td className="px-4 py-3.5 text-text-muted sm:px-6">{appointment.service}</td>
                      <td className="px-4 py-3.5 sm:px-6">
                        <StatusBadge status={appointment.status} />
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

      {selectedId && (
        <AppointmentDetailModal appointmentId={selectedId} onClose={() => setSelectedId(null)} onUpdated={handleUpdated} />
      )}
    </div>
  );
}
