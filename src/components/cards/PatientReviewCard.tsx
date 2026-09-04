import { Star } from "lucide-react";
import type { PublicReview } from "../../types";

interface PatientReviewCardProps {
  review: PublicReview;
}

function formatReviewDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function PatientReviewCard({ review }: PatientReviewCardProps) {
  return (
    <figure className="flex h-full flex-col justify-between gap-6 rounded-2xl border border-border bg-white p-7 shadow-soft">
      <div>
        <div className="flex items-center gap-1" role="img" aria-label={`${review.rating} out of 5 stars`}>
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < review.rating ? "fill-accent text-accent" : "text-border"}`}
              aria-hidden="true"
            />
          ))}
        </div>
        {review.reviewText && (
          <blockquote className="mt-4 text-base leading-relaxed text-text">&ldquo;{review.reviewText}&rdquo;</blockquote>
        )}
      </div>
      <figcaption className="flex items-center gap-3 border-t border-border pt-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {review.patientName.charAt(0).toUpperCase()}
        </span>
        <div>
          <p className="text-sm font-semibold text-text">{review.patientName}</p>
          <p className="text-xs text-text-soft">{formatReviewDate(review.createdAt)}</p>
        </div>
      </figcaption>
    </figure>
  );
}
