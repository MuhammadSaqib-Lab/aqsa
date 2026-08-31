import { useState } from "react";
import { Archive, CheckCheck, Eye, Loader2, Trash2 } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { useToast } from "../../context/ToastContext";
import * as adminApi from "../api/adminApi";
import { ApiRequestError } from "../../lib/apiClient";
import type { AdminContactMessage, ContactStatus } from "../types";
import { StatusBadge } from "./StatusBadge";
import { formatDateTime } from "../utils/format";
import { ConfirmDialog } from "./ConfirmDialog";

interface MessageDetailModalProps {
  message: AdminContactMessage;
  onClose: () => void;
  onUpdated: (message: AdminContactMessage) => void;
  onDeleted: (id: string) => void;
}

const statusActions: { status: ContactStatus; label: string; icon: typeof Eye }[] = [
  { status: "READ", label: "Mark Read", icon: Eye },
  { status: "REPLIED", label: "Mark Replied", icon: CheckCheck },
  { status: "ARCHIVED", label: "Archive", icon: Archive },
];

export function MessageDetailModal({ message, onClose, onUpdated, onDeleted }: MessageDetailModalProps) {
  const { showToast } = useToast();
  const [pendingStatus, setPendingStatus] = useState<ContactStatus | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const changeStatus = async (status: ContactStatus) => {
    setPendingStatus(status);
    try {
      const updated = await adminApi.updateMessageStatus(message.id, status);
      onUpdated(updated);
      showToast("Message updated.");
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : "Update failed. Please try again.", "error");
    } finally {
      setPendingStatus(null);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await adminApi.deleteMessage(message.id);
      showToast("Message deleted.");
      onDeleted(message.id);
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : "Delete failed. Please try again.", "error");
      setIsDeleting(false);
      setConfirmDeleteOpen(false);
    }
  };

  return (
    <>
      <Modal isOpen={!confirmDeleteOpen} onClose={onClose} title="Message Details" maxWidthClassName="max-w-xl">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-text">{message.name}</p>
              <p className="text-sm text-text-soft">Received {formatDateTime(message.createdAt)}</p>
            </div>
            <StatusBadge status={message.status} />
          </div>

          <dl className="grid grid-cols-1 gap-4 rounded-2xl bg-bg-subtle p-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-text-soft">Phone</dt>
              <dd className="text-text">{message.phone ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-text-soft">Email</dt>
              <dd className="text-text">{message.email ?? "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-text-soft">Message</dt>
              <dd className="whitespace-pre-wrap text-text">{message.message}</dd>
            </div>
          </dl>

          <div>
            <p className="mb-2 text-sm font-medium text-text">Status actions</p>
            <div className="flex flex-wrap gap-2">
              {statusActions.map(({ status, label, icon: Icon }) => (
                <button
                  key={status}
                  type="button"
                  disabled={pendingStatus !== null || message.status === status}
                  onClick={() => changeStatus(status)}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-bg-muted hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pendingStatus === status ? (
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
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        title="Delete this message?"
        description="This permanently deletes the message. This cannot be undone."
        confirmLabel="Delete"
        isDangerous
        isSubmitting={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </>
  );
}
