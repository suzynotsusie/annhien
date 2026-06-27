import { z } from 'zod';
import { entityIdParamSchema, paginationQuerySchema } from './shared.validation';

export const createJournalBodySchema = z.object({
  encryptedContent: z.string().trim().min(1),
  mood: z.enum(['great', 'good', 'okay', 'tired', 'anxious']),
});

export const journalListQuerySchema = paginationQuerySchema;
export const journalIdParamSchema = entityIdParamSchema;

export type CreateJournalBody = z.infer<typeof createJournalBodySchema>;
export type JournalListQuery = z.infer<typeof journalListQuerySchema>;
export type JournalIdParams = z.infer<typeof journalIdParamSchema>;
