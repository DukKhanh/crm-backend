"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const env_1 = require("../config/env");
const rank = { debug: 10, info: 20, warn: 30, error: 40 };
function write(level, message, metadata = {}) {
    if (rank[level] < rank[env_1.env.LOG_LEVEL])
        return;
    const payload = JSON.stringify({ timestamp: new Date().toISOString(), level, message, ...metadata });
    if (level === 'error')
        console.error(payload);
    else if (level === 'warn')
        console.warn(payload);
    else
        console.log(payload);
}
exports.logger = {
    debug: (message, metadata) => write('debug', message, metadata),
    info: (message, metadata) => write('info', message, metadata),
    warn: (message, metadata) => write('warn', message, metadata),
    error: (message, metadata) => write('error', message, metadata),
};
