import { mapConversation } from '../lib/mappers';
import { createLocalId, createTimestamp, localStore } from '../lib/local-store';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { ApiError } from '../utils/app-error';
import type { AuthUser, DbConversation, DbUser } from '../types/domain';

/**
 * @param conversation Conversation row.
 * @param userId Current authenticated user id.
 * @returns True when the user can access the conversation.
 */
function canAccessConversation(conversation: DbConversation, userId: string): boolean {
  return conversation.user_id === userId || conversation.healer_id === userId;
}

/**
 * @param userId Authenticated patient id.
 * @returns Newly created waiting conversation.
 */
export async function createConversation(userId: string) {
  let conversation: DbConversation;

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        healer_id: null,
        status: 'waiting',
      })
      .select('id,user_id,healer_id,status,ai_insights,created_at')
      .single();

    if (error || !data) {
      throw new ApiError(500, error?.message || 'Khong the tao conversation', 'SUPABASE_INSERT_FAILED');
    }

    conversation = data as DbConversation;
  } else {
    conversation = {
      id: createLocalId('conversation'),
      user_id: userId,
      healer_id: null,
      status: 'waiting',
      ai_insights: null,
      created_at: createTimestamp(),
    };
    localStore.conversations.push(conversation);
  }

  return mapConversation(conversation);
}

/**
 * @returns Queue payload for healer dashboards.
 */
export async function getConversationQueue() {
  const conversations = isSupabaseConfigured ? await listSupabaseWaitingConversations() : listLocalWaitingConversations();
  const nicknameById = isSupabaseConfigured ? await buildSupabaseNicknameMap(conversations) : buildLocalNicknameMap();

  return {
    queue: conversations.map((conversation) => ({
      conversationId: conversation.id,
      userNickname: nicknameById.get(conversation.user_id) ?? 'An danh',
      waitingSince: conversation.created_at,
      aiInsights: conversation.ai_insights,
    })),
  };
}

/**
 * @param conversationId Requested conversation id.
 * @param auth Authenticated healer.
 * @returns Accepted conversation summary.
 */
export async function acceptConversation(conversationId: string, auth: AuthUser) {
  let conversation: DbConversation | null;

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('conversations')
      .update({
        healer_id: auth.userId,
        status: 'active',
      })
      .eq('id', conversationId)
      .eq('status', 'waiting')
      .select('id,user_id,healer_id,status,ai_insights,created_at')
      .maybeSingle();

    if (error) {
      throw new ApiError(500, error.message, 'SUPABASE_UPDATE_FAILED');
    }

    conversation = (data as DbConversation | null) ?? null;
  } else {
    conversation = localStore.conversations.find((item) => item.id === conversationId && item.status === 'waiting') || null;
    if (conversation) {
      conversation.healer_id = auth.userId;
      conversation.status = 'active';
    }
  }

  if (!conversation) {
    throw new ApiError(404, 'Khong tim thay conversation dang cho', 'CONVERSATION_NOT_FOUND');
  }

  return {
    conversationId: conversation.id,
    status: conversation.status,
    healerId: auth.userId,
    healerNickname: auth.nickname,
  };
}

/**
 * @param conversationId Requested conversation id.
 * @param auth Authenticated user or healer.
 * @returns Closed conversation summary.
 */
export async function closeConversation(conversationId: string, auth: AuthUser) {
  const conversation = await findConversationById(conversationId);

  if (!conversation) {
    throw new ApiError(404, 'Khong tim thay conversation', 'CONVERSATION_NOT_FOUND');
  }

  if (!canAccessConversation(conversation, auth.userId)) {
    throw new ApiError(403, 'Khong co quyen dong conversation nay', 'CONVERSATION_FORBIDDEN');
  }

  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('conversations').update({ status: 'closed' }).eq('id', conversationId).select('id,status').maybeSingle();
    if (error) {
      throw new ApiError(500, error.message, 'SUPABASE_UPDATE_FAILED');
    }

    if (!data) {
      throw new ApiError(404, 'Khong tim thay conversation', 'CONVERSATION_NOT_FOUND');
    }

    return {
      conversationId: data.id,
      status: data.status,
    };
  }

  conversation.status = 'closed';
  return {
    conversationId: conversation.id,
    status: conversation.status,
  };
}

/**
 * @param conversationId Requested conversation id.
 * @param auth Authenticated healer.
 * @returns Transfer summary after putting the conversation back in the waiting queue.
 */
export async function transferConversation(conversationId: string, auth: AuthUser) {
  const conversation = await findConversationById(conversationId);

  if (!conversation) {
    throw new ApiError(404, 'Khong tim thay conversation', 'CONVERSATION_NOT_FOUND');
  }

  if (conversation.healer_id !== auth.userId) {
    throw new ApiError(403, 'Chi healer dang xu ly moi duoc chuyen ca', 'CONVERSATION_FORBIDDEN');
  }

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('conversations')
      .update({ healer_id: null, status: 'waiting' })
      .eq('id', conversationId)
      .select('id,status,healer_id')
      .maybeSingle();

    if (error) {
      throw new ApiError(500, error.message, 'SUPABASE_UPDATE_FAILED');
    }

    if (!data) {
      throw new ApiError(404, 'Khong tim thay conversation', 'CONVERSATION_NOT_FOUND');
    }

    return {
      conversationId: data.id,
      status: data.status,
      healerId: data.healer_id,
    };
  }

  conversation.healer_id = null;
  conversation.status = 'waiting';
  return {
    conversationId: conversation.id,
    status: conversation.status,
    healerId: conversation.healer_id,
  };
}

/**
 * @param conversationId Conversation id.
 * @returns Matching conversation or null.
 */
export async function findConversationById(conversationId: string): Promise<DbConversation | null> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('conversations')
      .select('id,user_id,healer_id,status,ai_insights,created_at')
      .eq('id', conversationId)
      .maybeSingle();

    if (error) {
      throw new ApiError(500, error.message, 'SUPABASE_SELECT_FAILED');
    }

    return (data as DbConversation | null) ?? null;
  }

  return localStore.conversations.find((item) => item.id === conversationId) || null;
}

/**
 * @returns Waiting conversations from local mode.
 */
function listLocalWaitingConversations(): DbConversation[] {
  return localStore.conversations
    .filter((conversation) => conversation.status === 'waiting')
    .sort((left, right) => left.created_at.localeCompare(right.created_at));
}

/**
 * @returns Waiting conversations from Supabase.
 */
async function listSupabaseWaitingConversations(): Promise<DbConversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('id,user_id,healer_id,status,ai_insights,created_at')
    .eq('status', 'waiting')
    .order('created_at', { ascending: true });

  if (error) {
    throw new ApiError(500, error.message, 'SUPABASE_SELECT_FAILED');
  }

  return (data ?? []) as DbConversation[];
}

/**
 * @returns Local nickname lookup map.
 */
function buildLocalNicknameMap(): Map<string, string> {
  return new Map(localStore.users.map((user) => [user.id, user.nickname]));
}

/**
 * @param conversations Waiting conversations that need user nicknames.
 * @returns Lookup map of user id to nickname.
 */
async function buildSupabaseNicknameMap(conversations: DbConversation[]): Promise<Map<string, string>> {
  const userIds = [...new Set(conversations.map((item) => item.user_id))];
  const nicknameById = new Map<string, string>();

  if (userIds.length === 0) {
    return nicknameById;
  }

  const { data, error } = await supabase.from('users').select('id,nickname').in('id', userIds);
  if (error) {
    throw new ApiError(500, error.message, 'SUPABASE_SELECT_FAILED');
  }

  for (const user of (data ?? []) as Pick<DbUser, 'id' | 'nickname'>[]) {
    nicknameById.set(user.id, user.nickname);
  }

  return nicknameById;
}
