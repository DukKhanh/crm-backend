import { CustomerStatus } from '@prisma/client';
import { z } from 'zod';

const idParams = z.object({ id: z.string().uuid() });
const customerFields = {
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(30).optional().nullable(),
  email: z.string().trim().email().optional().nullable().or(z.literal('')),
  company: z.string().trim().max(120).optional().nullable(),
  address: z.string().trim().max(255).optional().nullable(),
  status: z.nativeEnum(CustomerStatus).optional(),
};
export const createCustomerSchema = z.object({ body: z.object(customerFields).strict() });
export const updateCustomerSchema = z.object({ params: idParams, body: z.object(customerFields).partial().strict().refine((v) => Object.keys(v).length > 0) });
export const customerIdSchema = z.object({ params: idParams });
