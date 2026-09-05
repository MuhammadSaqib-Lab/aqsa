import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, Plus, Star } from "lucide-react";
import * as patientApi from "../api/patientApi";
import { ApiRequestError } from "../../lib/apiClient";
import type { PatientAppointment, PatientReview, Paginated } from "../types";
import type { VisitType } from "../../types";
import { LoadingBlock } from "../../admin/components/LoadingBlock";
import { ErrorBlock } from "../../admin/components/ErrorBlock";
import { EmptyState } from "../../admin/components/EmptyState";
import { Pagination } from "../../admin/components/Pagination";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { formatDateOnly, formatDateTime } from "../../admin/utils/format";
import { Button } from "../../components/ui/Button";
import { RateVisitModal } from "../components/RateVisitModal";

const LIMIT = 10;

const visitTypeOptions: { value: VisitType | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "CLINIC", label: "Center" },
  { value: "HOME", label: "Home Session" },
];

export function PatientDashboardPage() {
  const [page, setPage] = useState(1);
  const [visitType, setVisitType] = useState<VisitType | "">("");
  const [result, setResult] = useState<Paginated<PatientAppointment> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myReview, setMyReview] = useState<PatientReview | null | undefined>(undefined);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);

  const load = () => {
    setIsLoading(true);
    setError(null);
    patientApi
      .listMyAppointments({ page, limit: LIMIT, visitType: visitType || undefined })
      .then(setResult)
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Failed to load your appointments."))
      .finally(() => setIsLoading(false));
  };

  const loadReviewState = () => {
    patientApi
      .listMyReviews({ page: 1, limit: 1 })
      .then((res) => setMyReview(res.items[0] ?? null))
      .catch(() => setMyReview(null));
  };

  useEffect(load, [page, visitType]);
  useEffect(() => setPage(1), [visitType]);
  useEffect(loadReviewState, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-primary-dark">My Appointments</h1>
          <p className="mt-1 text-sm text-text-soft">Track the status of your appointment requests.</p>
        </div>
        <Link
          to="/patient/new-appointment"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-dark active:translate-y-0"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Book an Appointment
        </Link>
      </div>

      <div className="inline-flex w-fit rounded-full border border-border bg-white p-1 shadow-soft">
        {visitTypeOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setVisitType(option.value)}
            aria-pressed={visitType === option.value}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              visitType === option.value ? "bg-primary text-white shadow-card" : "text-text-muted hover:text-text"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {myReview !== undefined && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-white p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-light text-accent">
              <Star className="h-5 w-5" aria-hidden="true" />
            </span>
            {myReview === null && (
              <p className="text-sm text-text">Enjoyed your visit? Let us know how we did.</p>
            )}
            {myReview?.status === "PENDING" && (
              <p className="text-sm text-text">Thanks — your review is awaiting approval.</p>
            )}
            {myReview?.status === "APPROVED" && (
              <p className="text-sm text-text">Thank you for your review!</p>
            )}
            {myReview?.status === "REJECTED" && (
              <p className="text-sm text-text">Enjoyed your visit? Let us know how we did.</p>
            )}
          </div>
          {(myReview === null || myReview?.status === "REJECTED") && (
            <Button type="button" variant="outline" onClick={() => setIsRateModalOpen(true)}>
              Rate Your Visit
            </Button>
          )}
        </div>
      )}

      <RateVisitModal
        isOpen={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
        onSubmitted={() => {
          setIsRateModalOpen(false);
          loadReviewState();
        }}
      />

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
        {isLoading ? (
          <LoadingBlock label="Loading your appointments…" />
        ) : error ? (
          <ErrorBlock message={error} onRetry={load} />
        ) : !result || result.items.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No appointments yet"
            description="Once you book an appointment, it will show up here with its live status."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-bg-subtle text-xs uppercase tracking-wide text-text-soft">
                  <tr>
                    <th className="px-4 py-3 font-medium sm:px-6">Date &amp; Time</th>
                    <th className="px-4 py-3 font-medium sm:px-6">Service</th>
                    <th className="px-4 py-3 font-medium sm:px-6">Requested</th>
                    <th className="px-4 py-3 font-medium sm:px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {result.items.map((appointment) => (
                    <tr key={appointment.id}>
                      <td className="px-4 py-3.5 font-medium text-text sm:px-6">
                        {formatDateOnly(appointment.preferredDate)} · {appointment.preferredTime}
                      </td>
                      <td className="px-4 py-3.5 text-text-muted sm:px-6">
                        {appointment.services.length > 0 ? appointment.services.join(", ") : (appointment.service ?? "—")}
                        {appointment.visitType === "HOME" && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-accent-light px-2 py-0.5 text-xs font-medium text-accent-dark">
                            Home Session
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-text-muted sm:px-6">{formatDateTime(appointment.createdAt)}</td>
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

      <p className="text-center text-sm text-text-soft">
        Questions about a request?{" "}
        <Link to="/#contact" className="font-medium text-primary hover:underline">
          Contact the clinic
        </Link>
        .
      </p>
    </div>
  );
}
