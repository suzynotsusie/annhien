import { z } from 'zod';

export const authSetupBodySchema = z.object({
  nickname: z.string().trim().min(1).max(50),
  topics: z.array(z.string().trim()).max(10).default([]),
  role: z.literal('user').optional(),
});

export const authLoginBodySchema = z.object({
  username: z.string().trim().min(1).max(50),
  password: z.string().min(1).max(255),
});

export const authStatusBodySchema = z.object({
  status: z.enum(['online', 'busy', 'offline']),
});

export type AuthSetupBody = z.infer<typeof authSetupBodySchema>;
export type AuthLoginBody = z.infer<typeof authLoginBodySchema>;
export type AuthStatusBody = z.infer<typeof authStatusBodySchema>;
