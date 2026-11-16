import { z } from 'zod';
import { CUSTOM_ALIAS_REGEX, RESERVED_SLUGS } from '../constants/index.js';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const createLinkSchema = z.object({
  originalUrl: z
    .string()
    .trim()
    .url('Must be a valid URL')
    .refine(
      (url) => {
        try {
          const parsed = new URL(url);
          return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch {
          return false;
        }
      },
      { message: 'URL protocol must be http or https' }
    ),
  title: z.string().trim().max(120, 'Title cannot exceed 120 characters').optional(),
  customAlias: z
    .string()
    .trim()
    .regex(
      CUSTOM_ALIAS_REGEX,
      'Alias must be 3-50 characters and contain only letters, numbers, hyphens, and underscores'
    )
    .refine((alias) => !RESERVED_SLUGS.includes(alias.toLowerCase() as any), {
      message: 'This alias is reserved by the system',
    })
    .optional()
    .or(z.literal('')),
  expiresAt: z
    .string()
    .datetime({ offset: true })
    .optional()
    .nullable()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d{3})?)?)?(Z|[+-]\d{2}:\d{2})?$/))
    .or(z.literal(''))
    .refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        return !isNaN(date.getTime()) && date.getTime() > Date.now();
      },
      { message: 'Expiration date must be in the future' }
    ),
});

export const updateLinkSchema = z.object({
  title: z.string().trim().max(120).optional(),
  originalUrl: z
    .string()
    .trim()
    .url('Must be a valid URL')
    .refine(
      (url) => {
        try {
          const parsed = new URL(url);
          return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch {
          return false;
        }
      },
      { message: 'URL protocol must be http or https' }
    )
    .optional(),
  expiresAt: z
    .string()
    .nullable()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        return !isNaN(date.getTime()) && date.getTime() > Date.now();
      },
      { message: 'Expiration date must be in the future' }
    ),
});

export const updateLinkStatusSchema = z.object({
  status: z.enum(['active', 'disabled']),
});

export const linkQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(['all', 'active', 'disabled', 'expired']).optional().default('all'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;
export type UpdateLinkStatusInput = z.infer<typeof updateLinkStatusSchema>;
export type LinkQueryParams = z.infer<typeof linkQuerySchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
