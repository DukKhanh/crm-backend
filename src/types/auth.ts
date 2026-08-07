import type { UserRole } from '@prisma/client';

export interface AccessTokenPayload {
  userId: string;
  role: UserRole;
  tokenVersion: number;
  type: 'access';
}
