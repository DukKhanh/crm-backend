import type { Prisma } from '@prisma/client';
import { AppError } from '../../errors/AppError';
import type { AuthenticatedActor } from '../authorization/actor';
import {
  customerCapabilities,
  customerDeleteScope,
  customerReadScope,
  customerUpdateScope,
} from '../authorization/policies';
import { customerRepository } from './customer.repository';

const withCapabilities = <T extends { ownerId: string }>(actor: AuthenticatedActor, customer: T) => ({
  ...customer,
  capabilities: customerCapabilities(actor, customer.ownerId),
});

export const customerService = {
  async list(actor: AuthenticatedActor) {
    const customers = await customerRepository.findMany(customerReadScope(actor));
    return customers.map((customer) => withCapabilities(actor, customer));
  },

  async getById(actor: AuthenticatedActor, id: string) {
    const customer = await customerRepository.findDetail(customerReadScope(actor, id));
    if (!customer) throw new AppError(404, 'Không tìm thấy khách hàng');
    return withCapabilities(actor, customer);
  },

  async create(actor: AuthenticatedActor, input: {
    name: string;
    phone?: string | null;
    email?: string | null;
    company?: string | null;
    address?: string | null;
    status?: Prisma.CustomerUncheckedCreateInput['status'];
  }) {
    const customer = await customerRepository.create({
      ...input,
      email: input.email || null,
      ownerId: actor.userId,
    });
    return withCapabilities(actor, customer);
  },

  async update(actor: AuthenticatedActor, id: string, input: Prisma.CustomerUpdateInput) {
    const existing = await customerRepository.findId(customerUpdateScope(actor, id));
    if (!existing) throw new AppError(404, 'Không tìm thấy khách hàng');
    const customer = await customerRepository.update(existing.id, input);
    return withCapabilities(actor, customer);
  },

  async delete(actor: AuthenticatedActor, id: string) {
    const existing = await customerRepository.findId(customerDeleteScope(actor, id));
    if (!existing) throw new AppError(404, 'Không tìm thấy khách hàng');
    await customerRepository.delete(existing.id);
  },
};
