import { Reveal } from "./Reveal";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: SectionHeadingProps) {
  const alignment = align === "center" ? "mx-auto text-center items-center" : "text-left items-start";

  return (
    <Reveal className={`flex max-w-2xl flex-col gap-4 ${alignment}`}>
      {eyebrow && (
        <span className="inline-flex items-center gap-2 rounded-full bg-accent-light px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent-dark">
          {eyebrow}
        </span>
      )}
      <h2 className="text-balance text-3xl font-semibold text-primary-dark sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="text-balance text-base text-text-muted sm:text-lg">
          {description}
        </p>
      )}
    </Reveal>
  );
}
