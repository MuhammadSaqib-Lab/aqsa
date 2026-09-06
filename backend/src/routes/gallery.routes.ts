import { Router } from "express";
import { listPublicGalleryImages } from "../controllers/gallery.controller";

const router = Router();

router.get("/", listPublicGalleryImages);

export default router;
