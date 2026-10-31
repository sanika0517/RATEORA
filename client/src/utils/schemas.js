import { z } from 'zod'
import { ROLES } from './constants'

export const nameSchema = z
  .string()
  .trim()
  .min(20, 'Name must contain at least 20 characters')
  .max(60, 'Name cannot exceed 60 characters')

export const emailSchema = z
  .string()
  .trim()
  .email('Please enter a valid email address')
  .max(255)
  .transform((email) => email.toLowerCase())

export const addressSchema = z
  .string()
  .trim()
  .min(1, 'Address is required')
  .max(400, 'Address cannot exceed 400 characters')

export const passwordSchema = z
  .string()
  .min(8, 'Password must contain at least 8 characters')
  .max(16, 'Password cannot exceed 16 characters')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[^A-Za-z0-9]/, 'Password must contain a special character')

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  address: addressSchema,
  password: passwordSchema,
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
})

export const registerFormSchema = registerSchema
  .extend({
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const changePasswordFormSchema = changePasswordSchema
  .extend({
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different',
    path: ['newPassword'],
  })

export const createUserSchema = registerSchema.extend({
  role: z.enum([ROLES.ADMIN, ROLES.NORMAL_USER, ROLES.STORE_OWNER], {
    message: 'Select a role',
  }),
})

export const createStoreSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  address: addressSchema,
  ownerId: z.string().uuid('Select a store owner'),
})

export const ratingSchema = z.object({
  rating: z
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
})
