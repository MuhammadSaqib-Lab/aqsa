import { features } from "../../config/clinic";
import { FeatureCard } from "../cards/FeatureCard";
import { SectionHeading } from "../ui/SectionHeading";

export function WhyChooseUs() {
  return (
    <section id="why-choose-us" className="bg-bg-subtle py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Why Choose Us"
          title={`Why Patients Choose Aqsa Physiotherapy Centre`}
          description="A premium physiotherapy experience built on structure, communication, and genuine care."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} delay={(index % 3) * 80} />
          ))}
        </div>
      </div>
    </section>
  );
}
