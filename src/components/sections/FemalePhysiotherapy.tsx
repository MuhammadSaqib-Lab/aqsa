import { femalePhysioPoints } from "../../config/clinic";
import { FeatureCard } from "../cards/FeatureCard";
import { SectionHeading } from "../ui/SectionHeading";

export function FemalePhysiotherapy() {
  return (
    <section id="female-physiotherapy" className="bg-bg-subtle py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Patient Comfort"
          title="Female Physiotherapist — Available on Request"
          description="Many female patients feel more at ease being treated by a female physiotherapist. Where available, we're glad to accommodate that preference — please let us know when booking."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {femalePhysioPoints.map((point, index) => (
            <FeatureCard key={point.title} feature={point} delay={(index % 4) * 80} />
          ))}
        </div>
      </div>
    </section>
  );
}
