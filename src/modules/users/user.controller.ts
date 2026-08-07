import type { Request, Response } from 'express';
import type { UserRole, UserStatus } from '@prisma/client';
import { getRequestMetadata } from '../../utils/requestMetadata';
import { userService } from './user.service';

export const userController = {
  async list(req: Request, res: Response) {
    res.status(200).json(await userService.list(req.query as unknown as {
      page: number;
      limit: number;
      search?: string;
      role?: UserRole;
      status?: UserStatus;
    }));
  },
  async updateRole(req: Request, res: Response) {
    res.status(200).json(await userService.updateRole(
      req.user,
      req.params.id,
      req.body.role,
      getRequestMetadata(req),
    ));
  },
  async updateStatus(req: Request, res: Response) {
    res.status(200).json(await userService.updateStatus(
      req.user,
      req.params.id,
      req.body.status,
      getRequestMetadata(req),
    ));
  },
};
