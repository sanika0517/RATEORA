import { z } from "zod";

const nameSchema = z
  .string()
  .trim()
  .min(20, "Name must contain at least 20 characters")
  .max(60, "Name cannot exceed 60 characters");

const emailSchema = z
  .string()
  .trim()
  .email("Please enter a valid email address")
  .max(255)
  .transform((email) => email.toLowerCase());

const addressSchema = z
  .string()
  .trim()
  .min(1, "Address is required")
  .max(400, "Address cannot exceed 400 characters");

const passwordSchema = z
  .string()
  .min(8, "Password must contain at least 8 characters")
  .max(16, "Password cannot exceed 16 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[^A-Za-z0-9]/, "Password must contain a special character");

export const createUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  address: addressSchema,
  password: passwordSchema,
  role: z.enum(["ADMIN", "NORMAL_USER", "STORE_OWNER"]),
});

// STORE CREATION VALIDATION
export const createStoreSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  address: addressSchema,
  ownerId: z.string().uuid("Invalid Store Owner ID"),
});