import type { GalleryImage } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { buildPaginationMeta, toSkipTake } from "../utils/pagination";
import type { PaginatedData } from "../types/api";

export interface GalleryFilters {
  page: number;
  limit: number;
}

export async function listGalleryImages(filters: GalleryFilters): Promise<PaginatedData<GalleryImage>> {
  const { skip, take } = toSkipTake(filters);
  const [items, total] = await prisma.$transaction([
    prisma.galleryImage.findMany({ skip, take, orderBy: { createdAt: "desc" } }),
    prisma.galleryImage.count(),
  ]);
  return { items, pagination: buildPaginationMeta(filters.page, filters.limit, total) };
}

/** Public gallery page — the full current set, no pagination (small dataset by design). */
export async function listPublicGalleryImages(): Promise<GalleryImage[]> {
  return prisma.galleryImage.findMany({ orderBy: { createdAt: "desc" } });
}

export interface CreateGalleryImageData {
  imageUrl: string;
  publicId: string;
  title?: string;
  caption?: string;
}

export async function createGalleryImage(input: CreateGalleryImageData): Promise<GalleryImage> {
  return prisma.galleryImage.create({
    data: {
      imageUrl: input.imageUrl,
      publicId: input.publicId,
      title: input.title || null,
      caption: input.caption || null,
    },
  });
}

export async function getGalleryImageById(id: string): Promise<GalleryImage> {
  const image = await prisma.galleryImage.findUnique({ where: { id } });
  if (!image) throw ApiError.notFound("Gallery image not found");
  return image;
}

export async function deleteGalleryImage(id: string): Promise<GalleryImage> {
  const image = await getGalleryImageById(id);
  await prisma.galleryImage.delete({ where: { id } });
  return image;
}
