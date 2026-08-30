import { CalendarCheck, PhoneCall } from "lucide-react";
import { clinic } from "../../config/clinic";
import { useAppointment } from "../../context/AppointmentContext";
import { Button } from "../ui/Button";
import { Reveal } from "../ui/Reveal";

export function AppointmentCTA() {
  const { openAppointment } = useAppointment();

  return (
    <section className="relative overflow-hidden bg-primary py-20 sm:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="text-balance font-display text-3xl font-semibold text-white sm:text-4xl">
            Ready to Take the Next Step Toward Better Movement?
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p className="mx-auto mt-4 max-w-xl text-balance text-base text-white/80 sm:text-lg">
            Book an appointment with {clinic.name} and start your rehabilitation journey
            with personalized care.
          </p>
        </Reveal>
        <Reveal delay={200} className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            variant="secondary"
            icon={<CalendarCheck className="h-4 w-4" aria-hidden="true" />}
            iconPosition="left"
            onClick={openAppointment}
          >
            Book an Appointment
          </Button>
          <a
            href="#contact"
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/40 px-7 py-3.5 text-base font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-primary"
          >
            <PhoneCall className="h-4 w-4" aria-hidden="true" />
            Contact Us
          </a>
        </Reveal>
      </div>
    </section>
  );
}
