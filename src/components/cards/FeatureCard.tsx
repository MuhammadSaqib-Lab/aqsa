import type { Feature } from "../../types";
import { Reveal } from "../ui/Reveal";

interface FeatureCardProps {
  feature: Feature;
  delay?: number;
}

export function FeatureCard({ feature, delay = 0 }: FeatureCardProps) {
  const Icon = feature.icon;

  return (
    <Reveal
      delay={delay}
      className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="text-base font-semibold text-primary-dark">{feature.title}</h3>
      <p className="text-sm leading-relaxed text-text-muted">{feature.description}</p>
    </Reveal>
  );
}
