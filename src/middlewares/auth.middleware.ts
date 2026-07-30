import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { UserRole } from '@prisma/client';
import { env } from '../config/env';
import { AppError } from '../errors/AppError';
import type { AccessTokenPayload } from '../types/auth';

export type { AccessTokenPayload } from '../types/auth';
export type AuthRequest = Request;

export const verifyToken = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const authorization = req.header('Authorization');

  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice(7)
    : null;

  if (!token) {
    next(new AppError(401, 'Không có access token'));
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      issuer: 'crm-connect-api',
      audience: 'crm-connect-mobile',
    }) as AccessTokenPayload;

    if (decoded.type !== 'access') {
      throw new Error('Wrong token type');
    }

    req.user = decoded;

    next();
  } catch {
    next(
      new AppError(
        401,
        'Access token không hợp lệ hoặc đã hết hạn',
      ),
    );
  }
};

export const requireRole =
  (...roles: UserRole[]) =>
  (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): void => {
    if (!req.user) {
      next(new AppError(401, 'Chưa xác thực'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(
        new AppError(
          403,
          'Bạn không có quyền thực hiện thao tác này',
        ),
      );
      return;
    }

    next();
  };