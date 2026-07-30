import type {
  ErrorRequestHandler,
  RequestHandler,
} from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../errors/AppError';
import { logger } from '../utils/logger';

export const notFoundHandler: RequestHandler = (
  req,
  _res,
  next,
): void => {
  next(
    new AppError(
      404,
      `Không tìm thấy endpoint ${req.method} ${req.originalUrl}`,
    ),
  );
};

export const errorHandler: ErrorRequestHandler = (
  error,
  req,
  res,
  _next,
): void => {
  const requestId = req.requestId;

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      requestId,
      ...(error.details
        ? {
            errors: error.details,
          }
        : {}),
    });

    return;
  }

  if (
    error instanceof
    Prisma.PrismaClientKnownRequestError
  ) {
    if (error.code === 'P2002') {
      res.status(409).json({
        success: false,
        message: 'Dữ liệu đã tồn tại',
        requestId,
      });

      return;
    }

    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy dữ liệu',
        requestId,
      });

      return;
    }
  }

  if (
    error instanceof Error &&
    error.message ===
      'Origin is not allowed by CORS'
  ) {
    res.status(403).json({
      success: false,
      message: 'Origin không được phép',
      requestId,
    });

    return;
  }

  logger.error('unhandled_request_error', {
    requestId,
    method: req.method,
    path: req.originalUrl,
    error:
      error instanceof Error
        ? error.stack
        : String(error),
  });

  res.status(500).json({
    success: false,
    message: 'Lỗi máy chủ nội bộ',
    requestId,
  });
};