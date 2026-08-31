import { Loader2 } from "lucide-react";

export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-text-soft">
      <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
