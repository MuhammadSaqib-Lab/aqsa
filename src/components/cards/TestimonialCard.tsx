import { Quote } from "lucide-react";
import type { Testimonial } from "../../types";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <figure className="flex h-full flex-col justify-between gap-6 rounded-2xl border border-border bg-white p-7 shadow-soft">
      <Quote className="h-8 w-8 text-accent/40" aria-hidden="true" />
      <blockquote className="text-base leading-relaxed text-text">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
      <figcaption className="flex items-center gap-3 border-t border-border pt-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {testimonial.initials}
        </span>
        <div>
          <p className="text-sm font-semibold text-text">{testimonial.name}</p>
          {testimonial.category && (
            <p className="text-xs text-text-soft">{testimonial.category}</p>
          )}
        </div>
      </figcaption>
    </figure>
  );
}
