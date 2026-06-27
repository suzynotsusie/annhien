import { z } from 'zod';

export const aiChatBodySchema = z.object({
  personaId: z.string().trim().min(1),
  userMessage: z.string().trim().min(1),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        content: z.string().trim().min(1),
      })
    )
    .max(20)
    .optional(),
});

export const aiTriageBodySchema = z.object({
  plainText: z.string().trim().min(1),
});

export const aiModerationBodySchema = z.object({
  content: z.string().trim().min(1),
});

export type AiChatBody = z.infer<typeof aiChatBodySchema>;
export type AiTriageBody = z.infer<typeof aiTriageBodySchema>;
export type AiModerationBody = z.infer<typeof aiModerationBodySchema>;
