"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const prisma_1 = __importDefault(require("./config/prisma"));
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const server = http_1.default.createServer(app_1.default);
let shuttingDown = false;
async function startServer() {
    try {
        await prisma_1.default.$connect();
        server.listen(env_1.env.PORT, '0.0.0.0', () => logger_1.logger.info('server_started', { port: env_1.env.PORT, nodeEnv: env_1.env.NODE_ENV }));
    }
    catch (error) {
        logger_1.logger.error('server_start_failed', { error: String(error) });
        process.exit(1);
    }
}
async function shutdown(signal) {
    if (shuttingDown)
        return;
    shuttingDown = true;
    logger_1.logger.info('graceful_shutdown_started', { signal });
    server.close(async (closeError) => {
        if (closeError)
            logger_1.logger.error('http_server_close_failed', { error: String(closeError) });
        await prisma_1.default.$disconnect();
        logger_1.logger.info('graceful_shutdown_completed');
        process.exit(closeError ? 1 : 0);
    });
    setTimeout(() => {
        logger_1.logger.error('graceful_shutdown_timeout');
        process.exit(1);
    }, 10_000).unref();
}
process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => logger_1.logger.error('unhandled_rejection', { reason: String(reason) }));
process.on('uncaughtException', (error) => {
    logger_1.logger.error('uncaught_exception', { error: error.stack ?? error.message });
    void shutdown('uncaughtException');
});
void startServer();
