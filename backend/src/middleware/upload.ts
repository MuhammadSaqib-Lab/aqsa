import multer from "multer";
import { ApiError } from "../utils/ApiError";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

/**
 * Memory storage only — never disk. Render's filesystem is ephemeral, so a
 * buffer that goes straight to Cloudinary is the only option that survives a
 * deploy/restart; writing to local disk first would just be discarded work.
 */
export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(ApiError.badRequest("Only JPEG, PNG, or WebP images are allowed."));
      return;
    }
    cb(null, true);
  },
});
