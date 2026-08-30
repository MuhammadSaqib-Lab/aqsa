import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { clinic } from "../../config/clinic";
import { ContactCard } from "../cards/ContactCard";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

export function Contact() {
  return (
    <section id="contact" className="bg-bg-subtle py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Contact"
          title={clinic.name}
          description="Reach out to plan your visit, ask a question, or book an assessment."
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-5">
          <div className="flex flex-col gap-4 lg:col-span-2">
            <ContactCard icon={Phone} label="Phone" value={clinic.phonePrimary} href={clinic.phonePrimaryHref} />
            <ContactCard
              icon={MessageCircle}
              label="WhatsApp"
              value={clinic.whatsapp}
              href={clinic.whatsappHref}
            />
            <ContactCard icon={Mail} label="Email" value={clinic.email} href={clinic.emailHref} />
            <ContactCard icon={MapPin} label="Address" value={clinic.address} />
            <div className="rounded-2xl border border-border bg-white p-5">
              <div className="mb-3 flex items-center gap-2 text-primary">
                <Clock className="h-5 w-5" aria-hidden="true" />
                <p className="text-xs font-semibold uppercase tracking-wide text-text-soft">
                  Opening Hours
                </p>
              </div>
              <ul className="flex flex-col gap-1.5">
                {clinic.hours.map((entry) => (
                  <li key={entry.day} className="flex justify-between text-sm text-text">
                    <span>{entry.day}</span>
                    <span className="font-medium">{entry.time}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-text-soft">{clinic.hoursNote}</p>
            </div>
          </div>

          <Reveal className="overflow-hidden rounded-2xl border border-border shadow-soft lg:col-span-3">
            <iframe
              title={`Map showing the approximate location of ${clinic.name}`}
              src={clinic.mapEmbedSrc}
              className="h-80 w-full lg:h-full lg:min-h-[420px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
