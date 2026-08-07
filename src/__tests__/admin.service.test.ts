const prismaMock = {
  user: { count: jest.fn(), groupBy: jest.fn() },
  customer: { count: jest.fn() },
  task: { count: jest.fn(), groupBy: jest.fn() },
  refreshSession: { count: jest.fn() },
  securityEvent: { count: jest.fn(), findMany: jest.fn() },
  $transaction: jest.fn(),
};

jest.mock('../config/prisma', () => ({ __esModule: true, default: prismaMock }));

import { adminService } from '../modules/admin/admin.service';

describe('admin overview service', () => {
  it('combines operational counts and recent security events', async () => {
    prismaMock.$transaction.mockResolvedValueOnce([
      8,
      [{ role: 'ADMIN', _count: { id: 1 } }, { role: 'EMPLOYEE', _count: { id: 7 } }],
      [{ status: 'ACTIVE', _count: { id: 6 } }, { status: 'SUSPENDED', _count: { id: 2 } }],
      42,
      17,
      [{ status: 'PENDING', _count: { id: 5 } }, { status: 'COMPLETED', _count: { id: 12 } }],
      4,
      3,
      [{ id: 'event-1', type: 'ACCESS_DENIED', createdAt: new Date() }],
    ]);

    const result = await adminService.getOverview();

    expect(result.users).toEqual(expect.objectContaining({ total: 8, byRole: { ADMIN: 1, EMPLOYEE: 7 } }));
    expect(result.customers.total).toBe(42);
    expect(result.tasks.byStatus).toEqual({ PENDING: 5, COMPLETED: 12 });
    expect(result.security.alerts24h).toBe(3);
    expect(result.security.recentEvents).toHaveLength(1);
  });
});
