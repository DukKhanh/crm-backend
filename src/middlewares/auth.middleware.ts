import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import prisma from '../config/prisma';
import { AppError } from '../errors/AppError';
import type { AccessTokenPayload } from '../types/auth';

export type { AccessTokenPayload } from '../types/auth';
export type AuthRequest = Request;

export const verifyToken = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const authorization = req.header('Authorization');

  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice(7)
    : null;

  if (!token) {
    next(new AppError(401, 'Không có access token'));
    return;
  }

  let decoded: AccessTokenPayload;
  try {
    decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      issuer: 'crm-connect-api',
      audience: 'crm-connect-mobile',
    }) as AccessTokenPayload;

    if (decoded.type !== 'access') {
      throw new Error('Wrong token type');
    }

  } catch {
    next(new AppError(401, 'Access token không hợp lệ hoặc đã hết hạn'));
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, status: true, tokenVersion: true },
    });

    if (!user || user.tokenVersion !== decoded.tokenVersion) {
      next(new AppError(401, 'Phiên đăng nhập đã bị thu hồi'));
      return;
    }
    if (user.status !== 'ACTIVE') {
      next(new AppError(403, 'Tài khoản đã bị tạm khóa hoặc vô hiệu hóa'));
      return;
    }

    req.user = {
      userId: user.id,
      role: user.role,
      status: user.status,
      tokenVersion: user.tokenVersion,
    };

    next();
  } catch (error) {
    next(error);
  }
};
