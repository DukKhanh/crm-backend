import type { Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../prisma/client.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants/http.js';
import { sendError } from '../utils/response.js';
import type { AuthRequest } from '../types/express.js';

/** GET /api/profile — Get the authenticated user's profile */
export const getProfile = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.userId as string;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        avatar: true,
      },
    });
    res.status(HTTP_STATUS.OK).json(user);
  } catch (error) {
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to retrieve profile', error);
  }
};

/** PUT /api/profile — Update full name and/or avatar */
export const updateProfile = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.userId as string;
    const { full_name, avatar } = req.body as {
      full_name?: string;
      avatar?: string;
    };

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { full_name, avatar },
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        avatar: true,
      },
    });

    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to update profile', error);
  }
};

/** PUT /api/profile/change-password — Change the authenticated user's password */
export const changePassword = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const userId = req.user?.userId as string;
  const { oldPassword, newPassword } = req.body as {
    oldPassword: string;
    newPassword: string;
  };

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND);
      return;
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isMatch) {
      sendError(res, HTTP_STATUS.BAD_REQUEST, 'Current password is incorrect');
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({ where: { id: userId }, data: { password_hash } });
    res.status(HTTP_STATUS.OK).json({ message: 'Password changed successfully' });
  } catch (error) {
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.SERVER_ERROR, error);
  }
};

/** PUT /api/profile/push-token — Save the Expo push token for mobile notifications */
export const savePushToken = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { token } = req.body as { token: string };
    await prisma.user.update({
      where: { id: req.user?.userId as string },
      data: { expoPushToken: token },
    });
    res.status(HTTP_STATUS.OK).json({ message: 'Push token saved' });
  } catch (error) {
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to save push token', error);
  }
};