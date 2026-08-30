import type { LucideIcon } from "lucide-react";

interface ContactCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
}

export function ContactCard({ icon: Icon, label, value, href }: ContactCardProps) {
  const content = (
    <div className="flex items-start gap-4 rounded-2xl border border-border bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-text-soft">{label}</p>
        <p className="mt-1 text-sm font-medium text-text">{value}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block" aria-label={`${label}: ${value}`}>
        {content}
      </a>
    );
  }

  return content;
}
