import { UserRole, UserStatus } from '@prisma/client';
import { z } from 'zod';

const idParams = z.object({ id: z.string().uuid() });

export const listUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(100).optional(),
    role: z.nativeEnum(UserRole).optional(),
    status: z.nativeEnum(UserStatus).optional(),
  }).strict(),
});

export const updateUserRoleSchema = z.object({
  params: idParams,
  body: z.object({ role: z.nativeEnum(UserRole) }).strict(),
});

export const updateUserStatusSchema = z.object({
  params: idParams,
  body: z.object({ status: z.nativeEnum(UserStatus) }).strict(),
});
