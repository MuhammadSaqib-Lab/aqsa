import { Router } from "express";
import { createReview, listPublicReviews } from "../controllers/review.controller";
import { validate } from "../middleware/validate";
import { createReviewSchema } from "../validators/review.validators";
import { paginationSchema } from "../validators/pagination.validators";
import { reviewSubmissionLimiter } from "../middleware/rateLimiters";
import { authenticatePatient } from "../middleware/patientAuth";

const router = Router();

router.get("/", validate(paginationSchema, "query"), listPublicReviews);
router.post("/", authenticatePatient, reviewSubmissionLimiter, validate(createReviewSchema), createReview);

export default router;
