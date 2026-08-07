import type { AuthenticatedActor } from '../modules/authorization/actor';
import {
  customerReadScope,
  taskStatusScope,
  taskUpdateScope,
} from '../modules/authorization/policies';
import {
  Permission,
  permissionsForRole,
  roleHasPermission,
} from '../modules/authorization/permissions';

const actor = (role: AuthenticatedActor['role'], userId = 'user-1'): AuthenticatedActor => ({
  userId,
  role,
  status: 'ACTIVE',
  tokenVersion: 0,
});

describe('RBAC permission matrix', () => {
  it('limits employees to owned/related records', () => {
    expect(roleHasPermission('EMPLOYEE', Permission.CUSTOMER_READ_OWN)).toBe(true);
    expect(roleHasPermission('EMPLOYEE', Permission.CUSTOMER_READ_ANY)).toBe(false);
    expect(roleHasPermission('EMPLOYEE', Permission.TASK_ASSIGN_ANY)).toBe(false);
  });

  it('lets managers operate CRM data but not administer roles', () => {
    expect(roleHasPermission('MANAGER', Permission.CUSTOMER_READ_ANY)).toBe(true);
    expect(roleHasPermission('MANAGER', Permission.TASK_ASSIGN_ANY)).toBe(true);
    expect(roleHasPermission('MANAGER', Permission.USER_MANAGE_ROLE)).toBe(false);
  });

  it('reserves identity administration and audit access for admins', () => {
    expect(roleHasPermission('ADMIN', Permission.USER_MANAGE_ROLE)).toBe(true);
    expect(roleHasPermission('ADMIN', Permission.USER_MANAGE_STATUS)).toBe(true);
    expect(roleHasPermission('ADMIN', Permission.SECURITY_EVENT_READ)).toBe(true);
    expect(roleHasPermission('ADMIN', Permission.ADMIN_OVERVIEW_READ)).toBe(true);
    expect(roleHasPermission('MANAGER', Permission.ADMIN_OVERVIEW_READ)).toBe(false);
  });

  it('returns a copy so callers cannot mutate the central policy', () => {
    const permissions = permissionsForRole('EMPLOYEE');
    permissions.length = 0;
    expect(roleHasPermission('EMPLOYEE', Permission.CUSTOMER_READ_OWN)).toBe(true);
  });
});

describe('resource authorization scopes', () => {
  it('applies ownership to employee customer queries', () => {
    expect(customerReadScope(actor('EMPLOYEE'), 'customer-1')).toEqual({
      id: 'customer-1',
      ownerId: 'user-1',
    });
  });

  it('does not narrow manager customer queries to a single owner', () => {
    expect(customerReadScope(actor('MANAGER'), 'customer-1')).toEqual({ id: 'customer-1' });
  });

  it('lets an employee edit only tasks they created', () => {
    expect(taskUpdateScope(actor('EMPLOYEE'), 'task-1')).toEqual({
      id: 'task-1',
      createdById: 'user-1',
    });
  });

  it('lets an employee update status only when assigned', () => {
    expect(taskStatusScope(actor('EMPLOYEE'), 'task-1')).toEqual({
      id: 'task-1',
      assigneeId: 'user-1',
    });
  });
});
