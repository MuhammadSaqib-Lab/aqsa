import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import * as galleryService from "../services/gallery.service";

export const listPublicGalleryImages = asyncHandler(async (_req: Request, res: Response) => {
  const images = await galleryService.listPublicGalleryImages();
  sendSuccess(res, images, "Gallery images retrieved");
});
