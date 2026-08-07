import type { UserRole, UserStatus } from '@prisma/client';

export interface AuthenticatedActor {
  userId: string;
  role: UserRole;
  status: UserStatus;
  tokenVersion: number;
}
