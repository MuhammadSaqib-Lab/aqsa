import { ArrowRight, CalendarCheck, ShieldCheck, HeartHandshake, UserRound } from "lucide-react";
import { clinic } from "../../config/clinic";
import { useAppointment } from "../../context/AppointmentContext";
import { Button } from "../ui/Button";
import { Reveal } from "../ui/Reveal";

const trustIndicators = [
  { icon: UserRound, label: "Personalized Treatment" },
  { icon: ShieldCheck, label: "Professional Care" },
  { icon: HeartHandshake, label: "Patient-Focused Approach" },
];

export function Hero() {
  const { openAppointment } = useAppointment();

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-bg-subtle pb-20 pt-32 sm:pb-28 sm:pt-40"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />
        <div className="absolute -right-16 top-40 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
        <div className="animate-float-slow absolute right-[8%] top-24 hidden h-16 w-16 rounded-2xl border border-primary/10 bg-white/60 backdrop-blur sm:block" />
        <div className="animate-float absolute left-[12%] bottom-16 hidden h-12 w-12 rounded-full border border-accent/20 bg-white/60 backdrop-blur sm:block" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="flex flex-col items-start gap-6">
          <Reveal className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary shadow-soft">
            Physiotherapy &amp; Rehabilitation · {clinic.city}
          </Reveal>

          <Reveal delay={80}>
            <h1 className="text-balance font-display text-4xl font-semibold leading-[1.1] text-primary-dark sm:text-5xl lg:text-[3.4rem]">
              {clinic.tagline}
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="max-w-xl text-balance text-base leading-relaxed text-text-muted sm:text-lg">
              Personalized physiotherapy and rehabilitation designed to help you recover,
              regain strength, and return to the activities you love.
            </p>
          </Reveal>

          <Reveal delay={240} className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              icon={<CalendarCheck className="h-4 w-4" aria-hidden="true" />}
              iconPosition="left"
              onClick={openAppointment}
            >
              Book an Appointment
            </Button>
            <Button
              size="lg"
              variant="outline"
              href="#services"
              icon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
            >
              Explore Our Services
            </Button>
          </Reveal>

          <Reveal
            delay={320}
            className="flex flex-wrap gap-x-6 gap-y-3 pt-4"
          >
            {trustIndicators.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm font-medium text-text-muted">
                <item.icon className="h-4 w-4 text-accent" aria-hidden="true" />
                {item.label}
              </div>
            ))}
          </Reveal>
        </div>

        <Reveal delay={200} className="relative mx-auto w-full max-w-md lg:max-w-lg">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] shadow-lift sm:aspect-[5/5.5]">
            <img
              src="/images/clinic-manual-therapy.jpg"
              alt="Physiotherapist providing hands-on back therapy to a patient at Aqsa Physiotherapy Centre"
              className="h-full w-full object-cover object-center"
              width={420}
              height={320}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/40 via-transparent to-transparent" />
          </div>

          <div className="animate-float absolute -left-6 bottom-6 hidden w-48 rounded-2xl border border-border bg-white p-4 shadow-lift sm:block">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-soft">
              Approach
            </p>
            <p className="mt-1 text-sm font-semibold text-primary-dark">
              Evidence-Based Physiotherapy
            </p>
          </div>

          <div className="animate-float-slow absolute -right-4 -top-4 hidden w-44 items-center gap-3 rounded-2xl border border-border bg-white p-3.5 shadow-lift sm:flex">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-light text-accent">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </span>
            <p className="text-xs font-medium text-text">Patient-Focused Care</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
