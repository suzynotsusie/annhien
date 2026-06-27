import { mapMessage } from '../lib/mappers';
import { createLocalId, createTimestamp, localStore } from '../lib/local-store';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { ApiError } from '../utils/app-error';
import { assertPersonaId, generatePersonaReply } from './ai.service';
import { findConversationById } from './conversations.service';
import type { AuthUser, DbConversation, DbMessage, SenderRole } from '../types/domain';
import type { CreateMessageBody, ListMessagesQuery } from '../validations/messages.validation';

/**
 * @param conversation Conversation row.
 * @param userId Current authenticated user id.
 * @returns True when the user can access the conversation.
 */
function canAccessConversation(conversation: DbConversation, userId: string): boolean {
  return conversation.user_id === userId || conversation.healer_id === userId;
}

/**
 * @param role Authenticated role.
 * @returns Sender role persisted for chat messages.
 */
function senderRoleFromAuth(role: AuthUser['role']): SenderRole {
  if (role === 'healer') {
    return 'healer';
  }

  if (role === 'doctor') {
    return 'doctor';
  }

  return 'user';
}

/**
 * @param auth Authenticated user.
 * @param input Validated message payload.
 * @returns Created message payload, optionally including an AI reply.
 */
export async function createMessage(auth: AuthUser, input: CreateMessageBody) {
  const conversation = await findConversationById(input.conversationId);

  if (!conversation) {
    throw new ApiError(404, 'Khong tim thay conversation', 'CONVERSATION_NOT_FOUND');
  }

  if (!canAccessConversation(conversation, auth.userId)) {
    throw new ApiError(403, 'Khong co quyen gui tin trong conversation nay', 'CONVERSATION_FORBIDDEN');
  }

  const userMessage = await createPersistedMessage({
    conversationId: input.conversationId,
    senderId: auth.userId,
    senderRole: senderRoleFromAuth(auth.role),
    content: input.content,
  });

  let aiReply: DbMessage | null = null;

  if (input.requestAiReply === true) {
    const safePersonaId = assertPersonaId(input.personaId);
    if (!safePersonaId) {
      throw new ApiError(400, 'PersonaId khong hop le', 'INVALID_PERSONA_ID');
    }

    const history = await listRecentHistory(input.conversationId);
    const response = await generatePersonaReply(safePersonaId, input.content, history);
    aiReply = await createPersistedMessage({
      conversationId: input.conversationId,
      senderId: null,
      senderRole: 'ai',
      content: response.reply,
    });
  }

  return {
    userMessage: mapMessage(userMessage),
    ...(aiReply ? { aiReply: mapMessage(aiReply) } : {}),
  };
}

/**
 * @param auth Authenticated user.
 * @param conversationId Target conversation id.
 * @param query Validated pagination query.
 * @returns Message history page in API shape.
 */
export async function listMessages(auth: AuthUser, conversationId: string, query: ListMessagesQuery) {
  const conversation = await findConversationById(conversationId);

  if (!conversation) {
    throw new ApiError(404, 'Khong tim thay conversation', 'CONVERSATION_NOT_FOUND');
  }

  if (!canAccessConversation(conversation, auth.userId)) {
    throw new ApiError(403, 'Khong co quyen doc conversation nay', 'CONVERSATION_FORBIDDEN');
  }

  const limit = query.limit ?? 50;

  if (isSupabaseConfigured) {
    let statement = supabase
      .from('messages')
      .select('id,conversation_id,sender_id,sender_role,content,created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit + 1);

    if (query.before) {
      const { data: beforeMessage, error: beforeError } = await supabase
        .from('messages')
        .select('created_at')
        .eq('id', query.before)
        .eq('conversation_id', conversationId)
        .maybeSingle();

      if (beforeError) {
        throw new ApiError(500, beforeError.message, 'SUPABASE_SELECT_FAILED');
      }

      if (beforeMessage?.created_at) {
        statement = statement.lt('created_at', beforeMessage.created_at);
      }
    }

    const { data, error } = await statement;
    if (error) {
      throw new ApiError(500, error.message, 'SUPABASE_SELECT_FAILED');
    }

    const rows = (data ?? []) as DbMessage[];
    const page = rows.slice(0, limit);

    return {
      messages: page.reverse().map(mapMessage),
      hasMore: rows.length > limit,
    };
  }

  const sorted = localStore.messages
    .filter((message) => message.conversation_id === conversationId)
    .sort((left, right) => right.created_at.localeCompare(left.created_at));

  const filtered = query.before
    ? sorted.filter((message) => {
        const beforeMessage = localStore.messages.find((item) => item.id === query.before);
        return beforeMessage ? message.created_at < beforeMessage.created_at : true;
      })
    : sorted;

  const page = filtered.slice(0, limit);
  return {
    messages: page.reverse().map(mapMessage),
    hasMore: filtered.length > limit,
  };
}

interface PersistMessageInput {
  conversationId: string;
  senderId: string | null;
  senderRole: SenderRole;
  content: string;
}

/**
 * @param input Persisted message payload.
 * @returns Stored message row.
 */
async function createPersistedMessage(input: PersistMessageInput): Promise<DbMessage> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: input.conversationId,
        sender_id: input.senderId,
        sender_role: input.senderRole,
        content: input.content,
      })
      .select('id,conversation_id,sender_id,sender_role,content,created_at')
      .single();

    if (error || !data) {
      throw new ApiError(500, error?.message || 'Khong the luu message', 'SUPABASE_INSERT_FAILED');
    }

    return data as DbMessage;
  }

  const row: DbMessage = {
    id: createLocalId('message'),
    conversation_id: input.conversationId,
    sender_id: input.senderId,
    sender_role: input.senderRole,
    content: input.content,
    created_at: createTimestamp(),
  };
  localStore.messages.push(row);
  return row;
}

/**
 * @param conversationId Target conversation id.
 * @returns Lightweight history items for the AI assistant.
 */
async function listRecentHistory(conversationId: string) {
  const rows = isSupabaseConfigured
    ? await listSupabaseRecentMessages(conversationId)
    : localStore.messages
        .filter((message) => message.conversation_id === conversationId)
        .sort((left, right) => left.created_at.localeCompare(right.created_at))
        .slice(-10);

  return rows.map((item) => ({
    role: item.sender_role === 'ai' ? 'model' : 'user',
    content: item.content,
  })) as Array<{ role: 'user' | 'model'; content: string }>;
}

/**
 * @param conversationId Target conversation id.
 * @returns Recent messages from Supabase.
 */
async function listSupabaseRecentMessages(conversationId: string): Promise<DbMessage[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('id,conversation_id,sender_id,sender_role,content,created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    throw new ApiError(500, error.message, 'SUPABASE_SELECT_FAILED');
  }

  return ((data ?? []) as DbMessage[]).reverse();
}
