import { apiRequest } from "./apiClient";
import type { GalleryImage } from "../types";

export function fetchGalleryImages() {
  return apiRequest<GalleryImage[]>("/gallery");
}
