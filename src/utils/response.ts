import type { Response } from 'express';

/**
 * Send a standardized error response.
 */
export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  details?: unknown,
): void => {
  res.status(statusCode).json({
    success: false,
    message,
    ...(details !== undefined && process.env.NODE_ENV !== 'production'
      ? { error: details }
      : {}),
  });
};

/**
 * Send a standardized success response.
 */
export const sendSuccess = (
  res: Response,
  statusCode: number,
  payload: unknown,
): void => {
  res.status(statusCode).json(payload);
};
