"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.savePushToken = exports.changePassword = exports.updateProfile = exports.getProfile = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
// Lấy thông tin cá nhân
const getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { id: true, full_name: true, email: true, role: true, avatar: true }
        });
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy thông tin' });
    }
};
exports.getProfile = getProfile;
// Cập nhật thông tin (Tên và Avatar)
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { full_name, avatar } = req.body;
        const updatedUser = await prisma_1.default.user.update({
            where: { id: userId },
            data: { full_name, avatar },
            select: { id: true, full_name: true, email: true, role: true, avatar: true }
        });
        res.status(200).json({ message: 'Cập nhật thành công', user: updatedUser });
    }
    catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật profile' });
    }
};
exports.updateProfile = updateProfile;
const changePassword = async (req, res) => {
    const userId = req.user.userId;
    const { oldPassword, newPassword } = req.body;
    try {
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user)
            return;
        const isMatch = await bcrypt_1.default.compare(oldPassword, user.password_hash);
        if (!isMatch) {
            res.status(400).json({ message: 'Mật khẩu cũ không đúng' });
            return;
        }
        const salt = await bcrypt_1.default.genSalt(10);
        const password_hash = await bcrypt_1.default.hash(newPassword, salt);
        await prisma_1.default.user.update({ where: { id: userId }, data: { password_hash } });
        res.status(200).json({ message: 'Đổi mật khẩu thành công' });
    }
    catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};
exports.changePassword = changePassword;
const savePushToken = async (req, res) => {
    try {
        const { token } = req.body;
        await prisma_1.default.user.update({
            where: { id: req.user.userId },
            data: { expoPushToken: token }
        });
        res.status(200).json({ message: 'Đã lưu Push Token' });
    }
    catch (error) {
        res.status(500).json({ message: 'Lỗi lưu token' });
    }
};
exports.savePushToken = savePushToken;
