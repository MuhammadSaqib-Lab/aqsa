import { BadgeCheck } from "lucide-react";
import type { TeamMember } from "../../types";
import { Reveal } from "../ui/Reveal";

interface TeamCardProps {
  member: TeamMember;
  delay?: number;
}

export function TeamCard({ member, delay = 0 }: TeamCardProps) {
  return (
    <Reveal
      delay={delay}
      className="flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift sm:flex-row"
    >
      <img
        src={member.image}
        alt={`Portrait of ${member.name}`}
        loading="lazy"
        decoding="async"
        width={600}
        height={600}
        className="aspect-square w-full shrink-0 object-cover object-top sm:aspect-auto sm:h-auto sm:w-48"
      />
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div>
          <h3 className="text-lg font-semibold text-primary-dark">{member.name}</h3>
          <p className="text-sm font-medium text-accent">{member.role}</p>
        </div>
        <p className="text-sm leading-relaxed text-text-muted">{member.bio}</p>
        <ul className="mt-auto flex flex-wrap gap-x-4 gap-y-1.5 pt-2">
          {member.credentials.map((credential) => (
            <li key={credential} className="flex items-center gap-1.5 text-xs text-text-soft">
              <BadgeCheck className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              {credential}
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}
