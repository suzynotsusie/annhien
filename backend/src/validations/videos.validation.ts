import { z } from 'zod';
import { paginationQuerySchema } from './shared.validation';

const topicSchema = z.enum(['study', 'family', 'relationship', 'daily', 'other']);

export const listVideosQuerySchema = paginationQuerySchema.extend({
  topic: topicSchema.optional(),
});

export const createVideoBodySchema = z.object({
  title: z.string().trim().min(1).max(200),
  topic: topicSchema,
  videoUrl: z.string().trim().min(1),
  description: z.string().trim().max(500).optional().or(z.literal('')),
});

export type ListVideosQuery = z.infer<typeof listVideosQuerySchema>;
export type CreateVideoBody = z.infer<typeof createVideoBodySchema>;
