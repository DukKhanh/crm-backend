import { z } from 'zod';

const email = z.string().trim().email('Email không hợp lệ').transform((v) => v.toLowerCase());
const password = z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự').max(72);

export const registerSchema = z.object({ body: z.object({ full_name: z.string().trim().min(2).max(100), email, password }).strict() });
export const loginSchema = z.object({ body: z.object({ email, password: z.string().min(1) }).strict() });
export const refreshSchema = z.object({ body: z.object({ refreshToken: z.string().min(1) }).strict() });
export const forgotPasswordSchema = z.object({ body: z.object({ email }).strict() });
export const resetPasswordSchema = z.object({ body: z.object({ email, otp: z.string().regex(/^\d{6}$/), newPassword: password }).strict() });
