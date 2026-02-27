import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { ReviewController } from "./Review.controller";
import { ReviewValidation } from "./Review.validation";

const router = express.Router();

router.post(
  "/",
  auth(),
  // validateRequest(ReviewValidation.createSchema),
  ReviewController.createReview
);

router.get("/", auth(), ReviewController.getReviewList);

router.get("/:id", auth(), ReviewController.getReviewById);

router.put(
  "/:id",
  auth(),
  validateRequest(ReviewValidation.updateSchema),
  ReviewController.updateReview
);

router.delete("/:id", auth(), ReviewController.deleteReview);

export const ReviewRoutes = router;
