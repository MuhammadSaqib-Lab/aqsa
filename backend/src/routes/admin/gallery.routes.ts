import { Router } from "express";
import { listGalleryImages, uploadGalleryImage, deleteGalleryImage } from "../../controllers/admin/gallery.controller";
import { validate } from "../../middleware/validate";
import { galleryFiltersSchema, createGalleryImageSchema, idParamSchema } from "../../validators/gallery.validators";
import { authenticate } from "../../middleware/auth";
import { uploadImage } from "../../middleware/upload";

const router = Router();
router.use(authenticate);

router.get("/", validate(galleryFiltersSchema, "query"), listGalleryImages);
router.post("/", uploadImage.single("image"), validate(createGalleryImageSchema), uploadGalleryImage);
router.delete("/:id", validate(idParamSchema, "params"), deleteGalleryImage);

export default router;
