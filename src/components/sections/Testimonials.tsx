import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { testimonials } from "../../config/clinic";
import { TestimonialCard } from "../cards/TestimonialCard";
import { SectionHeading } from "../ui/SectionHeading";

export function Testimonials() {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByCard = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-testimonial-card]");
    const amount = (card?.offsetWidth ?? 320) + 24;
    track.scrollBy({ left: amount * direction, behavior: "smooth" });
  };

  return (
    <section id="testimonials" className="bg-bg-subtle py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Testimonials"
            title="What Our Patients Say"
            description="Illustrative placeholder reviews — shown here to demonstrate layout and structure."
            align="left"
          />
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              aria-label="Previous testimonial"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-primary transition-colors hover:bg-primary hover:text-white"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              aria-label="Next testimonial"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-primary transition-colors hover:bg-primary hover:text-white"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          className="mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              data-testimonial-card
              className="w-[85%] shrink-0 snap-start sm:w-[46%] lg:w-[31%]"
            >
              <TestimonialCard testimonial={testimonial} />
            </div>
          ))}
        </div>

        <p className="mt-2 text-center text-xs text-text-soft">
          Placeholder testimonials for demonstration — to be replaced with real, consented
          patient reviews.
        </p>
      </div>
    </section>
  );
}
