import { Router } from "express";

import {
  submitOrUpdateRating,
} from "../controllers/rating.controller.js";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

import { validate } from "../middleware/validate.middleware.js";
import { ratingSchema } from "../validators/rating.validator.js";

const router = Router();

router.post(
  "/:storeId",
  authenticate,
  authorize("NORMAL_USER"),
  validate(ratingSchema),
  submitOrUpdateRating
);

export default router;