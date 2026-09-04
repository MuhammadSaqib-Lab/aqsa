import { equipment } from "../../config/clinic";
import { EquipmentCard } from "../cards/EquipmentCard";
import { SectionHeading } from "../ui/SectionHeading";

export function Equipment() {
  return (
    <section id="equipment" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Physiotherapy Equipment"
          title="Equipment Commonly Used in Physiotherapy"
          description="A general overview of equipment often used as part of physiotherapy and rehabilitation care. The equipment used during your treatment depends on your individual assessment and plan."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {equipment.map((item, index) => (
            <EquipmentCard key={item.slug} item={item} delay={(index % 3) * 80} />
          ))}
        </div>
      </div>
    </section>
  );
}
