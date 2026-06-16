import type { Response } from 'express';
import prisma from '../config/prisma.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';

export const createNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { customer_id, content } = req.body;
    
    if (!content) {
      res.status(400).json({ message: 'Nội dung không được để trống' });
      return;
    }

    const newNote = await prisma.note.create({
      data: { customer_id, content }
    });

    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo ghi chú', error });
  }
};