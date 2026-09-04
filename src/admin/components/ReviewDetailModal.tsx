import { useState } from "react";
import { Check, Loader2, Star, Trash2, X } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { useToast } from "../../context/ToastContext";
import * as adminApi from "../api/adminApi";
import { ApiRequestError } from "../../lib/apiClient";
import type { AdminReview, ReviewStatus } from "../types";
import { ReviewStatusBadge } from "./ReviewStatusBadge";
import { formatDateTime } from "../utils/format";
import { ConfirmDialog } from "./ConfirmDialog";

interface ReviewDetailModalProps {
  review: AdminReview;
  onClose: () => void;
  onUpdated: (review: AdminReview) => void;
  onDeleted: (id: string) => void;
}

const statusActions: { status: ReviewStatus; label: string; icon: typeof Check }[] = [
  { status: "APPROVED", label: "Approve", icon: Check },
  { status: "REJECTED", label: "Reject", icon: X },
];

export function ReviewDetailModal({ review, onClose, onUpdated, onDeleted }: ReviewDetailModalProps) {
  const { showToast } = useToast();
  const [pendingStatus, setPendingStatus] = useState<ReviewStatus | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const changeStatus = async (status: ReviewStatus) => {
    setPendingStatus(status);
    try {
      const updated = await adminApi.updateReviewStatus(review.id, status);
      onUpdated(updated);
      showToast("Review updated.");
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : "Update failed. Please try again.", "error");
    } finally {
      setPendingStatus(null);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await adminApi.deleteReview(review.id);
      showToast("Review deleted.");
      onDeleted(review.id);
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : "Delete failed. Please try again.", "error");
      setIsDeleting(false);
      setConfirmDeleteOpen(false);
    }
  };

  return (
    <>
      <Modal isOpen={!confirmDeleteOpen} onClose={onClose} title="Review Details" maxWidthClassName="max-w-xl">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-text">{review.patientName}</p>
              <p className="text-sm text-text-soft">Submitted {formatDateTime(review.createdAt)}</p>
            </div>
            <ReviewStatusBadge status={review.status} />
          </div>

          <dl className="grid grid-cols-1 gap-4 rounded-2xl bg-bg-subtle p-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-text-soft">Rating</dt>
              <dd className="flex items-center gap-1 text-text">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < review.rating ? "fill-accent text-accent" : "text-border"}`}
                  />
                ))}
                <span className="ml-1 text-text-soft">({review.rating}/5)</span>
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-text-soft">Review</dt>
              <dd className="whitespace-pre-wrap text-text">{review.reviewText ?? "—"}</dd>
            </div>
          </dl>

          <div>
            <p className="mb-2 text-sm font-medium text-text">Status actions</p>
            <div className="flex flex-wrap gap-2">
              {statusActions.map(({ status, label, icon: Icon }) => (
                <button
                  key={status}
                  type="button"
                  disabled={pendingStatus !== null || review.status === status}
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
        title="Delete this review?"
        description="This permanently deletes the review. This cannot be undone."
        confirmLabel="Delete"
        isDangerous
        isSubmitting={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </>
  );
}
