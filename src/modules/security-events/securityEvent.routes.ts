import { SecurityEventType } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import prisma from '../../config/prisma';
import { verifyToken } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { asyncHandler } from '../../shared/http/asyncHandler';
import { requirePermission } from '../authorization/authorization.middleware';
import { Permission } from '../authorization/permissions';

const querySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    type: z.nativeEnum(SecurityEventType).optional(),
    userId: z.string().uuid().optional(),
  }).strict(),
});

const router = Router();
router.use(verifyToken, requirePermission(Permission.SECURITY_EVENT_READ));
router.get('/', validate(querySchema), asyncHandler(async (req, res) => {
  const { page, limit, type, userId } = req.query as unknown as {
    page: number;
    limit: number;
    type?: SecurityEventType;
    userId?: string;
  };
  const where = { ...(type ? { type } : {}), ...(userId ? { userId } : {}) };
  const [items, total] = await prisma.$transaction([
    prisma.securityEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { user: { select: { id: true, full_name: true, email: true } } },
    }),
    prisma.securityEvent.count({ where }),
  ]);
  res.status(200).json({
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}));

export default router;
