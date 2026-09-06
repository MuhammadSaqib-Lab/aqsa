import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import * as adminApi from "../api/adminApi";
import { ApiRequestError } from "../../lib/apiClient";
import type { AdminGalleryImage, Paginated } from "../types";
import { LoadingBlock } from "../components/LoadingBlock";
import { ErrorBlock } from "../components/ErrorBlock";
import { EmptyState } from "../components/EmptyState";
import { Pagination } from "../components/Pagination";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../context/ToastContext";

const LIMIT = 20;

export function GalleryPage() {
  const { showToast } = useToast();

  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Paginated<AdminGalleryImage> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [deleteTarget, setDeleteTarget] = useState<AdminGalleryImage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = () => {
    setIsLoading(true);
    setError(null);
    adminApi
      .listGalleryImages({ page, limit: LIMIT })
      .then(setResult)
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Failed to load gallery images."))
      .finally(() => setIsLoading(false));
  };

  useEffect(load, [page]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setUploadError("Please choose an image to upload.");
      return;
    }
    setIsUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append("image", file);
    if (title.trim()) formData.append("title", title.trim());
    if (caption.trim()) formData.append("caption", caption.trim());

    try {
      const image = await adminApi.uploadGalleryImage(formData);
      setResult((prev) =>
        prev ? { ...prev, items: [image, ...prev.items], pagination: { ...prev.pagination, total: prev.pagination.total + 1 } } : prev
      );
      setTitle("");
      setCaption("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      showToast("Image uploaded.");
    } catch (err) {
      setUploadError(err instanceof ApiRequestError ? err.message : "Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await adminApi.deleteGalleryImage(deleteTarget.id);
      setResult((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.filter((img) => img.id !== deleteTarget.id),
              pagination: { ...prev.pagination, total: prev.pagination.total - 1 },
            }
          : prev
      );
      showToast("Image deleted.");
      setDeleteTarget(null);
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : "Failed to delete image.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-primary-dark">Gallery</h1>
        <p className="mt-1 text-sm text-text-soft">Upload and manage photos shown on the public gallery page.</p>
      </div>

      <form
        onSubmit={handleUpload}
        className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-4 shadow-soft sm:p-6"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label htmlFor="gallery-file" className="mb-1.5 block text-sm font-medium text-text">
              Image
            </label>
            <input
              ref={fileInputRef}
              id="gallery-file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-text-muted file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-dark"
            />
          </div>
          <div className="sm:col-span-1">
            <label htmlFor="gallery-title" className="mb-1.5 block text-sm font-medium text-text">
              Title (optional)
            </label>
            <input
              id="gallery-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={150}
              className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>
          <div className="sm:col-span-1">
            <label htmlFor="gallery-caption" className="mb-1.5 block text-sm font-medium text-text">
              Caption (optional)
            </label>
            <input
              id="gallery-caption"
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={500}
              className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>
        </div>
        {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
        <div>
          <Button
            type="submit"
            size="md"
            disabled={isUploading}
            icon={isUploading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Upload className="h-4 w-4" aria-hidden="true" />}
            iconPosition="left"
          >
            {isUploading ? "Uploading…" : "Upload image"}
          </Button>
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft">
        {isLoading ? (
          <LoadingBlock label="Loading gallery…" />
        ) : error ? (
          <ErrorBlock message={error} onRetry={load} />
        ) : !result || result.items.length === 0 ? (
          <EmptyState icon={ImageIcon} title="No images yet" description="Upload your first photo above." />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 sm:p-6 lg:grid-cols-4">
              {result.items.map((image) => (
                <div key={image.id} className="group relative overflow-hidden rounded-xl border border-border">
                  <div className="aspect-[4/5] w-full overflow-hidden bg-bg-muted">
                    <img src={image.imageUrl} alt={image.title ?? ""} className="h-full w-full object-cover" />
                  </div>
                  {(image.title || image.caption) && (
                    <div className="p-2.5">
                      {image.title && <p className="truncate text-sm font-medium text-text">{image.title}</p>}
                      {image.caption && <p className="truncate text-xs text-text-soft">{image.caption}</p>}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(image)}
                    aria-label="Delete image"
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-600 opacity-0 shadow-soft transition-opacity hover:bg-white group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
            <Pagination meta={result.pagination} onPageChange={setPage} />
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete image"
        description="This photo will be permanently removed from the gallery. This cannot be undone."
        confirmLabel="Delete"
        isDangerous
        isSubmitting={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
