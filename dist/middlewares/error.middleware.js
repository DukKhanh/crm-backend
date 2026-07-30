"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFoundHandler = void 0;
const client_1 = require("@prisma/client");
const AppError_1 = require("../errors/AppError");
const logger_1 = require("../utils/logger");
const notFoundHandler = (req, _res, next) => {
    next(new AppError_1.AppError(404, `Không tìm thấy endpoint ${req.method} ${req.originalUrl}`));
};
exports.notFoundHandler = notFoundHandler;
const errorHandler = (error, req, res, _next) => {
    const requestId = req.requestId;
    if (error instanceof AppError_1.AppError) {
        res.status(error.statusCode).json({
            success: false,
            message: error.message,
            requestId,
            ...(error.details
                ? {
                    errors: error.details,
                }
                : {}),
        });
        return;
    }
    if (error instanceof
        client_1.Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
            res.status(409).json({
                success: false,
                message: 'Dữ liệu đã tồn tại',
                requestId,
            });
            return;
        }
        if (error.code === 'P2025') {
            res.status(404).json({
                success: false,
                message: 'Không tìm thấy dữ liệu',
                requestId,
            });
            return;
        }
    }
    if (error instanceof Error &&
        error.message ===
            'Origin is not allowed by CORS') {
        res.status(403).json({
            success: false,
            message: 'Origin không được phép',
            requestId,
        });
        return;
    }
    logger_1.logger.error('unhandled_request_error', {
        requestId,
        method: req.method,
        path: req.originalUrl,
        error: error instanceof Error
            ? error.stack
            : String(error),
    });
    res.status(500).json({
        success: false,
        message: 'Lỗi máy chủ nội bộ',
        requestId,
    });
};
exports.errorHandler = errorHandler;
