import { Loader2 } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  isDangerous?: boolean;
  isSubmitting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  isDangerous = false,
  isSubmitting = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} maxWidthClassName="max-w-md">
      <p className="text-sm text-text-muted">{description}</p>
      <div className="mt-6 flex justify-end gap-3">
        <Button type="button" variant="ghost" size="md" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          type="button"
          size="md"
          variant={isDangerous ? "primary" : "secondary"}
          className={isDangerous ? "!bg-red-600 hover:!bg-red-700" : ""}
          onClick={onConfirm}
          disabled={isSubmitting}
          icon={isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : undefined}
          iconPosition="left"
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
