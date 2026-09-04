import { useState } from "react";
import { Loader2, Star } from "lucide-react";
import * as patientApi from "../api/patientApi";
import { ApiRequestError } from "../../lib/apiClient";
import { useToast } from "../../context/ToastContext";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";

interface RateVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

export function RateVisitModal({ isOpen, onClose, onSubmitted }: RateVisitModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleSubmit = async () => {
    if (rating < 1) {
      setError("Please select a star rating.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await patientApi.createReview({ rating, reviewText });
      showToast("Thank you — your review has been submitted for approval.");
      onSubmitted();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed to submit your review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rate Your Visit">
      <div className="flex flex-col gap-4">
        <div>
          <p className="mb-2 text-sm font-medium text-text">Your rating</p>
          <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoverRating(value)}
                aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
                className="p-0.5"
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    value <= (hoverRating || rating) ? "fill-accent text-accent" : "text-border"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="reviewText" className="mb-1.5 block text-sm font-medium text-text">
            Your review <span className="text-text-soft">(optional)</span>
          </label>
          <textarea
            id="reviewText"
            rows={4}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Tell us about your experience"
            className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}

        <Button
          type="button"
          size="lg"
          disabled={isSubmitting}
          onClick={handleSubmit}
          icon={isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : undefined}
          className="mt-1 w-full"
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
      </div>
    </Modal>
  );
}
