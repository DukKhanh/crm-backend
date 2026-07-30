import type { Prisma, SecurityEventType } from '@prisma/client';
import prisma from '../config/prisma';
import { logger } from '../utils/logger';

export async function recordSecurityEvent(input: {
  userId?: string;
  type: SecurityEventType;
  sessionId?: string;
  familyId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Prisma.InputJsonValue;
}): Promise<void> {
  try {
    await prisma.securityEvent.create({ data: input });
  } catch (error) {
    logger.error('security_event_write_failed', { type: input.type, error: String(error) });
  }
}
