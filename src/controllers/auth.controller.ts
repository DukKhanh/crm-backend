import type { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import prisma from '../config/prisma';
import { AppError } from '../errors/AppError';
import type { AuthRequest } from '../middlewares/auth.middleware';
import { createSession, revokeAllUserSessions, revokeToken, rotateSession } from '../services/session.service';
import { recordSecurityEvent } from '../services/securityAudit.service';
import { getRequestMetadata } from '../utils/requestMetadata';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const existing = await prisma.user.findUnique({ where: { email: req.body.email } });
    if (existing) throw new AppError(409, 'Email đã tồn tại');
    const password_hash = await bcrypt.hash(req.body.password, 12);
    const user = await prisma.user.create({
      data: { full_name: req.body.full_name, email: req.body.email, password_hash, role: 'EMPLOYEE' },
      select: { id: true, full_name: true, email: true, role: true, avatar: true },
    });
    res.status(201).json({ message: 'Đăng ký thành công', user });
  } catch (error) { next(error); }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const metadata = getRequestMetadata(req);
  try {
    const user = await prisma.user.findUnique({ where: { email: req.body.email } });
    if (!user || !(await bcrypt.compare(req.body.password, user.password_hash))) {
      await recordSecurityEvent({ userId: user?.id, type: 'LOGIN_FAILURE', ...metadata, metadata: { email: req.body.email } });
      throw new AppError(401, 'Email hoặc mật khẩu không đúng');
    }
    const tokens = await createSession(user, metadata);
    res.status(200).json({
      message: 'Đăng nhập thành công', ...tokens,
      user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (error) { next(error); }
};

export const refreshTokenAPI = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.status(200).json(await rotateSession(req.body.refreshToken, getRequestMetadata(req)));
  } catch (error) { next(error); }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await revokeToken(req.body.refreshToken, getRequestMetadata(req));
    res.status(200).json({ message: 'Đăng xuất thành công' });
  } catch (error) { next(error); }
};

export const listSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as AuthRequest).user.userId;
    const sessions = await prisma.refreshSession.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
      select: { id: true, familyId: true, deviceId: true, deviceName: true, userAgent: true, ipAddress: true, lastUsedAt: true, createdAt: true, expiresAt: true },
    });
    res.json({ sessions });
  } catch (error) { next(error); }
};

export const revokeSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as AuthRequest).user.userId;
    const result = await prisma.refreshSession.updateMany({
      where: { id: req.params.sessionId, userId, revokedAt: null },
      data: { revokedAt: new Date(), revokeReason: 'USER_REVOKED' },
    });
    if (!result.count) throw new AppError(404, 'Không tìm thấy phiên đăng nhập');
    await recordSecurityEvent({ userId, type: 'SESSION_REVOKED', sessionId: req.params.sessionId, ...getRequestMetadata(req) });
    res.json({ message: 'Đã thu hồi phiên đăng nhập' });
  } catch (error) { next(error); }
};

export const revokeAllSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as AuthRequest).user.userId;
    await revokeAllUserSessions(userId, 'USER_REVOKED_ALL');
    await recordSecurityEvent({ userId, type: 'SESSION_REVOKED', ...getRequestMetadata(req), metadata: { scope: 'all' } });
    res.json({ message: 'Đã thu hồi tất cả phiên đăng nhập' });
  } catch (error) { next(error); }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.body.email } });
    if (!user) { res.status(200).json({ message: 'Nếu email tồn tại, mã OTP sẽ được gửi' }); return; }
    if (user.otpLastSentAt && Date.now() - user.otpLastSentAt.getTime() < 60_000) throw new AppError(429, 'Vui lòng chờ 60 giây trước khi gửi lại OTP');
    const otp = crypto.randomInt(100000, 1000000).toString();
    await prisma.user.update({
      where: { id: user.id },
      data: { resetOtpHash: await bcrypt.hash(otp, 10), otpExpiry: new Date(Date.now() + 15 * 60_000), otpAttempts: 0, otpLastSentAt: new Date() },
    });
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) throw new AppError(503, 'Dịch vụ email chưa được cấu hình');
    const transporter = nodemailer.createTransport({ host: 'smtp.gmail.com', port: 465, secure: true, auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } });
    await transporter.sendMail({ from: `"CRM Connect" <${process.env.EMAIL_USER}>`, to: req.body.email, subject: 'Mã khôi phục mật khẩu CRM', text: `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong 15 phút.` });
    res.status(200).json({ message: 'Nếu email tồn tại, mã OTP sẽ được gửi' });
  } catch (error) { next(error); }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.body.email } });
    if (!user || !user.resetOtpHash || !user.otpExpiry || user.otpExpiry <= new Date() || user.otpAttempts >= 5) throw new AppError(400, 'Mã OTP không hợp lệ hoặc đã hết hạn');
    const valid = await bcrypt.compare(req.body.otp, user.resetOtpHash);
    if (!valid) {
      await prisma.user.update({ where: { id: user.id }, data: { otpAttempts: { increment: 1 } } });
      throw new AppError(400, 'Mã OTP không hợp lệ hoặc đã hết hạn');
    }
    const password_hash = await bcrypt.hash(req.body.newPassword, 12);
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { password_hash, resetOtpHash: null, otpExpiry: null, otpAttempts: 0 } }),
      prisma.refreshSession.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date(), revokeReason: 'PASSWORD_RESET' } }),
    ]);
    await recordSecurityEvent({ userId: user.id, type: 'PASSWORD_RESET', ...getRequestMetadata(req) });
    res.status(200).json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) { next(error); }
};
