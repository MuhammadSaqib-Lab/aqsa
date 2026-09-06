import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/apiResponse";
import { ApiError } from "../../utils/ApiError";
import * as galleryService from "../../services/gallery.service";
import * as imageStorage from "../../services/imageStorage.service";
import type { GalleryFilters } from "../../services/gallery.service";

export const listGalleryImages = asyncHandler(async (req: Request, res: Response) => {
  const result = await galleryService.listGalleryImages(req.query as unknown as GalleryFilters);
  sendSuccess(res, result, "Gallery images retrieved");
});

export const uploadGalleryImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest("An image file is required.");

  const uploaded = await imageStorage.uploadImage(req.file.buffer, req.file.mimetype);
  if (!uploaded) throw ApiError.internal("Gallery uploads are not configured yet — set the Cloudinary environment variables.");

  const image = await galleryService.createGalleryImage({
    imageUrl: uploaded.url,
    publicId: uploaded.publicId,
    title: req.body.title,
    caption: req.body.caption,
  });
  sendSuccess(res, image, "Image uploaded", 201);
});

export const deleteGalleryImage = asyncHandler(async (req: Request, res: Response) => {
  const image = await galleryService.deleteGalleryImage(req.params.id);
  await imageStorage.deleteImage(image.publicId);
  sendSuccess(res, null, "Image deleted");
});
