import { AppError } from '../errors/AppError';

const transaction = jest.fn();
jest.mock('../config/prisma', () => ({ __esModule: true, default: { $transaction: (...args: unknown[]) => transaction(...args) } }));
jest.mock('../services/securityAudit.service', () => ({ recordSecurityEvent: jest.fn() }));

import { userService } from '../modules/users/user.service';

const actor = { userId: 'admin-1', role: 'ADMIN' as const, status: 'ACTIVE' as const, tokenVersion: 0 };
const metadata = { ipAddress: '127.0.0.1' };

describe('user administration business rules', () => {
  beforeEach(() => transaction.mockReset());

  it('prevents an admin from locking their own active session', async () => {
    await expect(userService.updateStatus(actor, actor.userId, 'SUSPENDED', metadata))
      .rejects.toEqual(expect.objectContaining({ statusCode: 409 }));
    expect(transaction).not.toHaveBeenCalled();
  });

  it('preserves at least one active admin', async () => {
    const tx = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ role: 'ADMIN', status: 'ACTIVE' }),
        count: jest.fn().mockResolvedValue(1),
      },
    };
    transaction.mockImplementationOnce((callback: (client: typeof tx) => unknown) => callback(tx));

    await expect(userService.updateRole(actor, 'admin-2', 'MANAGER', metadata))
      .rejects.toEqual(expect.objectContaining({ statusCode: 409 }));
    expect(tx.user.count).toHaveBeenCalledWith({ where: { role: 'ADMIN', status: 'ACTIVE' } });
  });
});
