import type { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants/http.js';
import type { AuthRequest, JwtPayload } from '../types/express.js';

/**
 * Middleware to protect routes by verifying the JWT access token.
 * Expects: Authorization: Bearer <token>
 */
export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    res
      .status(HTTP_STATUS.UNAUTHORIZED)
      .json({ message: ERROR_MESSAGES.AUTH_REQUIRED });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res
      .status(HTTP_STATUS.UNAUTHORIZED)
      .json({ message: ERROR_MESSAGES.INVALID_TOKEN });
  }
};