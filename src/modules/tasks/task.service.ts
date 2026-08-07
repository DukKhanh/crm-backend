import type { Prisma } from '@prisma/client';
import prisma from '../../config/prisma';
import { AppError } from '../../errors/AppError';
import type { AuthenticatedActor } from '../authorization/actor';
import {
  canAssignTask,
  customerReadScope,
  taskCapabilities,
  taskDeleteScope,
  taskReadScope,
  taskStatusScope,
  taskUpdateScope,
} from '../authorization/policies';
import { taskRepository } from './task.repository';

const withCapabilities = <T extends { createdById: string; assigneeId: string }>(
  actor: AuthenticatedActor,
  task: T,
) => ({ ...task, capabilities: taskCapabilities(actor, task) });

async function assertCustomerAccess(actor: AuthenticatedActor, customerId: string): Promise<void> {
  const customer = await prisma.customer.findFirst({
    where: customerReadScope(actor, customerId),
    select: { id: true },
  });
  if (!customer) throw new AppError(404, 'Không tìm thấy khách hàng');
}

async function assertAssignee(actor: AuthenticatedActor, assigneeId: string): Promise<void> {
  if (!canAssignTask(actor, assigneeId)) {
    throw new AppError(403, 'Bạn không có quyền giao việc cho người khác');
  }
  const assignee = await prisma.user.findFirst({
    where: { id: assigneeId, status: 'ACTIVE' },
    select: { id: true },
  });
  if (!assignee) throw new AppError(400, 'Người được giao việc không tồn tại hoặc đã bị khóa');
}

export const taskService = {
  async list(actor: AuthenticatedActor) {
    const tasks = await taskRepository.findMany(taskReadScope(actor));
    return tasks.map((task) => withCapabilities(actor, task));
  },

  async create(actor: AuthenticatedActor, input: {
    title: string;
    description?: string | null;
    deadline?: string | null;
    customer_id: string;
    assigneeId?: string;
  }) {
    await assertCustomerAccess(actor, input.customer_id);
    const assigneeId = input.assigneeId ?? actor.userId;
    await assertAssignee(actor, assigneeId);
    const task = await taskRepository.create({
      title: input.title,
      description: input.description ?? null,
      deadline: input.deadline ? new Date(input.deadline) : null,
      customer_id: input.customer_id,
      createdById: actor.userId,
      assigneeId,
    });
    return withCapabilities(actor, task);
  },

  async updateStatus(actor: AuthenticatedActor, id: string, status: Prisma.TaskUpdateInput['status']) {
    const existing = await taskRepository.findId(taskStatusScope(actor, id));
    if (!existing) throw new AppError(404, 'Không tìm thấy công việc');
    const task = await taskRepository.update(existing.id, { status });
    return withCapabilities(actor, task);
  },

  async update(actor: AuthenticatedActor, id: string, input: {
    title?: string;
    description?: string | null;
    deadline?: string | null;
    customer_id?: string;
    assigneeId?: string;
  }) {
    const existing = await taskRepository.findId(taskUpdateScope(actor, id));
    if (!existing) throw new AppError(404, 'Không tìm thấy công việc');
    if (input.customer_id) await assertCustomerAccess(actor, input.customer_id);
    if (input.assigneeId) await assertAssignee(actor, input.assigneeId);
    const task = await taskRepository.update(existing.id, {
      ...input,
      ...(input.deadline !== undefined
        ? { deadline: input.deadline ? new Date(input.deadline) : null }
        : {}),
    });
    return withCapabilities(actor, task);
  },

  async delete(actor: AuthenticatedActor, id: string) {
    const existing = await taskRepository.findId(taskDeleteScope(actor, id));
    if (!existing) throw new AppError(404, 'Không tìm thấy công việc');
    await taskRepository.delete(existing.id);
  },
};
