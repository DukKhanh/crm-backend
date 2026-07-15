import type { Request, Response, NextFunction } from 'express';

/**
 * Global Express error-handling middleware.
 * Must be registered last in app.ts (4-argument signature is required by Express).
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error('[Unhandled Error]', err);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' ? { error: err.message } : {}),
  });
};
