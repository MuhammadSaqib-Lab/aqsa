import { services } from "../../config/clinic";
import { ServiceCard } from "../cards/ServiceCard";
import { SectionHeading } from "../ui/SectionHeading";

export function Services() {
  return (
    <section id="services" className="bg-bg-subtle py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="What We Offer"
          title="Physiotherapy Services Tailored to You"
          description="From pain management to sports rehabilitation, our services are built around your specific recovery goals."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <ServiceCard key={service.slug} service={service} delay={(index % 3) * 80} />
          ))}
        </div>
      </div>
    </section>
  );
}
