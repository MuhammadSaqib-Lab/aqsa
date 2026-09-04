import { Router } from "express";
import { listReviews, getReview, updateReview, deleteReview } from "../../controllers/admin/review.controller";
import { validate } from "../../middleware/validate";
import { reviewFiltersSchema, updateReviewSchema, idParamSchema } from "../../validators/review.validators";
import { authenticate } from "../../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/", validate(reviewFiltersSchema, "query"), listReviews);
router.get("/:id", validate(idParamSchema, "params"), getReview);
router.patch("/:id", validate(idParamSchema, "params"), validate(updateReviewSchema), updateReview);
router.delete("/:id", validate(idParamSchema, "params"), deleteReview);

export default router;
