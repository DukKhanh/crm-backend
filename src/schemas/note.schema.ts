import { z } from 'zod';
export const createNoteSchema = z.object({ body: z.object({ customer_id: z.string().uuid(), content: z.string().trim().min(1).max(3000) }).strict() });
