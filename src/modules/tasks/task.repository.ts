import type { Prisma } from '@prisma/client';
import prisma from '../../config/prisma';

const include = {
  customer: { select: { id: true, name: true, ownerId: true } },
  assignee: { select: { id: true, full_name: true } },
  createdBy: { select: { id: true, full_name: true } },
};

export const taskRepository = {
  findMany(where: Prisma.TaskWhereInput) {
    return prisma.task.findMany({ where, include, orderBy: { createdAt: 'desc' } });
  },

  findOne(where: Prisma.TaskWhereInput) {
    return prisma.task.findFirst({ where, include });
  },

  findId(where: Prisma.TaskWhereInput) {
    return prisma.task.findFirst({
      where,
      select: { id: true, createdById: true, assigneeId: true },
    });
  },

  create(data: Prisma.TaskUncheckedCreateInput) {
    return prisma.task.create({ data, include });
  },

  update(id: string, data: Prisma.TaskUncheckedUpdateInput) {
    return prisma.task.update({ where: { id }, data, include });
  },

  delete(id: string) {
    return prisma.task.delete({ where: { id } });
  },
};
