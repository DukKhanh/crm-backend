"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const AppError_1 = require("../errors/AppError");
const verifyToken = (req, _res, next) => {
    const authorization = req.header('Authorization');
    const token = authorization?.startsWith('Bearer ')
        ? authorization.slice(7)
        : null;
    if (!token) {
        next(new AppError_1.AppError(401, 'Không có access token'));
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_ACCESS_SECRET, {
            issuer: 'crm-connect-api',
            audience: 'crm-connect-mobile',
        });
        if (decoded.type !== 'access') {
            throw new Error('Wrong token type');
        }
        req.user = decoded;
        next();
    }
    catch {
        next(new AppError_1.AppError(401, 'Access token không hợp lệ hoặc đã hết hạn'));
    }
};
exports.verifyToken = verifyToken;
const requireRole = (...roles) => (req, _res, next) => {
    if (!req.user) {
        next(new AppError_1.AppError(401, 'Chưa xác thực'));
        return;
    }
    if (!roles.includes(req.user.role)) {
        next(new AppError_1.AppError(403, 'Bạn không có quyền thực hiện thao tác này'));
        return;
    }
    next();
};
exports.requireRole = requireRole;
