import prisma from '../../config/prisma';
import { AppError } from '../../errors/AppError';
import type { AuthenticatedActor } from '../authorization/actor';
import { customerReadScope } from '../authorization/policies';

export const noteService = {
  async create(actor: AuthenticatedActor, input: { customer_id: string; content: string }) {
    const customer = await prisma.customer.findFirst({
      where: customerReadScope(actor, input.customer_id),
      select: { id: true },
    });
    if (!customer) throw new AppError(404, 'Không tìm thấy khách hàng');
    return prisma.note.create({
      data: {
        customer_id: input.customer_id,
        content: input.content,
        authorId: actor.userId,
      },
      include: { author: { select: { id: true, full_name: true } } },
    });
  },
};
