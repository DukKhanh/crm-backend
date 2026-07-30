"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestContext = requestContext;
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = require("../utils/logger");
function requestContext(req, res, next) {
    const incoming = req.header('x-request-id');
    req.requestId = incoming && incoming.length <= 128 ? incoming : crypto_1.default.randomUUID();
    res.setHeader('x-request-id', req.requestId);
    const startedAt = process.hrtime.bigint();
    res.on('finish', () => {
        const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
        logger_1.logger.info('http_request', {
            requestId: req.requestId,
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            durationMs: Number(durationMs.toFixed(2)),
            ip: req.ip,
            userAgent: req.get('user-agent'),
        });
    });
    next();
}
