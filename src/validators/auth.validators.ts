import type { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../constants/http.js';

/**
 * Validates that email and password are present in the request body.
 */
export const validateAuthPayload = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ message: 'Email and password are required' });
    return;
  }

  next();
};

/**
 * Validates that full_name, email, and password are present in the request body.
 */
export const validateRegisterPayload = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { full_name, email, password } = req.body as {
    full_name?: string;
    email?: string;
    password?: string;
  };

  if (!full_name || !email || !password) {
    res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ message: 'Full name, email and password are required' });
    return;
  }

  next();
};
