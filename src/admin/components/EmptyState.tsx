import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-muted text-text-soft">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <p className="font-medium text-text">{title}</p>
      {description && <p className="max-w-xs text-sm text-text-soft">{description}</p>}
    </div>
  );
}
