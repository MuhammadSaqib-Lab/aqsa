import { faqs } from "../../config/clinic";
import { FAQAccordion } from "../forms/FAQAccordion";
import { SectionHeading } from "../ui/SectionHeading";

export function FAQSection() {
  return (
    <section id="faq" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title="Frequently Asked Questions"
          description="General answers to common physiotherapy questions. For guidance specific to you, please book an assessment."
        />

        <div className="mt-10">
          <FAQAccordion items={faqs} />
        </div>
      </div>
    </section>
  );
}
