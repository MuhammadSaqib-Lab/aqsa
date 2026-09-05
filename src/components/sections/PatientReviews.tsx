import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { listPublicReviews } from "../../lib/publicApi";
import type { PublicReview, ReviewStats } from "../../types";
import { PatientReviewCard } from "../cards/PatientReviewCard";
import { SectionHeading } from "../ui/SectionHeading";

export function PatientReviews() {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    listPublicReviews({ page: 1, limit: 9 })
      .then((res) => {
        setReviews(res.items);
        setStats(res.stats);
      })
      .catch(() => {
        setReviews([]);
        setStats(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Hide the section entirely until there's at least one approved review,
  // rather than showing an empty/awkward section right after this ships.
  if (!isLoading && reviews.length === 0) return null;
  if (isLoading) return null;

  return (
    <section id="patient-reviews" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Patient Reviews"
          title="Rated by Our Patients"
          description="Real ratings and reviews submitted by our registered patients, shown here after a quick moderation check."
        />
        {stats && stats.totalApproved > 0 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="flex items-center gap-1" role="img" aria-label={`${stats.averageRating.toFixed(1)} out of 5 stars`}>
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${i < Math.round(stats.averageRating) ? "fill-accent text-accent" : "text-border"}`}
                  aria-hidden="true"
                />
              ))}
            </div>
            <p className="text-sm font-medium text-text">
              {stats.averageRating.toFixed(1)} out of 5 · {stats.totalApproved} review
              {stats.totalApproved === 1 ? "" : "s"}
            </p>
          </div>
        )}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <PatientReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}
