import type { Request, Response } from 'express';
import { customerService } from './customer.service';

export const customerController = {
  async list(req: Request, res: Response) {
    res.status(200).json(await customerService.list(req.user));
  },

  async getById(req: Request, res: Response) {
    res.status(200).json(await customerService.getById(req.user, req.params.id));
  },

  async create(req: Request, res: Response) {
    res.status(201).json(await customerService.create(req.user, req.body));
  },

  async update(req: Request, res: Response) {
    res.status(200).json(await customerService.update(req.user, req.params.id, req.body));
  },

  async delete(req: Request, res: Response) {
    await customerService.delete(req.user, req.params.id);
    res.status(200).json({ message: 'Đã xóa khách hàng thành công' });
  },
};
