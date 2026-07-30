"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.revokeAllSessions = exports.revokeSession = exports.listSessions = exports.logout = exports.refreshTokenAPI = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const prisma_1 = __importDefault(require("../config/prisma"));
const AppError_1 = require("../errors/AppError");
const session_service_1 = require("../services/session.service");
const securityAudit_service_1 = require("../services/securityAudit.service");
const requestMetadata_1 = require("../utils/requestMetadata");
const register = async (req, res, next) => {
    try {
        const existing = await prisma_1.default.user.findUnique({ where: { email: req.body.email } });
        if (existing)
            throw new AppError_1.AppError(409, 'Email đã tồn tại');
        const password_hash = await bcrypt_1.default.hash(req.body.password, 12);
        const user = await prisma_1.default.user.create({
            data: { full_name: req.body.full_name, email: req.body.email, password_hash, role: 'EMPLOYEE' },
            select: { id: true, full_name: true, email: true, role: true, avatar: true },
        });
        res.status(201).json({ message: 'Đăng ký thành công', user });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    const metadata = (0, requestMetadata_1.getRequestMetadata)(req);
    try {
        const user = await prisma_1.default.user.findUnique({ where: { email: req.body.email } });
        if (!user || !(await bcrypt_1.default.compare(req.body.password, user.password_hash))) {
            await (0, securityAudit_service_1.recordSecurityEvent)({ userId: user?.id, type: 'LOGIN_FAILURE', ...metadata, metadata: { email: req.body.email } });
            throw new AppError_1.AppError(401, 'Email hoặc mật khẩu không đúng');
        }
        const tokens = await (0, session_service_1.createSession)(user, metadata);
        res.status(200).json({
            message: 'Đăng nhập thành công', ...tokens,
            user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role, avatar: user.avatar },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const refreshTokenAPI = async (req, res, next) => {
    try {
        res.status(200).json(await (0, session_service_1.rotateSession)(req.body.refreshToken, (0, requestMetadata_1.getRequestMetadata)(req)));
    }
    catch (error) {
        next(error);
    }
};
exports.refreshTokenAPI = refreshTokenAPI;
const logout = async (req, res, next) => {
    try {
        await (0, session_service_1.revokeToken)(req.body.refreshToken, (0, requestMetadata_1.getRequestMetadata)(req));
        res.status(200).json({ message: 'Đăng xuất thành công' });
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
const listSessions = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const sessions = await prisma_1.default.refreshSession.findMany({
            where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
            orderBy: { createdAt: 'desc' },
            select: { id: true, familyId: true, deviceId: true, deviceName: true, userAgent: true, ipAddress: true, lastUsedAt: true, createdAt: true, expiresAt: true },
        });
        res.json({ sessions });
    }
    catch (error) {
        next(error);
    }
};
exports.listSessions = listSessions;
const revokeSession = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const result = await prisma_1.default.refreshSession.updateMany({
            where: { id: req.params.sessionId, userId, revokedAt: null },
            data: { revokedAt: new Date(), revokeReason: 'USER_REVOKED' },
        });
        if (!result.count)
            throw new AppError_1.AppError(404, 'Không tìm thấy phiên đăng nhập');
        await (0, securityAudit_service_1.recordSecurityEvent)({ userId, type: 'SESSION_REVOKED', sessionId: req.params.sessionId, ...(0, requestMetadata_1.getRequestMetadata)(req) });
        res.json({ message: 'Đã thu hồi phiên đăng nhập' });
    }
    catch (error) {
        next(error);
    }
};
exports.revokeSession = revokeSession;
const revokeAllSessions = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        await (0, session_service_1.revokeAllUserSessions)(userId, 'USER_REVOKED_ALL');
        await (0, securityAudit_service_1.recordSecurityEvent)({ userId, type: 'SESSION_REVOKED', ...(0, requestMetadata_1.getRequestMetadata)(req), metadata: { scope: 'all' } });
        res.json({ message: 'Đã thu hồi tất cả phiên đăng nhập' });
    }
    catch (error) {
        next(error);
    }
};
exports.revokeAllSessions = revokeAllSessions;
const forgotPassword = async (req, res, next) => {
    try {
        const user = await prisma_1.default.user.findUnique({ where: { email: req.body.email } });
        if (!user) {
            res.status(200).json({ message: 'Nếu email tồn tại, mã OTP sẽ được gửi' });
            return;
        }
        if (user.otpLastSentAt && Date.now() - user.otpLastSentAt.getTime() < 60_000)
            throw new AppError_1.AppError(429, 'Vui lòng chờ 60 giây trước khi gửi lại OTP');
        const otp = crypto_1.default.randomInt(100000, 1000000).toString();
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: { resetOtpHash: await bcrypt_1.default.hash(otp, 10), otpExpiry: new Date(Date.now() + 15 * 60_000), otpAttempts: 0, otpLastSentAt: new Date() },
        });
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS)
            throw new AppError_1.AppError(503, 'Dịch vụ email chưa được cấu hình');
        const transporter = nodemailer_1.default.createTransport({ host: 'smtp.gmail.com', port: 465, secure: true, auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } });
        await transporter.sendMail({ from: `"CRM Connect" <${process.env.EMAIL_USER}>`, to: req.body.email, subject: 'Mã khôi phục mật khẩu CRM', text: `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong 15 phút.` });
        res.status(200).json({ message: 'Nếu email tồn tại, mã OTP sẽ được gửi' });
    }
    catch (error) {
        next(error);
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res, next) => {
    try {
        const user = await prisma_1.default.user.findUnique({ where: { email: req.body.email } });
        if (!user || !user.resetOtpHash || !user.otpExpiry || user.otpExpiry <= new Date() || user.otpAttempts >= 5)
            throw new AppError_1.AppError(400, 'Mã OTP không hợp lệ hoặc đã hết hạn');
        const valid = await bcrypt_1.default.compare(req.body.otp, user.resetOtpHash);
        if (!valid) {
            await prisma_1.default.user.update({ where: { id: user.id }, data: { otpAttempts: { increment: 1 } } });
            throw new AppError_1.AppError(400, 'Mã OTP không hợp lệ hoặc đã hết hạn');
        }
        const password_hash = await bcrypt_1.default.hash(req.body.newPassword, 12);
        await prisma_1.default.$transaction([
            prisma_1.default.user.update({ where: { id: user.id }, data: { password_hash, resetOtpHash: null, otpExpiry: null, otpAttempts: 0 } }),
            prisma_1.default.refreshSession.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date(), revokeReason: 'PASSWORD_RESET' } }),
        ]);
        await (0, securityAudit_service_1.recordSecurityEvent)({ userId: user.id, type: 'PASSWORD_RESET', ...(0, requestMetadata_1.getRequestMetadata)(req) });
        res.status(200).json({ message: 'Đổi mật khẩu thành công' });
    }
    catch (error) {
        next(error);
    }
};
exports.resetPassword = resetPassword;
