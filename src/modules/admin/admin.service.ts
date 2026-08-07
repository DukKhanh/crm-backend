import { SecurityEventType } from '@prisma/client';
import prisma from '../../config/prisma';

const monitoredSecurityEvents: SecurityEventType[] = [
  'LOGIN_FAILURE',
  'ACCESS_DENIED',
  'REFRESH_REUSE_DETECTED',
];

function groupCounts<T extends string>(
  rows: Array<{ count: number } & Record<string, unknown>>,
  key: string,
): Record<T, number> {
  return Object.fromEntries(rows.map((row) => [String(row[key]), row.count])) as Record<T, number>;
}

function prismaGroupCount(value: unknown): number {
  if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'number') return value.id;
  return 0;
}

export const adminService = {
  async getOverview() {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [
      totalUsers,
      usersByRole,
      usersByStatus,
      totalCustomers,
      totalTasks,
      tasksByStatus,
      activeSessions,
      securityAlerts24h,
      recentSecurityEvents,
    ] = await prisma.$transaction([
      prisma.user.count(),
      prisma.user.groupBy({ by: ['role'], _count: { id: true }, orderBy: { role: 'asc' } }),
      prisma.user.groupBy({ by: ['status'], _count: { id: true }, orderBy: { status: 'asc' } }),
      prisma.customer.count(),
      prisma.task.count(),
      prisma.task.groupBy({ by: ['status'], _count: { id: true }, orderBy: { status: 'asc' } }),
      prisma.refreshSession.count({ where: { revokedAt: null, expiresAt: { gt: new Date() } } }),
      prisma.securityEvent.count({ where: { createdAt: { gte: since }, type: { in: monitoredSecurityEvents } } }),
      prisma.securityEvent.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: { user: { select: { id: true, full_name: true, email: true } } },
      }),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      users: {
        total: totalUsers,
        byRole: groupCounts(usersByRole.map((row) => ({ role: row.role, count: prismaGroupCount(row._count) })), 'role'),
        byStatus: groupCounts(usersByStatus.map((row) => ({ status: row.status, count: prismaGroupCount(row._count) })), 'status'),
      },
      customers: { total: totalCustomers },
      tasks: {
        total: totalTasks,
        byStatus: groupCounts(tasksByStatus.map((row) => ({ status: row.status, count: prismaGroupCount(row._count) })), 'status'),
      },
      sessions: { active: activeSessions },
      security: { alerts24h: securityAlerts24h, recentEvents: recentSecurityEvents },
    };
  },
};
