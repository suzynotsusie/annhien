import { z } from 'zod';

export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export const entityIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export const conversationIdParamSchema = z.object({
  conversationId: z.string().trim().min(1),
});
