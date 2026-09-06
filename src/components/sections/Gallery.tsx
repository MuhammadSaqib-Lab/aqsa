import { gallery } from "../../config/clinic";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

export function Gallery() {
  return (
    <section id="gallery" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Take a Look Inside"
          title="Our Clinic Gallery"
          description="A look at our treatment room and the equipment we use during physiotherapy sessions."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {gallery.map((image, index) => (
            <Reveal
              key={image.src}
              delay={(index % 4) * 80}
              className="group overflow-hidden rounded-2xl border border-border shadow-soft"
            >
              <div className="aspect-[4/5] w-full overflow-hidden">
                <img
                  src={image.src}
                  alt={image.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
