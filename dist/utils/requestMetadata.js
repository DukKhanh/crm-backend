"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRequestMetadata = getRequestMetadata;
function getRequestMetadata(req) {
    return {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')?.slice(0, 500),
        deviceId: req.get('x-device-id')?.slice(0, 200),
        deviceName: req.get('x-device-name')?.slice(0, 200),
    };
}
