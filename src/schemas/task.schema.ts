import { TaskStatus } from '@prisma/client';
import { z } from 'zod';
const idParams = z.object({ id: z.string().uuid() });
const dateValue = z.string().datetime().optional().nullable();
export const createTaskSchema = z.object({ body: z.object({ title: z.string().trim().min(2).max(160), description: z.string().trim().max(2000).optional().nullable(), deadline: dateValue, customer_id: z.string().uuid(), assigneeId: z.string().uuid().optional() }).strict() });
export const updateTaskSchema = z.object({ params: idParams, body: z.object({ title: z.string().trim().min(2).max(160).optional(), description: z.string().trim().max(2000).optional().nullable(), deadline: dateValue, customer_id: z.string().uuid().optional(), assigneeId: z.string().uuid().optional() }).strict().refine((v) => Object.keys(v).length > 0) });
export const updateTaskStatusSchema = z.object({ params: idParams, body: z.object({ status: z.nativeEnum(TaskStatus) }).strict() });
export const taskIdSchema = z.object({ params: idParams });
