
import { Router } from "express";

import {
  register,
  login,
  getMe,
  changePassword,
  logout,
} from "../controllers/auth.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} from "../validators/auth.validator.js";

import { validate } from "../middleware/validate.middleware.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

router.get("/me", authenticate, getMe);

router.post(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  changePassword
);

router.post("/logout", authenticate, logout);

export default router;
