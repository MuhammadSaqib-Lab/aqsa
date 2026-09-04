import { useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import type { Equipment } from "../../types";
import { Reveal } from "../ui/Reveal";

interface EquipmentCardProps {
  item: Equipment;
  delay?: number;
}

export function EquipmentCard({ item, delay = 0 }: EquipmentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const Icon = item.icon;
  const panelId = `equipment-details-${item.slug}`;

  return (
    <Reveal
      delay={delay}
      className="group flex flex-col rounded-2xl border border-border bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift"
    >
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-light text-accent transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-primary-dark">{item.name}</h3>
      <p className="text-sm leading-relaxed text-text-muted">{item.whatItDoes}</p>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-accent transition-colors hover:text-accent-dark"
      >
        Learn More
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      <div
        id={panelId}
        className={`grid transition-all duration-300 ${
          expanded ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <ul className="flex flex-col gap-2 overflow-hidden border-t border-border pt-4 text-sm text-text-muted">
          {item.details.map((detail) => (
            <li key={detail} className="flex items-start gap-2">
              <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
              {detail}
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
