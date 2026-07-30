"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshExpiryDate = exports.verifyRefreshToken = exports.createRefreshToken = exports.createAccessToken = exports.hashToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const hashToken = (token) => crypto_1.default.createHash('sha256').update(token).digest('hex');
exports.hashToken = hashToken;
const createAccessToken = (userId, role) => jsonwebtoken_1.default.sign({ userId, role, type: 'access' }, env_1.env.JWT_ACCESS_SECRET, {
    expiresIn: `${env_1.env.ACCESS_TOKEN_MINUTES}m`,
    issuer: 'crm-connect-api',
    audience: 'crm-connect-mobile',
});
exports.createAccessToken = createAccessToken;
const createRefreshToken = (userId, role, sessionId, familyId) => jsonwebtoken_1.default.sign({ userId, role, type: 'refresh', sessionId, familyId }, env_1.env.JWT_REFRESH_SECRET, {
    expiresIn: `${env_1.env.REFRESH_TOKEN_DAYS}d`,
    issuer: 'crm-connect-api',
    audience: 'crm-connect-mobile',
    jwtid: sessionId,
});
exports.createRefreshToken = createRefreshToken;
const verifyRefreshToken = (token) => jsonwebtoken_1.default.verify(token, env_1.env.JWT_REFRESH_SECRET, {
    issuer: 'crm-connect-api',
    audience: 'crm-connect-mobile',
});
exports.verifyRefreshToken = verifyRefreshToken;
const refreshExpiryDate = () => new Date(Date.now() + env_1.env.REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);
exports.refreshExpiryDate = refreshExpiryDate;
