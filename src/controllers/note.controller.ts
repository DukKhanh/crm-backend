import type { NextFunction, Response } from 'express';
import prisma from '../config/prisma';
import type { AuthRequest } from '../middlewares/auth.middleware';
import { AppError } from '../errors/AppError';

export const createNote = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const customer = await prisma.customer.findFirst({
      where: { id: req.body.customer_id, ...(req.user.role === 'ADMIN' ? {} : { ownerId: req.user.userId }) },
      select: { id: true },
    });
    if (!customer) throw new AppError(404, 'Không tìm thấy khách hàng');
    const note = await prisma.note.create({
      data: { customer_id: req.body.customer_id, content: req.body.content, authorId: req.user.userId },
      include: { author: { select: { id: true, full_name: true } } },
    });
    res.status(201).json(note);
  } catch (error) { next(error); }
};
