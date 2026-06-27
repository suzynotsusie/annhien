import { z } from 'zod';
import { entityIdParamSchema, paginationQuerySchema } from './shared.validation';

const topicSchema = z.enum(['study', 'family', 'relationship', 'daily', 'other']);

export const listPostsQuerySchema = paginationQuerySchema.extend({
  topic: topicSchema.optional(),
});

export const createPostBodySchema = z.object({
  content: z.string().trim().min(1).max(500),
  topic: topicSchema,
});

export const postIdParamSchema = entityIdParamSchema;

export const reactToPostBodySchema = z.object({
  reaction: z.enum(['hug', 'empathy', 'peace']),
});

export const updatePostStatusBodySchema = z.object({
  status: z.enum(['public', 'hidden']),
});

export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;
export type CreatePostBody = z.infer<typeof createPostBodySchema>;
export type PostIdParams = z.infer<typeof postIdParamSchema>;
export type ReactToPostBody = z.infer<typeof reactToPostBodySchema>;
export type UpdatePostStatusBody = z.infer<typeof updatePostStatusBodySchema>;
