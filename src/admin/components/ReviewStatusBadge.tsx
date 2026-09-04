import type { ReviewStatus } from "../types";

/**
 * Kept separate from the shared src/components/ui/StatusBadge.tsx rather
 * than extending it — ReviewStatus's "PENDING" literal collides with
 * AppointmentStatus's own "PENDING", and StatusBadge picks its style table
 * via `status in appointmentStyles`, which only works today because
 * AppointmentStatus/ContactStatus never overlap. Extending it would risk
 * that shared, currently-working component for both Appointments and
 * Messages just to add Reviews.
 */
const styles: Record<ReviewStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-600/20",
  APPROVED: "bg-accent-light text-accent-dark ring-accent/25",
  REJECTED: "bg-red-50 text-red-700 ring-red-600/20",
};

const labels: Record<ReviewStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
