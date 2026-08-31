import { AlertTriangle } from "lucide-react";
import { Button } from "../../components/ui/Button";

interface ErrorBlockProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBlock({ message, onRetry }: ErrorBlockProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <AlertTriangle className="h-8 w-8 text-red-500" aria-hidden="true" />
      <p className="max-w-sm text-sm text-text-muted">{message}</p>
      {onRetry && (
        <Button type="button" variant="outline" size="md" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
