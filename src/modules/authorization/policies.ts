import type { Prisma } from '@prisma/client';
import type { AuthenticatedActor } from './actor';
import { Permission, roleHasPermission } from './permissions';

export const customerReadScope = (
  actor: AuthenticatedActor,
  id?: string,
): Prisma.CustomerWhereInput => ({
  ...(id ? { id } : {}),
  ...(roleHasPermission(actor.role, Permission.CUSTOMER_READ_ANY)
    ? {}
    : { ownerId: actor.userId }),
});

export const customerUpdateScope = (
  actor: AuthenticatedActor,
  id: string,
): Prisma.CustomerWhereInput => ({
  id,
  ...(roleHasPermission(actor.role, Permission.CUSTOMER_UPDATE_ANY)
    ? {}
    : { ownerId: actor.userId }),
});

export const customerDeleteScope = (
  actor: AuthenticatedActor,
  id: string,
): Prisma.CustomerWhereInput => ({
  id,
  ...(roleHasPermission(actor.role, Permission.CUSTOMER_DELETE_ANY)
    ? {}
    : { ownerId: actor.userId }),
});

export const taskReadScope = (
  actor: AuthenticatedActor,
  id?: string,
): Prisma.TaskWhereInput => ({
  ...(id ? { id } : {}),
  ...(roleHasPermission(actor.role, Permission.TASK_READ_ANY)
    ? {}
    : { OR: [{ assigneeId: actor.userId }, { createdById: actor.userId }] }),
});

export const taskUpdateScope = (
  actor: AuthenticatedActor,
  id: string,
): Prisma.TaskWhereInput => ({
  id,
  ...(roleHasPermission(actor.role, Permission.TASK_UPDATE_ANY)
    ? {}
    : { createdById: actor.userId }),
});

export const taskStatusScope = (
  actor: AuthenticatedActor,
  id: string,
): Prisma.TaskWhereInput => ({
  id,
  ...(roleHasPermission(actor.role, Permission.TASK_STATUS_ANY)
    ? {}
    : { assigneeId: actor.userId }),
});

export const taskDeleteScope = (
  actor: AuthenticatedActor,
  id: string,
): Prisma.TaskWhereInput => ({
  id,
  ...(roleHasPermission(actor.role, Permission.TASK_DELETE_ANY)
    ? {}
    : { createdById: actor.userId }),
});

export function canAssignTask(actor: AuthenticatedActor, assigneeId: string): boolean {
  return assigneeId === actor.userId || roleHasPermission(actor.role, Permission.TASK_ASSIGN_ANY);
}

export function customerCapabilities(actor: AuthenticatedActor, ownerId: string) {
  const isOwner = ownerId === actor.userId;
  return {
    update: roleHasPermission(actor.role, Permission.CUSTOMER_UPDATE_ANY)
      || (isOwner && roleHasPermission(actor.role, Permission.CUSTOMER_UPDATE_OWN)),
    delete: roleHasPermission(actor.role, Permission.CUSTOMER_DELETE_ANY)
      || (isOwner && roleHasPermission(actor.role, Permission.CUSTOMER_DELETE_OWN)),
    createNote: roleHasPermission(actor.role, Permission.NOTE_CREATE_ANY)
      || (isOwner && roleHasPermission(actor.role, Permission.NOTE_CREATE_OWN)),
  };
}

export function taskCapabilities(
  actor: AuthenticatedActor,
  task: { createdById: string; assigneeId: string },
) {
  const isCreator = task.createdById === actor.userId;
  const isAssignee = task.assigneeId === actor.userId;
  return {
    update: roleHasPermission(actor.role, Permission.TASK_UPDATE_ANY)
      || (isCreator && roleHasPermission(actor.role, Permission.TASK_UPDATE_CREATED)),
    updateStatus: roleHasPermission(actor.role, Permission.TASK_STATUS_ANY)
      || (isAssignee && roleHasPermission(actor.role, Permission.TASK_STATUS_ASSIGNED)),
    delete: roleHasPermission(actor.role, Permission.TASK_DELETE_ANY)
      || (isCreator && roleHasPermission(actor.role, Permission.TASK_DELETE_CREATED)),
    assign: roleHasPermission(actor.role, Permission.TASK_ASSIGN_ANY),
  };
}
