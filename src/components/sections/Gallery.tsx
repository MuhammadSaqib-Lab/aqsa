import { useEffect, useState } from "react";
import { Loader2, ImageOff } from "lucide-react";
import { fetchGalleryImages } from "../../lib/galleryApi";
import { ApiRequestError } from "../../lib/apiClient";
import type { GalleryImage } from "../../types";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";
import { Lightbox } from "../ui/Lightbox";

export function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    fetchGalleryImages()
      .then((data) => {
        if (!cancelled) setImages(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiRequestError ? err.message : "Couldn't load the gallery right now.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="gallery" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Take a Look Inside"
          title="Our Clinic Gallery"
          description="A look at our treatment room and the equipment we use during physiotherapy sessions."
        />

        {isLoading ? (
          <div className="mt-12 flex flex-col items-center justify-center gap-3 py-16 text-text-soft">
            <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
            <p className="text-sm">Loading gallery…</p>
          </div>
        ) : error ? (
          <div className="mt-12 flex flex-col items-center justify-center gap-2 py-16 text-center text-text-soft">
            <ImageOff className="h-8 w-8" aria-hidden="true" />
            <p className="text-sm">{error}</p>
          </div>
        ) : images.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center gap-2 py-16 text-center text-text-soft">
            <ImageOff className="h-8 w-8" aria-hidden="true" />
            <p className="text-sm">No photos have been added yet — check back soon.</p>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {images.map((image, index) => (
              <Reveal
                key={image.id}
                delay={(index % 4) * 80}
                className="group overflow-hidden rounded-2xl border border-border shadow-soft"
              >
                <button
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  aria-label={`View larger image${image.title ? `: ${image.title}` : ""}`}
                  className="block aspect-[4/5] w-full cursor-pointer overflow-hidden border-0 bg-transparent p-0"
                >
                  <img
                    src={image.imageUrl}
                    alt={image.title ?? "Aqsa Physiotherapy Centre"}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </button>
                {(image.title || image.caption) && (
                  <div className="p-4">
                    {image.title && <p className="font-medium text-text">{image.title}</p>}
                    {image.caption && <p className="mt-1 text-sm text-text-soft">{image.caption}</p>}
                  </div>
                )}
              </Reveal>
            ))}
          </div>
        )}
      </div>

      {selectedIndex !== null && (
        <Lightbox images={images} index={selectedIndex} onClose={() => setSelectedIndex(null)} onIndexChange={setSelectedIndex} />
      )}
    </section>
  );
}
