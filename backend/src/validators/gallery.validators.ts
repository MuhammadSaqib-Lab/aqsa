import { z } from "zod";
import { paginationSchema } from "./pagination.validators";

export const createGalleryImageSchema = z.object({
  title: z.string().trim().max(150, "Title is too long.").optional().or(z.literal("")),
  caption: z.string().trim().max(500, "Caption is too long.").optional().or(z.literal("")),
});
export type CreateGalleryImageInput = z.infer<typeof createGalleryImageSchema>;

export const galleryFiltersSchema = paginationSchema;

export const idParamSchema = z.object({ id: z.string().uuid("Invalid id") });
