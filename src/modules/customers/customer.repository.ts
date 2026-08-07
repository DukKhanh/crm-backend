import type { Prisma } from '@prisma/client';
import prisma from '../../config/prisma';

const detailInclude = {
  owner: { select: { id: true, full_name: true } },
  tasks: { orderBy: { createdAt: 'desc' as const } },
  notes: {
    orderBy: { createdAt: 'desc' as const },
    include: { author: { select: { id: true, full_name: true } } },
  },
};

export const customerRepository = {
  findMany(where: Prisma.CustomerWhereInput) {
    return prisma.customer.findMany({
      where,
      include: { owner: { select: { id: true, full_name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  findDetail(where: Prisma.CustomerWhereInput) {
    return prisma.customer.findFirst({ where, include: detailInclude });
  },

  findId(where: Prisma.CustomerWhereInput) {
    return prisma.customer.findFirst({ where, select: { id: true, ownerId: true } });
  },

  create(data: Prisma.CustomerUncheckedCreateInput) {
    return prisma.customer.create({ data });
  },

  update(id: string, data: Prisma.CustomerUpdateInput) {
    return prisma.customer.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.customer.delete({ where: { id } });
  },
};
