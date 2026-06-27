import { z } from 'zod';
import { conversationIdParamSchema } from './shared.validation';

export const createMessageBodySchema = z
  .object({
    conversationId: z.string().trim().min(1),
    content: z.string().trim().min(1).max(2000),
    requestAiReply: z.boolean().optional(),
    personaId: z.string().trim().min(1).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.requestAiReply === true && !value.personaId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['personaId'],
        message: 'personaId bat buoc khi yeu cau AI tra loi',
      });
    }
  });

export const listMessagesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  before: z.string().trim().min(1).optional(),
});

export const listMessagesParamsSchema = conversationIdParamSchema;

export type CreateMessageBody = z.infer<typeof createMessageBodySchema>;
export type ListMessagesQuery = z.infer<typeof listMessagesQuerySchema>;
export type ListMessagesParams = z.infer<typeof listMessagesParamsSchema>;
