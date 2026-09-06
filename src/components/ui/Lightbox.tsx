import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useLockBodyScroll } from "../../hooks/useLockBodyScroll";
import type { GalleryImage } from "../../types";

interface LightboxProps {
  images: GalleryImage[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

/**
 * Full-screen image preview — distinct from ui/Modal.tsx on purpose: Modal is
 * a padded white card meant for forms/content, while a gallery preview wants
 * an immersive dark backdrop with the photo as large as possible.
 */
export function Lightbox({ images, index, onClose, onIndexChange }: LightboxProps) {
  useLockBodyScroll(true);
  const image = images[index];
  const hasMultiple = images.length > 1;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowRight" && hasMultiple) onIndexChange((index + 1) % images.length);
      else if (event.key === "ArrowLeft" && hasMultiple) onIndexChange((index - 1 + images.length) % images.length);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [index, images.length, hasMultiple, onClose, onIndexChange]);

  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-primary-dark/95 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={image.title ?? "Gallery image preview"}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close preview"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onIndexChange((index - 1 + images.length) % images.length);
            }}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-4"
          >
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onIndexChange((index + 1) % images.length);
            }}
            aria-label="Next image"
            className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-4"
          >
            <ChevronRight className="h-6 w-6" aria-hidden="true" />
          </button>
        </>
      )}

      <div className="flex max-h-full max-w-full flex-col items-center gap-4" onClick={(event) => event.stopPropagation()}>
        <img
          src={image.imageUrl}
          alt={image.title ?? "Aqsa Physiotherapy Centre"}
          className="max-h-[80vh] max-w-[90vw] rounded-xl object-contain shadow-lift"
        />
        {(image.title || image.caption) && (
          <div className="max-w-lg text-center text-white">
            {image.title && <p className="font-semibold">{image.title}</p>}
            {image.caption && <p className="mt-1 text-sm text-white/80">{image.caption}</p>}
          </div>
        )}
        {hasMultiple && (
          <p className="text-xs text-white/60">
            {index + 1} / {images.length}
          </p>
        )}
      </div>
    </div>
  );
}
