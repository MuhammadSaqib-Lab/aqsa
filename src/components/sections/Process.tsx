import { processSteps } from "../../config/clinic";
import { ProcessStep } from "../cards/ProcessStep";
import { SectionHeading } from "../ui/SectionHeading";

export function Process() {
  return (
    <section id="process" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Our Process"
          title="A Clear Path to Recovery"
          description="A straightforward, four-step approach to understanding your needs and guiding your rehabilitation."
        />

        <div className="mt-14 flex flex-col gap-10 sm:gap-12 lg:flex-row lg:gap-8">
          {processSteps.map((step, index) => (
            <ProcessStep
              key={step.number}
              step={step}
              delay={index * 100}
              isLast={index === processSteps.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
