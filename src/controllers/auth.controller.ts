import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import nodemailer from 'nodemailer';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { full_name, email, password, role } = req.body;

    // Kiểm tra email tồn tại
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'Email đã tồn tại' });
      return;
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Tạo user mới
    const newUser = await prisma.user.create({
      data: {
        full_name,
        email,
        password_hash,
        role: role || 'Employee',
      },
    });

    res.status(201).json({ message: 'Đăng ký thành công', userId: newUser.id });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Tìm user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ message: 'Không tìm thấy người dùng' });
      return;
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(400).json({ message: 'Mật khẩu không đúng' });
      return;
    }

    // Tạo JWT Token
    const payload = { userId: user.id, role: user.role };
    // 1. TẠO 2 LOẠI TOKEN
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '15m' }); // 15 phút
    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '7d' }); // 7 ngày

    res.status(200).json({
      message: 'Đăng nhập thành công',
      token,
      refreshToken,
      user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role, avatar: user.avatar }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
};

export const refreshTokenAPI = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(401).json({ message: 'Thiếu Refresh Token' });
      return;
    }

    // Kiểm tra xem Refresh Token có còn hạn không
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET as string) as any;

    // Nếu còn hạn, tạo Access Token mới (15 phút)
    const payload = { userId: decoded.userId, role: decoded.role };
    const newToken = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '15m' });

    res.status(200).json({ token: newToken });
  } catch (error) {
    res.status(403).json({ message: 'Refresh token đã hết hạn, vui lòng đăng nhập lại' });
  }
};

// 1. API Gửi OTP
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) { res.status(404).json({ message: 'Email không tồn tại' }); return; }

    // Tạo OTP 6 số ngẫu nhiên & thời hạn 15 phút
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { resetOtp: otp, otpExpiry }
    });

    // Cấu hình Email gửi đi (BẠN CẦN THAY THÔNG TIN CỦA BẠN VÀO ĐÂY)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'email-cua-ban@gmail.com', // Thay bằng Gmail của bạn
        pass: 'mat-khau-ung-dung-gmail'  // Lấy "App Password" trong cài đặt bảo mật Google
      }
    });

    await transporter.sendMail({
      from: '"CRM Connect" <email-cua-ban@gmail.com>',
      to: email,
      subject: 'Mã khôi phục mật khẩu CRM',
      text: `Mã OTP của bạn là: ${otp}. Mã này có hiệu lực trong 15 phút.`
    });

    res.status(200).json({ message: 'Đã gửi mã OTP vào email của bạn' });
  } catch (error) { res.status(500).json({ message: 'Lỗi khi gửi email' }); }
};

// 2. API Đặt lại mật khẩu bằng OTP
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.resetOtp !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
      res.status(400).json({ message: 'Mã OTP không hợp lệ hoặc đã hết hạn' }); return;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    // Cập nhật pass mới và xóa OTP đi
    await prisma.user.update({
      where: { email },
      data: { password_hash, resetOtp: null, otpExpiry: null }
    });

    res.status(200).json({ message: 'Đổi mật khẩu thành công!' });
  } catch (error) { res.status(500).json({ message: 'Lỗi server' }); }
};

