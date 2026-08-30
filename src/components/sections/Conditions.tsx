import { Info } from "lucide-react";
import { conditions } from "../../config/clinic";
import { ConditionCard } from "../cards/ConditionCard";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";

export function Conditions() {
  return (
    <section id="conditions" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Conditions We Help With"
          title="Common Conditions We Support"
          description="A general overview of conditions our physiotherapy services can support."
        />

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {conditions.map((condition, index) => (
            <ConditionCard key={condition.name} condition={condition} delay={(index % 6) * 60} />
          ))}
        </div>

        <Reveal className="mx-auto mt-10 flex max-w-2xl items-start gap-3 rounded-2xl border border-secondary/30 bg-secondary/10 p-4 text-left">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-secondary-dark" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-text-muted">
            This list is for general information only. Treatment suitability depends on
            individual assessment — please consult with our physiotherapist to determine
            an appropriate plan for your condition.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
