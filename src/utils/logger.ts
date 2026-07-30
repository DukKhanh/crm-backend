import { env } from '../config/env';

type Level = 'debug' | 'info' | 'warn' | 'error';
const rank: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

function write(level: Level, message: string, metadata: Record<string, unknown> = {}): void {
  if (rank[level] < rank[env.LOG_LEVEL]) return;
  const payload = JSON.stringify({ timestamp: new Date().toISOString(), level, message, ...metadata });
  if (level === 'error') console.error(payload);
  else if (level === 'warn') console.warn(payload);
  else console.log(payload);
}

export const logger = {
  debug: (message: string, metadata?: Record<string, unknown>) => write('debug', message, metadata),
  info: (message: string, metadata?: Record<string, unknown>) => write('info', message, metadata),
  warn: (message: string, metadata?: Record<string, unknown>) => write('warn', message, metadata),
  error: (message: string, metadata?: Record<string, unknown>) => write('error', message, metadata),
};
