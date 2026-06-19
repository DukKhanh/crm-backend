import type { Response } from 'express';
import prisma from '../config/prisma.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import bcrypt from 'bcrypt';

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

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user.userId;
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isMatch) { res.status(400).json({ message: 'Mật khẩu cũ không đúng' }); return; }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({ where: { id: userId }, data: { password_hash } });
    res.status(200).json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) { res.status(500).json({ message: 'Lỗi server' }); }
};