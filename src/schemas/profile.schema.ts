import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    full_name: z.string().trim().min(2).max(100).optional(),
    avatar: z.string().max(2_000_000).optional().nullable(),
  }).strict().refine((value) => Object.keys(value).length > 0),
});

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1),
    newPassword: z.string().min(8).max(72),
  }).strict(),
});

export const pushTokenSchema = z.object({
  body: z.object({ token: z.string().trim().min(1).max(512) }).strict(),
});
