import { useEffect, useState } from "react";
import { listPublicReviews } from "../../lib/publicApi";
import type { PublicReview } from "../../types";
import { PatientReviewCard } from "../cards/PatientReviewCard";
import { SectionHeading } from "../ui/SectionHeading";

export function PatientReviews() {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    listPublicReviews({ page: 1, limit: 9 })
      .then((res) => setReviews(res.items))
      .catch(() => setReviews([]))
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
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <PatientReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}
