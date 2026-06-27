import { z } from 'zod';
import { entityIdParamSchema } from './shared.validation';

export const conversationIdRouteSchema = entityIdParamSchema;
export const emptyBodySchema = z.object({}).passthrough();

export type ConversationIdRouteParams = z.infer<typeof conversationIdRouteSchema>;
