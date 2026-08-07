import type { Request, Response } from 'express';
import { noteService } from './note.service';

export const noteController = {
  async create(req: Request, res: Response) {
    res.status(201).json(await noteService.create(req.user, req.body));
  },
};
