import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../../errors/AppError';
import { getRequestMetadata } from '../../utils/requestMetadata';
import { recordSecurityEvent } from '../../services/securityAudit.service';
import { roleHasPermission, type Permission } from './permissions';

export const requirePermission = (...required: Permission[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, 'Chưa xác thực'));
      return;
    }

    const allowed = required.every((permission) => roleHasPermission(req.user.role, permission));
    if (!allowed) {
      void recordSecurityEvent({
        userId: req.user.userId,
        type: 'ACCESS_DENIED',
        ...getRequestMetadata(req),
        metadata: {
          method: req.method,
          path: req.originalUrl,
          required,
          role: req.user.role,
        },
      });
      next(new AppError(403, 'Bạn không có quyền thực hiện thao tác này'));
      return;
    }

    next();
  };
