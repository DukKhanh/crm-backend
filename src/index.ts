import http from 'http';
import app from './app';
import prisma from './config/prisma';
import { env } from './config/env';
import { logger } from './utils/logger';

const server = http.createServer(app);
let shuttingDown = false;

async function startServer(): Promise<void> {
  try {
    await prisma.$connect();
    server.listen(env.PORT, '0.0.0.0', () => logger.info('server_started', { port: env.PORT, nodeEnv: env.NODE_ENV }));
  } catch (error) {
    logger.error('server_start_failed', { error: String(error) });
    process.exit(1);
  }
}

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info('graceful_shutdown_started', { signal });
  server.close(async (closeError) => {
    if (closeError) logger.error('http_server_close_failed', { error: String(closeError) });
    await prisma.$disconnect();
    logger.info('graceful_shutdown_completed');
    process.exit(closeError ? 1 : 0);
  });
  setTimeout(() => {
    logger.error('graceful_shutdown_timeout');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => logger.error('unhandled_rejection', { reason: String(reason) }));
process.on('uncaughtException', (error) => {
  logger.error('uncaught_exception', { error: error.stack ?? error.message });
  void shutdown('uncaughtException');
});

void startServer();
