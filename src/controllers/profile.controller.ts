import type { Response } from 'express';
import prisma from '../config/prisma.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';

// Lấy thông tin cá nhân
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, full_name: true, email: true, role: true, avatar: true }
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin' });
  }
};

// Cập nhật thông tin (Tên và Avatar)
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.userId;
    const { full_name, avatar } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { full_name, avatar },
      select: { id: true, full_name: true, email: true, role: true, avatar: true }
    });

    res.status(200).json({ message: 'Cập nhật thành công', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật profile' });
  }
};