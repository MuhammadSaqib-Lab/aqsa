import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { useLockBodyScroll } from "../../hooks/useLockBodyScroll";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidthClassName?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidthClassName = "max-w-lg" }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useLockBodyScroll(isOpen);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);

    dialogRef.current?.focus();

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto p-4"
      role="presentation"
    >
      <div
        className="animate-fade-in fixed inset-0 bg-primary-dark/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className={`animate-fade-up relative z-10 my-8 w-full ${maxWidthClassName} rounded-3xl bg-white p-6 shadow-lift outline-none sm:p-8`}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2 id="modal-title" className="text-2xl font-semibold text-primary-dark">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-full p-2 text-text-soft transition-colors hover:bg-bg-muted hover:text-text"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
