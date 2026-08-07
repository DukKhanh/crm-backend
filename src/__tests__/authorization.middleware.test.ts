import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/AppError';

const recordSecurityEvent = jest.fn().mockResolvedValue(undefined);
jest.mock('../services/securityAudit.service', () => ({ recordSecurityEvent: (...args: unknown[]) => recordSecurityEvent(...args) }));

import { requirePermission } from '../modules/authorization/authorization.middleware';
import { Permission } from '../modules/authorization/permissions';

function request(role?: 'ADMIN' | 'MANAGER' | 'EMPLOYEE'): Request {
  return {
    method: 'PATCH',
    originalUrl: '/api/users/user-2/role',
    ip: '127.0.0.1',
    get: () => undefined,
    ...(role ? { user: { userId: 'user-1', role, status: 'ACTIVE', tokenVersion: 0 } } : {}),
  } as unknown as Request;
}

describe('requirePermission middleware', () => {
  beforeEach(() => recordSecurityEvent.mockClear());

  it('rejects an unauthenticated request', () => {
    const next = jest.fn();
    requirePermission(Permission.USER_READ_ANY)(request(), {} as Response, next);
    const error = next.mock.calls[0][0] as AppError;
    expect(error.statusCode).toBe(401);
  });

  it('allows an admin permission', () => {
    const next = jest.fn();
    requirePermission(Permission.ADMIN_OVERVIEW_READ)(request('ADMIN'), {} as Response, next);
    expect(next).toHaveBeenCalledWith();
    expect(recordSecurityEvent).not.toHaveBeenCalled();
  });

  it('audits and rejects a denied permission', () => {
    const next = jest.fn();
    requirePermission(Permission.USER_MANAGE_ROLE)(request('MANAGER'), {} as Response, next);
    const error = next.mock.calls[0][0] as AppError;
    expect(error.statusCode).toBe(403);
    expect(recordSecurityEvent).toHaveBeenCalledWith(expect.objectContaining({
      type: 'ACCESS_DENIED',
      userId: 'user-1',
      metadata: expect.objectContaining({ role: 'MANAGER' }),
    }));
  });
});
