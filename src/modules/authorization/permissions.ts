import type { UserRole } from '@prisma/client';

export const Permission = {
  CUSTOMER_READ_ANY: 'customer:read:any',
  CUSTOMER_READ_OWN: 'customer:read:own',
  CUSTOMER_CREATE: 'customer:create',
  CUSTOMER_UPDATE_ANY: 'customer:update:any',
  CUSTOMER_UPDATE_OWN: 'customer:update:own',
  CUSTOMER_DELETE_ANY: 'customer:delete:any',
  CUSTOMER_DELETE_OWN: 'customer:delete:own',
  TASK_READ_ANY: 'task:read:any',
  TASK_READ_RELATED: 'task:read:related',
  TASK_CREATE: 'task:create',
  TASK_ASSIGN_ANY: 'task:assign:any',
  TASK_UPDATE_ANY: 'task:update:any',
  TASK_UPDATE_CREATED: 'task:update:created',
  TASK_STATUS_ANY: 'task:status:any',
  TASK_STATUS_ASSIGNED: 'task:status:assigned',
  TASK_DELETE_ANY: 'task:delete:any',
  TASK_DELETE_CREATED: 'task:delete:created',
  NOTE_CREATE_ANY: 'note:create:any',
  NOTE_CREATE_OWN: 'note:create:own',
  USER_READ_ANY: 'user:read:any',
  USER_MANAGE_ROLE: 'user:manage:role',
  USER_MANAGE_STATUS: 'user:manage:status',
  SECURITY_EVENT_READ: 'security-event:read',
  ADMIN_OVERVIEW_READ: 'admin:overview:read',
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

const employeePermissions: readonly Permission[] = [
  Permission.CUSTOMER_READ_OWN,
  Permission.CUSTOMER_CREATE,
  Permission.CUSTOMER_UPDATE_OWN,
  Permission.CUSTOMER_DELETE_OWN,
  Permission.TASK_READ_RELATED,
  Permission.TASK_CREATE,
  Permission.TASK_UPDATE_CREATED,
  Permission.TASK_STATUS_ASSIGNED,
  Permission.TASK_DELETE_CREATED,
  Permission.NOTE_CREATE_OWN,
];

const managerPermissions: readonly Permission[] = [
  ...employeePermissions,
  Permission.CUSTOMER_READ_ANY,
  Permission.CUSTOMER_CREATE,
  Permission.CUSTOMER_UPDATE_ANY,
  Permission.CUSTOMER_DELETE_ANY,
  Permission.TASK_READ_ANY,
  Permission.TASK_CREATE,
  Permission.TASK_ASSIGN_ANY,
  Permission.TASK_UPDATE_ANY,
  Permission.TASK_STATUS_ANY,
  Permission.TASK_DELETE_ANY,
  Permission.NOTE_CREATE_ANY,
  Permission.USER_READ_ANY,
];

const adminPermissions: readonly Permission[] = [
  ...managerPermissions,
  Permission.USER_MANAGE_ROLE,
  Permission.USER_MANAGE_STATUS,
  Permission.SECURITY_EVENT_READ,
  Permission.ADMIN_OVERVIEW_READ,
];

export const ROLE_PERMISSIONS: Readonly<Record<UserRole, readonly Permission[]>> = {
  EMPLOYEE: employeePermissions,
  MANAGER: managerPermissions,
  ADMIN: adminPermissions,
};

export function permissionsForRole(role: UserRole): Permission[] {
  return [...ROLE_PERMISSIONS[role]];
}

export function roleHasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}
