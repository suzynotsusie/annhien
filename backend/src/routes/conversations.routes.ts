import { Router } from 'express';
import { ApiError, asyncRoute, sendError } from '../lib/http';
import { mapConversation } from '../lib/mappers';
import { supabase } from '../lib/supabase';
import { requireRole, verifyToken, type AuthRequest } from '../middleware/auth';
import type { DbConversation, DbUser } from '../types/domain';

const router = Router();

router.use(verifyToken);

function canAccessConversation(conversation: DbConversation, userId: string) {
  return conversation.user_id === userId || conversation.healer_id === userId;
}

router.post(
  '/',
  requireRole('user'),
  asyncRoute(async (req, res) => {
    const auth = (req as AuthRequest).user!;
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: auth.userId,
        healer_id: null,
        status: 'waiting',
      })
      .select('id,user_id,healer_id,status,ai_insights,created_at')
      .single();

    if (error || !data) {
      throw new ApiError(500, error?.message || 'Khong the tao conversation', 'SUPABASE_INSERT_FAILED');
    }

    return res.status(201).json(mapConversation(data as DbConversation));
  })
);

router.get(
  '/queue',
  requireRole('healer'),
  asyncRoute(async (_req, res) => {
    const { data, error } = await supabase
      .from('conversations')
      .select('id,user_id,healer_id,status,ai_insights,created_at')
      .eq('status', 'waiting')
      .order('created_at', { ascending: true });

    if (error) {
      throw new ApiError(500, error.message, 'SUPABASE_SELECT_FAILED');
    }

    const conversations = (data ?? []) as DbConversation[];
    const userIds = [...new Set(conversations.map((item) => item.user_id))];
    const nicknameById = new Map<string, string>();

    if (userIds.length > 0) {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id,nickname')
        .in('id', userIds);

      if (usersError) {
        throw new ApiError(500, usersError.message, 'SUPABASE_SELECT_FAILED');
      }

      for (const user of (users ?? []) as Pick<DbUser, 'id' | 'nickname'>[]) {
        nicknameById.set(user.id, user.nickname);
      }
    }

    return res.status(200).json({
      queue: conversations.map((conversation) => ({
        conversationId: conversation.id,
        userNickname: nicknameById.get(conversation.user_id) ?? 'An danh',
        waitingSince: conversation.created_at,
        aiInsights: conversation.ai_insights,
      })),
    });
  })
);

router.patch(
  '/:id/accept',
  requireRole('healer'),
  asyncRoute(async (req, res) => {
    const auth = (req as AuthRequest).user!;
    const { data, error } = await supabase
      .from('conversations')
      .update({
        healer_id: auth.userId,
        status: 'active',
      })
      .eq('id', req.params.id)
      .eq('status', 'waiting')
      .select('id,user_id,healer_id,status,ai_insights,created_at')
      .single();

    if (error || !data) {
      throw new ApiError(404, 'Khong tim thay conversation dang cho', 'CONVERSATION_NOT_FOUND');
    }

    const conversation = data as DbConversation;
    return res.status(200).json({
      conversationId: conversation.id,
      status: conversation.status,
      healerId: auth.userId,
      healerNickname: auth.nickname,
    });
  })
);

router.patch(
  '/:id/close',
  asyncRoute(async (req, res) => {
    const auth = (req as AuthRequest).user!;
    const { data: existing, error: existingError } = await supabase
      .from('conversations')
      .select('id,user_id,healer_id,status,ai_insights,created_at')
      .eq('id', req.params.id)
      .single();

    if (existingError || !existing) {
      throw new ApiError(404, 'Khong tim thay conversation', 'CONVERSATION_NOT_FOUND');
    }

    const conversation = existing as DbConversation;
    if (!canAccessConversation(conversation, auth.userId)) {
      return sendError(res, 403, 'Khong co quyen dong conversation nay', 'CONVERSATION_FORBIDDEN');
    }

    const { data, error } = await supabase
      .from('conversations')
      .update({ status: 'closed' })
      .eq('id', req.params.id)
      .select('id,status')
      .single();

    if (error || !data) {
      throw new ApiError(500, error?.message || 'Khong the dong conversation', 'SUPABASE_UPDATE_FAILED');
    }

    return res.status(200).json({
      conversationId: data.id,
      status: data.status,
    });
  })
);

export default router;
