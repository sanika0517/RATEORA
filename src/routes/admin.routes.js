import { Router } from "express";

import {
  getDashboardStats,
  createUser,
  getAllUsers,
  getUserDetails,
  updateUser,
  resetUserPassword,
  deleteUser,
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
  updateUserSchema,
  resetUserPasswordSchema,
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
router.patch("/users/:userId", validate(updateUserSchema), updateUser);
router.post(
  "/users/:userId/reset-password",
  validate(resetUserPasswordSchema),
  resetUserPassword
);
router.delete("/users/:userId", deleteUser);

// Store management
router.post("/stores", validate(createStoreSchema), createStore);

// Get all stores with search, sorting and pagination
router.get("/stores", getAllStores);

export default router;
