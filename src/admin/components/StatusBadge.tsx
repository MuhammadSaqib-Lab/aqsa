import type { AppointmentStatus, ContactStatus } from "../types";

const appointmentStyles: Record<AppointmentStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-600/20",
  CONFIRMED: "bg-blue-50 text-blue-700 ring-blue-600/20",
  COMPLETED: "bg-accent-light text-accent-dark ring-accent/25",
  CANCELLED: "bg-red-50 text-red-700 ring-red-600/20",
  NO_SHOW: "bg-gray-100 text-gray-600 ring-gray-500/20",
};

const contactStyles: Record<ContactStatus, string> = {
  NEW: "bg-amber-50 text-amber-700 ring-amber-600/20",
  READ: "bg-blue-50 text-blue-700 ring-blue-600/20",
  REPLIED: "bg-accent-light text-accent-dark ring-accent/25",
  ARCHIVED: "bg-gray-100 text-gray-600 ring-gray-500/20",
};

const labels: Record<AppointmentStatus | ContactStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No-show",
  NEW: "New",
  READ: "Read",
  REPLIED: "Replied",
  ARCHIVED: "Archived",
};

function isAppointmentStatus(status: AppointmentStatus | ContactStatus): status is AppointmentStatus {
  return status in appointmentStyles;
}

export function StatusBadge({ status }: { status: AppointmentStatus | ContactStatus }) {
  const style = isAppointmentStatus(status) ? appointmentStyles[status] : contactStyles[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style}`}>
      {labels[status]}
    </span>
  );
}
