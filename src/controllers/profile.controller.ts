import type { NextFunction, Response } from 'express';
import prisma from '../config/prisma';
import type { AuthRequest } from '../middlewares/auth.middleware';
import bcrypt from 'bcrypt';
import { AppError } from '../errors/AppError';
import { permissionsForRole } from '../modules/authorization/permissions';
import { revokeAllUserSessions } from '../services/session.service';


export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, full_name: true, email: true, role: true, status: true, avatar: true }
    });
    if (!user) throw new AppError(404, 'Không tìm thấy người dùng');
    res.status(200).json({ ...user, permissions: permissionsForRole(user.role) });
  } catch (error) {
    next(error);
  }
};


export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user.userId;
    const { full_name, avatar } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { full_name, avatar },
      select: { id: true, full_name: true, email: true, role: true, status: true, avatar: true }
    });

    res.status(200).json({ message: 'Cập nhật thành công', user: updatedUser });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.user.userId;
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, 'Không tìm thấy người dùng');

    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isMatch) throw new AppError(400, 'Mật khẩu cũ không đúng');

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { password_hash, tokenVersion: { increment: 1 } },
    });
    await revokeAllUserSessions(userId, 'PASSWORD_CHANGED');
    res.status(200).json({ message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.' });
  } catch (error) { next(error); }
};

export const savePushToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.body;
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { expoPushToken: token }
    });
    res.status(200).json({ message: 'Đã lưu Push Token' });
  } catch (error) {
    next(error);
  }
};
