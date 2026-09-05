import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Save, Trash2, UserX, XCircle } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../context/ToastContext";
import * as adminApi from "../api/adminApi";
import { ApiRequestError } from "../../lib/apiClient";
import type { AdminAppointment, AppointmentStatus } from "../types";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { formatDateOnly, formatDateTime } from "../utils/format";
import { ConfirmDialog } from "./ConfirmDialog";

interface AppointmentDetailModalProps {
  appointmentId: string;
  onClose: () => void;
  onUpdated: (appointment: AdminAppointment) => void;
  onDeleted: (id: string) => void;
}

const statusActions: { status: AppointmentStatus; label: string; icon: typeof CheckCircle2 }[] = [
  { status: "CONFIRMED", label: "Confirm", icon: CheckCircle2 },
  { status: "COMPLETED", label: "Mark Completed", icon: CheckCircle2 },
  { status: "CANCELLED", label: "Cancel", icon: XCircle },
  { status: "NO_SHOW", label: "Mark No-show", icon: UserX },
];

export function AppointmentDetailModal({ appointmentId, onClose, onUpdated, onDeleted }: AppointmentDetailModalProps) {
  const { showToast } = useToast();
  const [appointment, setAppointment] = useState<AdminAppointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [pendingAction, setPendingAction] = useState<AppointmentStatus | "notes" | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    adminApi
      .getAppointment(appointmentId)
      .then((data) => {
        if (cancelled) return;
        setAppointment(data);
        setNotes(data.adminNotes ?? "");
      })
      .catch(() => {
        if (!cancelled) showToast("Failed to load appointment details.", "error");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId]);

  const applyUpdate = async (data: { status?: AppointmentStatus; adminNotes?: string }, key: AppointmentStatus | "notes") => {
    setPendingAction(key);
    try {
      const updated = await adminApi.updateAppointment(appointmentId, data);
      setAppointment(updated);
      onUpdated(updated);
      showToast(key === "notes" ? "Notes saved." : "Appointment updated.");
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : "Update failed. Please try again.", "error");
    } finally {
      setPendingAction(null);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await adminApi.deleteAppointment(appointmentId);
      showToast("Appointment deleted.");
      onDeleted(appointmentId);
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : "Delete failed. Please try again.", "error");
      setIsDeleting(false);
      setConfirmDeleteOpen(false);
    }
  };

  return (
    <>
    <Modal isOpen={!confirmDeleteOpen} onClose={onClose} title="Appointment Details" maxWidthClassName="max-w-2xl">
      {isLoading || !appointment ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-text">{appointment.patientName}</p>
              <p className="text-sm text-text-soft">Requested {formatDateTime(appointment.createdAt)}</p>
            </div>
            <StatusBadge status={appointment.status} />
          </div>

          <dl className="grid grid-cols-1 gap-4 rounded-2xl bg-bg-subtle p-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-text-soft">Phone</dt>
              <dd className="text-text">{appointment.phone}</dd>
            </div>
            <div>
              <dt className="text-text-soft">Email</dt>
              <dd className="text-text">{appointment.email ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-text-soft">Preferred date</dt>
              <dd className="text-text">{formatDateOnly(appointment.preferredDate)}</dd>
            </div>
            <div>
              <dt className="text-text-soft">Preferred time</dt>
              <dd className="text-text">{appointment.preferredTime}</dd>
            </div>
            <div>
              <dt className="text-text-soft">Service</dt>
              <dd className="text-text">{appointment.service}</dd>
            </div>
            <div>
              <dt className="text-text-soft">Visit type</dt>
              <dd className="text-text">{appointment.visitType === "HOME" ? "Home Session" : "Center"}</dd>
            </div>
            <div>
              <dt className="text-text-soft">Gender</dt>
              <dd className="text-text">
                {appointment.gender === "MALE" ? "Male" : appointment.gender === "FEMALE" ? "Female" : "—"}
              </dd>
            </div>
            {appointment.visitType === "HOME" && (
              <div className="sm:col-span-2">
                <dt className="text-text-soft">Home address</dt>
                <dd className="whitespace-pre-wrap text-text">{appointment.homeAddress ?? "—"}</dd>
              </div>
            )}
            <div>
              <dt className="text-text-soft">Last updated</dt>
              <dd className="text-text">{formatDateTime(appointment.updatedAt)}</dd>
            </div>
            {appointment.message && (
              <div className="sm:col-span-2">
                <dt className="text-text-soft">Patient message</dt>
                <dd className="whitespace-pre-wrap text-text">{appointment.message}</dd>
              </div>
            )}
          </dl>

          <div>
            <p className="mb-2 text-sm font-medium text-text">Status actions</p>
            <div className="flex flex-wrap gap-2">
              {statusActions.map(({ status, label, icon: Icon }) => (
                <button
                  key={status}
                  type="button"
                  disabled={pendingAction !== null || appointment.status === status}
                  onClick={() => applyUpdate({ status }, status)}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-bg-muted hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pendingAction === status ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  )}
                  {label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-red-200 px-3.5 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Delete
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="admin-notes" className="mb-1.5 block text-sm font-medium text-text">
              Private admin notes
            </label>
            <textarea
              id="admin-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Visible to admin staff only — never shown to the patient."
              className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
            <div className="mt-2 flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="md"
                disabled={pendingAction !== null || notes === (appointment.adminNotes ?? "")}
                onClick={() => applyUpdate({ adminNotes: notes }, "notes")}
                icon={
                  pendingAction === "notes" ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Save className="h-4 w-4" aria-hidden="true" />
                  )
                }
                iconPosition="left"
              >
                Save notes
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>

    <ConfirmDialog
      isOpen={confirmDeleteOpen}
      title="Delete this appointment?"
      description="This permanently deletes the appointment. This cannot be undone."
      confirmLabel="Delete"
      isDangerous
      isSubmitting={isDeleting}
      onConfirm={handleDelete}
      onCancel={() => setConfirmDeleteOpen(false)}
    />
    </>
  );
}
