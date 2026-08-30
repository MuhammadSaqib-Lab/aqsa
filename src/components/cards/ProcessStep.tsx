import type { ProcessStepData } from "../../types";
import { Reveal } from "../ui/Reveal";

interface ProcessStepProps {
  step: ProcessStepData;
  delay?: number;
  isLast?: boolean;
}

export function ProcessStep({ step, delay = 0, isLast = false }: ProcessStepProps) {
  return (
    <Reveal delay={delay} className="relative flex flex-1 flex-col items-start gap-4">
      {!isLast && (
        <span
          aria-hidden="true"
          className="absolute left-7 top-14 hidden h-[calc(100%-1rem)] w-px bg-gradient-to-b from-accent/50 to-transparent sm:block lg:left-auto lg:right-[-1.5rem] lg:top-7 lg:h-px lg:w-[calc(100%-2rem)] lg:bg-gradient-to-r"
        />
      )}
      <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary font-display text-lg font-semibold text-white shadow-card">
        {step.number}
      </span>
      <div>
        <h3 className="mb-1.5 text-lg font-semibold text-primary-dark">{step.title}</h3>
        <p className="text-sm leading-relaxed text-text-muted">{step.description}</p>
      </div>
    </Reveal>
  );
}
