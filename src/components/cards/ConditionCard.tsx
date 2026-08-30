import type { Condition } from "../../types";
import { Reveal } from "../ui/Reveal";

interface ConditionCardProps {
  condition: Condition;
  delay?: number;
}

export function ConditionCard({ condition, delay = 0 }: ConditionCardProps) {
  const Icon = condition.icon;

  return (
    <Reveal delay={delay}>
      <div className="flex items-center gap-3 rounded-full border border-border bg-white py-3 pl-3 pr-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-card">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="text-sm font-medium text-text">{condition.name}</span>
      </div>
    </Reveal>
  );
}
