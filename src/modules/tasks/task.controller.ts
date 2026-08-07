import type { Request, Response } from 'express';
import { taskService } from './task.service';

export const taskController = {
  async list(req: Request, res: Response) {
    res.status(200).json(await taskService.list(req.user));
  },
  async create(req: Request, res: Response) {
    res.status(201).json(await taskService.create(req.user, req.body));
  },
  async updateStatus(req: Request, res: Response) {
    res.status(200).json(await taskService.updateStatus(req.user, req.params.id, req.body.status));
  },
  async update(req: Request, res: Response) {
    res.status(200).json(await taskService.update(req.user, req.params.id, req.body));
  },
  async delete(req: Request, res: Response) {
    await taskService.delete(req.user, req.params.id);
    res.status(200).json({ message: 'Đã xóa công việc' });
  },
};
