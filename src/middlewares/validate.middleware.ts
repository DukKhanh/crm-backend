import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { AppError } from '../errors/AppError';

export const validate = (schema: ZodType) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse({ body: req.body, params: req.params, query: req.query });
    if (!result.success) {
      next(new AppError(400, 'Dữ liệu không hợp lệ', result.error.flatten()));
      return;
    }
    const parsed = result.data as { body?: unknown; params?: unknown; query?: unknown };
    if (parsed.body) req.body = parsed.body;
    if (parsed.params) req.params = parsed.params as Request['params'];
    if (parsed.query) req.query = parsed.query as Request['query'];
    next();
  };
