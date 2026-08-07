import { Prisma, type UserRole, type UserStatus } from '@prisma/client';
import prisma from '../../config/prisma';
import { AppError } from '../../errors/AppError';
import { recordSecurityEvent } from '../../services/securityAudit.service';
import type { RequestMetadata } from '../../utils/requestMetadata';
import type { AuthenticatedActor } from '../authorization/actor';

const publicUserSelect = {
  id: true,
  full_name: true,
  email: true,
  avatar: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

async function assertNotRemovingLastAdmin(
  tx: Prisma.TransactionClient,
  userId: string,
  nextRole?: UserRole,
  nextStatus?: UserStatus,
): Promise<void> {
  const target = await tx.user.findUnique({
    where: { id: userId },
    select: { role: true, status: true },
  });
  if (!target) throw new AppError(404, 'Không tìm thấy người dùng');

  const removesActiveAdmin = target.role === 'ADMIN'
    && target.status === 'ACTIVE'
    && (nextRole && nextRole !== 'ADMIN' || nextStatus && nextStatus !== 'ACTIVE');
  if (!removesActiveAdmin) return;

  const activeAdmins = await tx.user.count({ where: { role: 'ADMIN', status: 'ACTIVE' } });
  if (activeAdmins <= 1) throw new AppError(409, 'Hệ thống phải còn ít nhất một Admin đang hoạt động');
}

export const userService = {
  async list(input: {
    page: number;
    limit: number;
    search?: string;
    role?: UserRole;
    status?: UserStatus;
  }) {
    const where: Prisma.UserWhereInput = {
      ...(input.role ? { role: input.role } : {}),
      ...(input.status ? { status: input.status } : {}),
      ...(input.search ? {
        OR: [
          { full_name: { contains: input.search, mode: 'insensitive' } },
          { email: { contains: input.search, mode: 'insensitive' } },
        ],
      } : {}),
    };
    const [items, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        select: publicUserSelect,
        orderBy: { createdAt: 'desc' },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      prisma.user.count({ where }),
    ]);
    return {
      items,
      pagination: {
        page: input.page,
        limit: input.limit,
        total,
        totalPages: Math.ceil(total / input.limit),
      },
    };
  },

  async updateRole(
    actor: AuthenticatedActor,
    userId: string,
    role: UserRole,
    metadata: RequestMetadata,
  ) {
    const result = await prisma.$transaction(async (tx) => {
      await assertNotRemovingLastAdmin(tx, userId, role, undefined);
      const before = await tx.user.findUnique({ where: { id: userId }, select: publicUserSelect });
      if (!before) throw new AppError(404, 'Không tìm thấy người dùng');
      if (before.role === role) return { before, user: before, changed: false };
      const user = await tx.user.update({
        where: { id: userId },
        data: { role, tokenVersion: { increment: 1 } },
        select: publicUserSelect,
      });
      await tx.refreshSession.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date(), revokeReason: 'ROLE_CHANGED' },
      });
      return { before, user, changed: true };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    if (result.changed) {
      await recordSecurityEvent({
        userId,
        type: 'ROLE_CHANGED',
        ...metadata,
        metadata: { actorId: actor.userId, from: result.before.role, to: role },
      });
    }
    return result.user;
  },

  async updateStatus(
    actor: AuthenticatedActor,
    userId: string,
    status: UserStatus,
    metadata: RequestMetadata,
  ) {
    if (actor.userId === userId && status !== 'ACTIVE') {
      throw new AppError(409, 'Bạn không thể tự khóa tài khoản đang đăng nhập');
    }
    const result = await prisma.$transaction(async (tx) => {
      await assertNotRemovingLastAdmin(tx, userId, undefined, status);
      const before = await tx.user.findUnique({ where: { id: userId }, select: publicUserSelect });
      if (!before) throw new AppError(404, 'Không tìm thấy người dùng');
      if (before.status === status) return { before, user: before, changed: false };
      const user = await tx.user.update({
        where: { id: userId },
        data: { status, tokenVersion: { increment: 1 } },
        select: publicUserSelect,
      });
      await tx.refreshSession.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date(), revokeReason: `STATUS_${status}` },
      });
      return { before, user, changed: true };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    if (result.changed) {
      await recordSecurityEvent({
        userId,
        type: 'ACCOUNT_STATUS_CHANGED',
        ...metadata,
        metadata: { actorId: actor.userId, from: result.before.status, to: status },
      });
    }
    return result.user;
  },
};
