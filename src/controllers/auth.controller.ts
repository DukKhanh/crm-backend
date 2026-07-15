import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import prisma from '../prisma/client.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants/http.js';
import { sendError } from '../utils/response.js';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { full_name, email, password, role } = req.body as {
      full_name: string;
      email: string;
      password: string;
      role?: string;
    };

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      sendError(res, HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.EMAIL_EXISTS);
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        full_name,
        email,
        password_hash,
        role: role ?? 'Employee',
      },
    });

    res
      .status(HTTP_STATUS.CREATED)
      .json({ message: 'Registration successful', userId: newUser.id });
  } catch (error) {
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.SERVER_ERROR, error);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      sendError(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND);
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      sendError(res, HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.INVALID_PASSWORD);
      return;
    }

    const payload = { userId: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: (process.env.JWT_EXPIRES_IN ?? '15m') as jwt.SignOptions['expiresIn'],
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as jwt.SignOptions['expiresIn'],
    });

    res.status(HTTP_STATUS.OK).json({
      message: 'Login successful',
      token,
      refreshToken,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.SERVER_ERROR, error);
  }
};

export const refreshTokenAPI = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (!refreshToken) {
      sendError(res, HTTP_STATUS.UNAUTHORIZED, 'Refresh token is required');
      return;
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_SECRET as string,
    ) as { userId?: string; role?: string };

    const payload = { userId: decoded.userId, role: decoded.role };
    const newToken = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: (process.env.JWT_EXPIRES_IN ?? '15m') as jwt.SignOptions['expiresIn'],
    });

    res.status(HTTP_STATUS.OK).json({ token: newToken });
  } catch {
    sendError(res, HTTP_STATUS.FORBIDDEN, ERROR_MESSAGES.INVALID_REFRESH_TOKEN);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { email } = req.body as { email: string };
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      sendError(res, HTTP_STATUS.NOT_FOUND, 'Email not found');
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { resetOtp: otp, otpExpiry },
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.MAIL_FROM ?? `"CRM Connect" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Your CRM Connect Password Reset Code',
      text: `Your OTP code is: ${otp}. This code is valid for 15 minutes.`,
    });

    res.status(HTTP_STATUS.OK).json({ message: 'OTP code sent to your email' });
  } catch {
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to send email');
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { email, otp, newPassword } = req.body as {
    email: string;
    otp: string;
    newPassword: string;
  };
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (
      !user ||
      user.resetOtp !== otp ||
      !user.otpExpiry ||
      user.otpExpiry < new Date()
    ) {
      sendError(res, HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGES.OTP_INVALID);
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { email },
      data: { password_hash, resetOtp: null, otpExpiry: null },
    });

    res.status(HTTP_STATUS.OK).json({ message: 'Password reset successful' });
  } catch {
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.SERVER_ERROR);
  }
};
