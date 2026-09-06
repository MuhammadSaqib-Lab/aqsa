import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env";
import { logger } from "../config/logger";

let configured = false;
let attemptedInit = false;

/**
 * Lazy config, mirroring email.service.ts's Resend pattern: a missing key
 * must never crash the server, only disable the feature.
 */
function isConfigured(): boolean {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    return false;
  }
  if (!configured && !attemptedInit) {
    attemptedInit = true;
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }
  return configured;
}

export interface UploadedImage {
  url: string;
  publicId: string;
}

/** Returns undefined (rather than throwing) when Cloudinary isn't configured — callers turn that into a clean ApiError. */
export async function uploadImage(buffer: Buffer, mimeType: string): Promise<UploadedImage | undefined> {
  if (!isConfigured()) {
    logger.warn("Gallery upload skipped — Cloudinary credentials are not set.");
    return undefined;
  }
  const dataUri = `data:${mimeType};base64,${buffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(dataUri, { folder: "aqsa-physio/gallery" });
  return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteImage(publicId: string): Promise<void> {
  if (!isConfigured()) {
    logger.warn({ publicId }, "Gallery image delete skipped — Cloudinary credentials are not set.");
    return;
  }
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    const deleteErr = err as { message?: string };
    logger.error({ publicId, errorMessage: deleteErr.message }, "Cloudinary delete failed");
  }
}
