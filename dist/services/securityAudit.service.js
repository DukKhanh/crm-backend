"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordSecurityEvent = recordSecurityEvent;
const prisma_1 = __importDefault(require("../config/prisma"));
const logger_1 = require("../utils/logger");
async function recordSecurityEvent(input) {
    try {
        await prisma_1.default.securityEvent.create({ data: input });
    }
    catch (error) {
        logger_1.logger.error('security_event_write_failed', { type: input.type, error: String(error) });
    }
}
