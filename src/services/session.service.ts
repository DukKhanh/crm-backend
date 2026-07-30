import crypto from 'crypto';
import type { User, UserRole } from '@prisma/client';
import prisma from '../config/prisma';
import { AppError } from '../errors/AppError';
import { createAccessToken, createRefreshToken, hashToken, refreshExpiryDate, verifyRefreshToken } from '../utils/token';
import type { RequestMetadata } from '../utils/requestMetadata';
import { recordSecurityEvent } from './securityAudit.service';

export async function createSession(user: Pick<User, 'id' | 'role'>, metadata: RequestMetadata) {
  const sessionId = crypto.randomUUID();
  const familyId = crypto.randomUUID();
  const refreshToken = createRefreshToken(user.id, user.role, sessionId, familyId);
  await prisma.refreshSession.create({
    data: {
      id: sessionId,
      familyId,
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: refreshExpiryDate(),
      ...metadata,
    },
  });
  await recordSecurityEvent({ userId: user.id, type: 'LOGIN_SUCCESS', sessionId, familyId, ...metadata });
  return { token: createAccessToken(user.id, user.role), refreshToken };
}

async function revokeFamily(familyId: string, reason: string): Promise<void> {
  await prisma.refreshSession.updateMany({
    where: { familyId, revokedAt: null },
    data: { revokedAt: new Date(), revokeReason: reason },
  });
}

export async function rotateSession(oldToken: string, metadata: RequestMetadata) {
  let payload;
  try {
    payload = verifyRefreshToken(oldToken);
  } catch {
    throw new AppError(403, 'Refresh token không hợp lệ hoặc đã hết hạn');
  }
  if (payload.type !== 'refresh') throw new AppError(403, 'Sai loại token');

  const session = await prisma.refreshSession.findUnique({ where: { id: payload.sessionId } });
  const tokenMatches = session ? crypto.timingSafeEqual(Buffer.from(session.tokenHash), Buffer.from(hashToken(oldToken))) : false;

  if (!session || session.userId !== payload.userId || session.familyId !== payload.familyId || !tokenMatches) {
    await revokeFamily(payload.familyId, 'TOKEN_MISMATCH_OR_UNKNOWN_SESSION');
    await recordSecurityEvent({
      userId: payload.userId,
      type: 'REFRESH_REUSE_DETECTED',
      sessionId: payload.sessionId,
      familyId: payload.familyId,
      ...metadata,
      metadata: { reason: 'unknown_session_or_hash_mismatch' },
    });
    throw new AppError(403, 'Phát hiện phiên đăng nhập bất thường; vui lòng đăng nhập lại');
  }

  if (session.revokedAt) {
    await revokeFamily(session.familyId, 'REFRESH_TOKEN_REUSE');
    await recordSecurityEvent({
      userId: session.userId,
      type: 'REFRESH_REUSE_DETECTED',
      sessionId: session.id,
      familyId: session.familyId,
      ...metadata,
      metadata: { revokedAt: session.revokedAt.toISOString() },
    });
    throw new AppError(403, 'Phát hiện refresh token đã được sử dụng lại; toàn bộ phiên đã bị thu hồi');
  }
  if (session.expiresAt <= new Date()) throw new AppError(403, 'Refresh token đã hết hạn');

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) throw new AppError(403, 'Phiên đăng nhập không hợp lệ');

  const nextSessionId = crypto.randomUUID();
  const nextToken = createRefreshToken(user.id, user.role, nextSessionId, session.familyId);
  const now = new Date();

  const rotated = await prisma.$transaction(async (tx) => {
    const consumed = await tx.refreshSession.updateMany({
      where: { id: session.id, revokedAt: null },
      data: { revokedAt: now, revokeReason: 'ROTATED', replacedById: nextSessionId, lastUsedAt: now },
    });
    if (consumed.count !== 1) return false;
    await tx.refreshSession.create({
      data: {
        id: nextSessionId,
        familyId: session.familyId,
        parentSessionId: session.id,
        userId: user.id,
        tokenHash: hashToken(nextToken),
        expiresAt: refreshExpiryDate(),
        ...metadata,
      },
    });
    return true;
  });

  if (!rotated) {
    await revokeFamily(session.familyId, 'CONCURRENT_REFRESH_REUSE');
    await recordSecurityEvent({ userId: user.id, type: 'REFRESH_REUSE_DETECTED', sessionId: session.id, familyId: session.familyId, ...metadata });
    throw new AppError(403, 'Phát hiện refresh token được sử dụng đồng thời; vui lòng đăng nhập lại');
  }

  await recordSecurityEvent({ userId: user.id, type: 'TOKEN_ROTATED', sessionId: nextSessionId, familyId: session.familyId, ...metadata });
  return { token: createAccessToken(user.id, user.role), refreshToken: nextToken };
}

export async function revokeToken(refreshToken: string, metadata: RequestMetadata): Promise<void> {
  try {
    const payload = verifyRefreshToken(refreshToken);
    await prisma.refreshSession.updateMany({
      where: { id: payload.sessionId, userId: payload.userId, revokedAt: null },
      data: { revokedAt: new Date(), revokeReason: 'LOGOUT' },
    });
    await recordSecurityEvent({ userId: payload.userId, type: 'LOGOUT', sessionId: payload.sessionId, familyId: payload.familyId, ...metadata });
  } catch {
    // Logout remains idempotent and does not reveal token validity.
  }
}

export async function revokeAllUserSessions(userId: string, reason: string): Promise<void> {
  await prisma.refreshSession.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date(), revokeReason: reason } });
}
