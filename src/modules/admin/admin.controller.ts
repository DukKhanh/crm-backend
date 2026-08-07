import type { Request, Response } from 'express';
import { adminService } from './admin.service';

export const adminController = {
  async overview(_req: Request, res: Response) {
    res.status(200).json(await adminService.getOverview());
  },
};
