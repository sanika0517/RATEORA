import { Router } from "express";

import {
  getOwnerDashboard,
} from "../controllers/owner.controller.js";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

const router = Router();

// Protect all Store Owner routes
router.use(authenticate, authorize("STORE_OWNER"));

// Dashboard
router.get("/dashboard", getOwnerDashboard);

export default router;