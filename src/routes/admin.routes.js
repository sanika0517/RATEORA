import { Router } from "express";

import {
  getDashboardStats,
  createUser,
  getAllUsers,
  getUserDetails,
  createStore,
  getAllStores,
} from "../controllers/admin.controller.js";

import {
  authenticate,
  authorize,
} from "../middleware/auth.middleware.js";

import { validate } from "../middleware/validate.middleware.js";

import {
  createUserSchema,
  createStoreSchema,
} from "../validators/admin.validator.js";

const router = Router();

// Protect all admin routes
router.use(authenticate, authorize("ADMIN"));

// Dashboard
router.get("/dashboard", getDashboardStats);

// User management
router.post("/users", validate(createUserSchema), createUser);
router.get("/users", getAllUsers);
router.get("/users/:userId", getUserDetails);

// Store management
router.post("/stores", validate(createStoreSchema), createStore);

// Get all stores with search, sorting and pagination
router.get("/stores", getAllStores);

export default router;