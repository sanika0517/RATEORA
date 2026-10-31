import { Router } from "express";
import {
  getAllStores,
} from "../controllers/store.controller.js";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

// Only logged-in Normal Users can access store listings
router.get(
  "/",
  authenticate,
  authorize("NORMAL_USER"),
  getAllStores
);

export default router;