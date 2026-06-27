import { Router } from 'express';
import { ApiError, asyncRoute, parsePagination, sendError } from '../lib/http';
import { mapMessage } from '../lib/mappers';
import { supabase } from '../lib/supabase';
import { isNonEmptyString } from '../lib/validation';
import { verifyToken, type AuthRequest } from '../middleware/auth';
import { assertPersonaId, generatePersonaReply } from '../services/ai.service';
import type { AiHistoryItem, DbConversation, DbMessage, SenderRole } from '../types/domain';

const router = Router();

router.use(verifyToken);

async function getConversationOrThrow(conversationId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select('id,user_id,healer_id,status,ai_insights,created_at')
    .eq('id', conversationId)
    .single();

  if (error || !data) {
    throw new ApiError(404, 'Khong tim thay conversation', 'CONVERSATION_NOT_FOUND');
  }

  return data as DbConversation;
}

function canAccessConversation(conversation: DbConversation, userId: string) {
  return conversation.user_id === userId || conversation.healer_id === userId;
}

function senderRoleFromAuth(role: string): SenderRole {
  if (role === 'healer') return 'healer';
  if (role === 'doctor') return 'doctor';
  return 'user';
}

router.post(
  '/',
  asyncRoute(async (req, res) => {
    const auth = (req as AuthRequest).user!;
    const { conversationId, content, requestAiReply, personaId } = req.body as Record<string, unknown>;
    const cleanContent = typeof content === 'string' ? content.trim() : '';

    if (!isNonEmptyString(conversationId)) {
      return sendError(res, 400, 'conversationId la bat buoc', 'INVALID_CONVERSATION_ID');
    }

    if (!isNonEmptyString(cleanContent) || cleanContent.length > 2000) {
      return sendError(res, 400, 'Content bat buoc tu 1 den 2000 ky tu', 'INVALID_CONTENT');
    }

    const safePersonaId = requestAiReply === true ? assertPersonaId(personaId) : null;
    if (requestAiReply === true && !safePersonaId) {
      return sendError(res, 400, 'PersonaId khong hop le', 'INVALID_PERSONA_ID');
    }

    const conversation = await getConversationOrThrow(conversationId);
    if (!canAccessConversation(conversation, auth.userId)) {
      return sendError(res, 403, 'Khong co quyen gui tin trong conversation nay', 'CONVERSATION_FORBIDDEN');
    }

    const { data: userMessageData, error: insertError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: auth.userId,
        sender_role: senderRoleFromAuth(auth.role),
        content: cleanContent,
      })
      .select('id,conversation_id,sender_id,sender_role,content,created_at')
      .single();

    if (insertError || !userMessageData) {
      throw new ApiError(500, insertError?.message || 'Khong the luu message', 'SUPABASE_INSERT_FAILED');
    }

    let aiReplyData: DbMessage | null = null;

    if (requestAiReply === true) {
      const personaForReply = safePersonaId;
      if (!personaForReply) {
        return sendError(res, 400, 'PersonaId khong hop le', 'INVALID_PERSONA_ID');
      }

      const { data: recentMessages, error: historyError } = await supabase
        .from('messages')
        .select('sender_role,content')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (historyError) {
        throw new ApiError(500, historyError.message, 'SUPABASE_SELECT_FAILED');
      }

      const history: AiHistoryItem[] = ((recentMessages ?? []) as Pick<DbMessage, 'sender_role' | 'content'>[])
        .reverse()
        .map((item) => ({
          role: item.sender_role === 'ai' ? 'model' : 'user',
          content: item.content,
        }));

      const aiReply = await generatePersonaReply(personaForReply, cleanContent, history);
      const { data: aiData, error: aiInsertError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: null,
          sender_role: 'ai',
          content: aiReply.reply,
        })
        .select('id,conversation_id,sender_id,sender_role,content,created_at')
        .single();

      if (aiInsertError || !aiData) {
        throw new ApiError(500, aiInsertError?.message || 'Khong the luu AI reply', 'SUPABASE_INSERT_FAILED');
      }

      aiReplyData = aiData as DbMessage;
    }

    return res.status(201).json({
      userMessage: mapMessage(userMessageData as DbMessage),
      ...(aiReplyData ? { aiReply: mapMessage(aiReplyData) } : {}),
    });
  })
);

router.get(
  '/:conversationId',
  asyncRoute(async (req, res) => {
    const auth = (req as AuthRequest).user!;
    const { limit } = parsePagination(req.query, { limit: 50, offset: 0 });
    const conversation = await getConversationOrThrow(req.params.conversationId);

    if (!canAccessConversation(conversation, auth.userId)) {
      return sendError(res, 403, 'Khong co quyen doc conversation nay', 'CONVERSATION_FORBIDDEN');
    }

    let query = supabase
      .from('messages')
      .select('id,conversation_id,sender_id,sender_role,content,created_at')
      .eq('conversation_id', req.params.conversationId)
      .order('created_at', { ascending: false })
      .limit(limit + 1);

    if (typeof req.query.before === 'string' && req.query.before.trim()) {
      const { data: beforeMessage, error: beforeError } = await supabase
        .from('messages')
        .select('created_at')
        .eq('id', req.query.before)
        .eq('conversation_id', req.params.conversationId)
        .maybeSingle();

      if (beforeError) {
        throw new ApiError(500, beforeError.message, 'SUPABASE_SELECT_FAILED');
      }

      if (beforeMessage?.created_at) {
        query = query.lt('created_at', beforeMessage.created_at);
      }
    }

    const { data, error } = await query;
    if (error) {
      throw new ApiError(500, error.message, 'SUPABASE_SELECT_FAILED');
    }

    const rows = (data ?? []) as DbMessage[];
    const page = rows.slice(0, limit);

    return res.status(200).json({
      messages: page.reverse().map(mapMessage),
      hasMore: rows.length > limit,
    });
  })
);

export default router;
