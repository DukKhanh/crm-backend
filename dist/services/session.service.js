"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSession = createSession;
exports.rotateSession = rotateSession;
exports.revokeToken = revokeToken;
exports.revokeAllUserSessions = revokeAllUserSessions;
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = __importDefault(require("../config/prisma"));
const AppError_1 = require("../errors/AppError");
const token_1 = require("../utils/token");
const securityAudit_service_1 = require("./securityAudit.service");
async function createSession(user, metadata) {
    const sessionId = crypto_1.default.randomUUID();
    const familyId = crypto_1.default.randomUUID();
    const refreshToken = (0, token_1.createRefreshToken)(user.id, user.role, sessionId, familyId);
    await prisma_1.default.refreshSession.create({
        data: {
            id: sessionId,
            familyId,
            userId: user.id,
            tokenHash: (0, token_1.hashToken)(refreshToken),
            expiresAt: (0, token_1.refreshExpiryDate)(),
            ...metadata,
        },
    });
    await (0, securityAudit_service_1.recordSecurityEvent)({ userId: user.id, type: 'LOGIN_SUCCESS', sessionId, familyId, ...metadata });
    return { token: (0, token_1.createAccessToken)(user.id, user.role), refreshToken };
}
async function revokeFamily(familyId, reason) {
    await prisma_1.default.refreshSession.updateMany({
        where: { familyId, revokedAt: null },
        data: { revokedAt: new Date(), revokeReason: reason },
    });
}
async function rotateSession(oldToken, metadata) {
    let payload;
    try {
        payload = (0, token_1.verifyRefreshToken)(oldToken);
    }
    catch {
        throw new AppError_1.AppError(403, 'Refresh token không hợp lệ hoặc đã hết hạn');
    }
    if (payload.type !== 'refresh')
        throw new AppError_1.AppError(403, 'Sai loại token');
    const session = await prisma_1.default.refreshSession.findUnique({ where: { id: payload.sessionId } });
    const tokenMatches = session ? crypto_1.default.timingSafeEqual(Buffer.from(session.tokenHash), Buffer.from((0, token_1.hashToken)(oldToken))) : false;
    if (!session || session.userId !== payload.userId || session.familyId !== payload.familyId || !tokenMatches) {
        await revokeFamily(payload.familyId, 'TOKEN_MISMATCH_OR_UNKNOWN_SESSION');
        await (0, securityAudit_service_1.recordSecurityEvent)({
            userId: payload.userId,
            type: 'REFRESH_REUSE_DETECTED',
            sessionId: payload.sessionId,
            familyId: payload.familyId,
            ...metadata,
            metadata: { reason: 'unknown_session_or_hash_mismatch' },
        });
        throw new AppError_1.AppError(403, 'Phát hiện phiên đăng nhập bất thường; vui lòng đăng nhập lại');
    }
    if (session.revokedAt) {
        await revokeFamily(session.familyId, 'REFRESH_TOKEN_REUSE');
        await (0, securityAudit_service_1.recordSecurityEvent)({
            userId: session.userId,
            type: 'REFRESH_REUSE_DETECTED',
            sessionId: session.id,
            familyId: session.familyId,
            ...metadata,
            metadata: { revokedAt: session.revokedAt.toISOString() },
        });
        throw new AppError_1.AppError(403, 'Phát hiện refresh token đã được sử dụng lại; toàn bộ phiên đã bị thu hồi');
    }
    if (session.expiresAt <= new Date())
        throw new AppError_1.AppError(403, 'Refresh token đã hết hạn');
    const user = await prisma_1.default.user.findUnique({ where: { id: session.userId } });
    if (!user)
        throw new AppError_1.AppError(403, 'Phiên đăng nhập không hợp lệ');
    const nextSessionId = crypto_1.default.randomUUID();
    const nextToken = (0, token_1.createRefreshToken)(user.id, user.role, nextSessionId, session.familyId);
    const now = new Date();
    const rotated = await prisma_1.default.$transaction(async (tx) => {
        const consumed = await tx.refreshSession.updateMany({
            where: { id: session.id, revokedAt: null },
            data: { revokedAt: now, revokeReason: 'ROTATED', replacedById: nextSessionId, lastUsedAt: now },
        });
        if (consumed.count !== 1)
            return false;
        await tx.refreshSession.create({
            data: {
                id: nextSessionId,
                familyId: session.familyId,
                parentSessionId: session.id,
                userId: user.id,
                tokenHash: (0, token_1.hashToken)(nextToken),
                expiresAt: (0, token_1.refreshExpiryDate)(),
                ...metadata,
            },
        });
        return true;
    });
    if (!rotated) {
        await revokeFamily(session.familyId, 'CONCURRENT_REFRESH_REUSE');
        await (0, securityAudit_service_1.recordSecurityEvent)({ userId: user.id, type: 'REFRESH_REUSE_DETECTED', sessionId: session.id, familyId: session.familyId, ...metadata });
        throw new AppError_1.AppError(403, 'Phát hiện refresh token được sử dụng đồng thời; vui lòng đăng nhập lại');
    }
    await (0, securityAudit_service_1.recordSecurityEvent)({ userId: user.id, type: 'TOKEN_ROTATED', sessionId: nextSessionId, familyId: session.familyId, ...metadata });
    return { token: (0, token_1.createAccessToken)(user.id, user.role), refreshToken: nextToken };
}
async function revokeToken(refreshToken, metadata) {
    try {
        const payload = (0, token_1.verifyRefreshToken)(refreshToken);
        await prisma_1.default.refreshSession.updateMany({
            where: { id: payload.sessionId, userId: payload.userId, revokedAt: null },
            data: { revokedAt: new Date(), revokeReason: 'LOGOUT' },
        });
        await (0, securityAudit_service_1.recordSecurityEvent)({ userId: payload.userId, type: 'LOGOUT', sessionId: payload.sessionId, familyId: payload.familyId, ...metadata });
    }
    catch {
        // Logout remains idempotent and does not reveal token validity.
    }
}
async function revokeAllUserSessions(userId, reason) {
    await prisma_1.default.refreshSession.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date(), revokeReason: reason } });
}
