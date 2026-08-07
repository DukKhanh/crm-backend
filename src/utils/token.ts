import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import type { UserRole } from '@prisma/client';
import { env } from '../config/env';

export interface RefreshTokenPayload {
  userId: string;
  role: UserRole;
  tokenVersion: number;
  type: 'refresh';
  sessionId: string;
  familyId: string;
}

export const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');

export const createAccessToken = (userId: string, role: UserRole, tokenVersion: number): string =>
  jwt.sign({ userId, role, tokenVersion, type: 'access' }, env.JWT_ACCESS_SECRET, {
    expiresIn: `${env.ACCESS_TOKEN_MINUTES}m`,
    issuer: 'crm-connect-api',
    audience: 'crm-connect-mobile',
  });

export const createRefreshToken = (
  userId: string,
  role: UserRole,
  tokenVersion: number,
  sessionId: string,
  familyId: string,
): string =>
  jwt.sign({ userId, role, tokenVersion, type: 'refresh', sessionId, familyId }, env.JWT_REFRESH_SECRET, {
    expiresIn: `${env.REFRESH_TOKEN_DAYS}d`,
    issuer: 'crm-connect-api',
    audience: 'crm-connect-mobile',
    jwtid: sessionId,
  });

export const verifyRefreshToken = (token: string): RefreshTokenPayload =>
  jwt.verify(token, env.JWT_REFRESH_SECRET, {
    issuer: 'crm-connect-api',
    audience: 'crm-connect-mobile',
  }) as RefreshTokenPayload;

export const refreshExpiryDate = (): Date =>
  new Date(Date.now() + env.REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);
