import { HeartPulse, Sparkles, Target, Users } from "lucide-react";
import { clinic, team } from "../../config/clinic";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";
import { TeamCard } from "../cards/TeamCard";

const stats = [
  { icon: Target, label: "Personalized Care" },
  { icon: Sparkles, label: "Evidence-Based Approach" },
  { icon: Users, label: "Patient-Focused Treatment" },
  { icon: HeartPulse, label: "Rehabilitation Support" },
];

export function About() {
  return (
    <section id="about" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal className="relative mx-auto w-full max-w-md lg:max-w-lg">
            <div className="aspect-[4/5] w-full overflow-hidden rounded-[2rem] shadow-lift">
              <img
                src="/images/clinic-band-exercise.jpg"
                alt="Physiotherapist at Aqsa Physiotherapy Centre guiding a patient through resistance band exercise therapy"
                className="h-full w-full object-cover object-center"
                loading="lazy"
                width={420}
                height={320}
              />
            </div>
            <div className="absolute -bottom-6 -right-4 hidden w-52 rounded-2xl border border-border bg-white p-4 shadow-lift sm:block">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-soft">
                Our Mission
              </p>
              <p className="mt-1 text-sm leading-snug text-text">
                Helping patients move, recover, and live with greater independence.
              </p>
            </div>
          </Reveal>

          <div className="flex flex-col gap-6">
            <SectionHeading
              eyebrow="About Our Centre"
              title={`About ${clinic.name}`}
              align="left"
            />
            <p className="text-base leading-relaxed text-text-muted">
              {clinic.name} focuses on helping patients improve mobility, reduce pain,
              recover from injuries, and achieve better physical function through
              personalized physiotherapy care. Our approach centers on understanding
              each patient's goals and building a rehabilitation plan around them.
            </p>
            <p className="text-base leading-relaxed text-text-muted">
              We aim to provide a supportive, patient-centered environment where
              recovery feels structured and achievable — combining hands-on
              physiotherapy with clear guidance for everyday life.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-start gap-2 rounded-xl bg-bg-subtle p-4"
                >
                  <stat.icon className="h-5 w-5 text-accent" aria-hidden="true" />
                  <span className="text-xs font-medium leading-tight text-text">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-20 sm:mt-28">
          <SectionHeading
            eyebrow="Our Team"
            title="Meet the People Behind Your Care"
            description="A dedicated team focused on structured, hands-on physiotherapy and rehabilitation."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {team.map((member, index) => (
              <TeamCard key={member.name} member={member} delay={index * 100} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
