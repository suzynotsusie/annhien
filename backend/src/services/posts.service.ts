import { DEFAULT_REACTIONS } from '../lib/constants';
import { mapPost, mapPostWithStatus } from '../lib/mappers';
import { createLocalId, createTimestamp, localStore } from '../lib/local-store';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { ApiError } from '../utils/app-error';
import { runModeration } from './ai.service';
import type { DbPost, DbPostReaction, ModerationResult, ReactionType } from '../types/domain';
import type {
  CreatePostBody,
  ListPostsQuery,
  ReactToPostBody,
  UpdatePostStatusBody,
} from '../validations/posts.validation';

/**
 * @param value Persisted reactions payload.
 * @returns Normalized reaction object with all required keys.
 */
function normalizeReactions(value: unknown): Record<ReactionType, number> {
  const raw = (value || {}) as Partial<Record<ReactionType, number>>;
  return {
    hug: Number(raw.hug ?? 0),
    empathy: Number(raw.empathy ?? 0),
    peace: Number(raw.peace ?? 0),
  };
}

/**
 * @param query Validated post listing query.
 * @returns Public posts with pagination metadata.
 */
export async function listPublicPosts(query: ListPostsQuery) {
  const limit = query.limit ?? 20;
  const offset = query.offset ?? 0;

  if (isSupabaseConfigured) {
    let statement = supabase
      .from('posts')
      .select('id,author_id,content,topic,status,author_label,reactions,created_at', { count: 'exact' })
      .eq('status', 'public')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (query.topic) {
      statement = statement.eq('topic', query.topic);
    }

    const { data, error, count } = await statement;
    if (error) {
      throw new ApiError(500, error.message, 'SUPABASE_SELECT_FAILED');
    }

    return {
      posts: ((data ?? []) as DbPost[]).map(mapPostWithStatus),
      total: count ?? 0,
      hasMore: offset + limit < (count ?? 0),
    };
  }

  const rows = localStore.posts
    .filter((post) => post.status === 'public' && (!query.topic || post.topic === query.topic))
    .sort((left, right) => right.created_at.localeCompare(left.created_at));

  return {
    posts: rows.slice(offset, offset + limit).map(mapPostWithStatus),
    total: rows.length,
    hasMore: offset + limit < rows.length,
  };
}

/**
 * @returns Flagged posts for admin moderation.
 */
export async function listFlaggedPosts() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('posts')
      .select('id,author_id,content,topic,status,author_label,reactions,created_at')
      .eq('status', 'flagged')
      .order('created_at', { ascending: false });

    if (error) {
      throw new ApiError(500, error.message, 'SUPABASE_SELECT_FAILED');
    }

    return {
      posts: ((data ?? []) as DbPost[]).map(mapPostWithStatus),
    };
  }

  return {
    posts: localStore.posts.filter((post) => post.status === 'flagged').map(mapPostWithStatus),
  };
}

/**
 * @param userId Authenticated author id.
 * @param input Validated post payload.
 * @returns Created post in API shape plus moderation metadata.
 */
export async function createPost(userId: string, input: CreatePostBody) {
  const moderation = await safelyRunModeration(input.content);
  if (moderation.verdict === 'blocked') {
    throw new ApiError(400, 'Noi dung khong phu hop tieu chuan cong dong', 'CONTENT_BLOCKED', {
      triggerSOS: moderation.triggerSOS,
      reason: moderation.reason,
    });
  }

  const status = moderation.verdict === 'flagged' || moderation.triggerSOS ? 'flagged' : 'public';
  let post: DbPost;

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        author_id: userId,
        content: input.content,
        topic: input.topic,
        status,
        author_label: 'An danh',
        reactions: DEFAULT_REACTIONS,
      })
      .select('id,author_id,content,topic,status,author_label,reactions,created_at')
      .single();

    if (error || !data) {
      throw new ApiError(500, error?.message || 'Khong the tao post', 'SUPABASE_INSERT_FAILED');
    }

    post = data as DbPost;
  } else {
    post = {
      id: createLocalId('post'),
      author_id: userId,
      content: input.content,
      topic: input.topic,
      status,
      author_label: 'An danh',
      reactions: { ...DEFAULT_REACTIONS },
      created_at: createTimestamp(),
    };
    localStore.posts.push(post);
  }

  return {
    ...mapPostWithStatus(post),
    triggerSOS: moderation.triggerSOS,
  };
}

/**
 * @param userId Authenticated reactor id.
 * @param postId Target post id.
 * @param input Validated reaction payload.
 * @returns Updated reaction counters and the current user's active reaction.
 */
export async function reactToPost(userId: string, postId: string, input: ReactToPostBody) {
  if (isSupabaseConfigured) {
    return reactToSupabasePost(userId, postId, input.reaction);
  }

  const post = localStore.posts.find((item) => item.id === postId);
  if (!post) {
    throw new ApiError(404, 'Khong tim thay post', 'POST_NOT_FOUND');
  }

  const existing = localStore.postReactions.find((item) => item.post_id === postId && item.user_id === userId) || null;
  const reactions = normalizeReactions(post.reactions);
  let userReaction: ReactionType | null = input.reaction;

  if (existing?.reaction_type === input.reaction) {
    localStore.postReactions = localStore.postReactions.filter((item) => item.id !== existing.id);
    reactions[input.reaction] = Math.max(0, reactions[input.reaction] - 1);
    userReaction = null;
  } else if (existing) {
    reactions[existing.reaction_type] = Math.max(0, reactions[existing.reaction_type] - 1);
    existing.reaction_type = input.reaction;
    reactions[input.reaction] += 1;
  } else {
    const row: DbPostReaction = {
      id: createLocalId('post-reaction'),
      post_id: postId,
      user_id: userId,
      reaction_type: input.reaction,
      created_at: createTimestamp(),
    };
    localStore.postReactions.push(row);
    reactions[input.reaction] += 1;
  }

  post.reactions = reactions;
  return { reactions, userReaction };
}

/**
 * @param postId Target post id.
 * @param input Validated status update payload.
 * @returns Minimal updated status payload.
 */
export async function updatePostStatus(postId: string, input: UpdatePostStatusBody) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('posts')
      .update({ status: input.status })
      .eq('id', postId)
      .select('id,status')
      .maybeSingle();

    if (error) {
      throw new ApiError(500, error.message, 'SUPABASE_UPDATE_FAILED');
    }

    if (!data) {
      throw new ApiError(404, 'Khong tim thay post', 'POST_NOT_FOUND');
    }

    return data;
  }

  const post = localStore.posts.find((item) => item.id === postId);
  if (!post) {
    throw new ApiError(404, 'Khong tim thay post', 'POST_NOT_FOUND');
  }

  post.status = input.status;
  return {
    id: post.id,
    status: post.status,
  };
}

/**
 * @param content Post body to moderate.
 * @returns Safe moderation result even if the AI layer fails unexpectedly.
 */
async function safelyRunModeration(content: string): Promise<ModerationResult> {
  try {
    return await runModeration(content);
  } catch {
    return {
      verdict: 'flagged',
      triggerSOS: false,
      reason: 'AI moderation tam thoi khong kha dung, can admin xem xet.',
    };
  }
}

/**
 * @param userId Authenticated reactor id.
 * @param postId Target post id.
 * @param reaction Reaction type.
 * @returns Updated reaction counters and the current user's active reaction.
 */
async function reactToSupabasePost(userId: string, postId: string, reaction: ReactionType) {
  const { data: postData, error: postError } = await supabase.from('posts').select('id,reactions').eq('id', postId).maybeSingle();
  if (postError) {
    throw new ApiError(500, postError.message, 'SUPABASE_SELECT_FAILED');
  }

  if (!postData) {
    throw new ApiError(404, 'Khong tim thay post', 'POST_NOT_FOUND');
  }

  const { data: existingData, error: existingError } = await supabase
    .from('post_reactions')
    .select('id,reaction_type')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existingError) {
    throw new ApiError(500, existingError.message, 'SUPABASE_SELECT_FAILED');
  }

  const reactions = normalizeReactions((postData as Pick<DbPost, 'reactions'>).reactions);
  let userReaction: ReactionType | null = reaction;

  if (existingData?.reaction_type === reaction) {
    const { error } = await supabase.from('post_reactions').delete().eq('id', existingData.id);
    if (error) {
      throw new ApiError(500, error.message, 'SUPABASE_DELETE_FAILED');
    }
    reactions[reaction] = Math.max(0, reactions[reaction] - 1);
    userReaction = null;
  } else if (existingData) {
    const oldReaction = existingData.reaction_type as ReactionType;
    const { error } = await supabase.from('post_reactions').update({ reaction_type: reaction }).eq('id', existingData.id);
    if (error) {
      throw new ApiError(500, error.message, 'SUPABASE_UPDATE_FAILED');
    }
    reactions[oldReaction] = Math.max(0, reactions[oldReaction] - 1);
    reactions[reaction] += 1;
  } else {
    const { error } = await supabase.from('post_reactions').insert({
      post_id: postId,
      user_id: userId,
      reaction_type: reaction,
    });
    if (error) {
      throw new ApiError(500, error.message, 'SUPABASE_INSERT_FAILED');
    }
    reactions[reaction] += 1;
  }

  const { error: updateError } = await supabase.from('posts').update({ reactions }).eq('id', postId);
  if (updateError) {
    throw new ApiError(500, updateError.message, 'SUPABASE_UPDATE_FAILED');
  }

  return { reactions, userReaction };
}
