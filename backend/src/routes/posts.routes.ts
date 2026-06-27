import { Router } from 'express';
import { DEFAULT_REACTIONS } from '../lib/constants';
import { ApiError, asyncRoute, parsePagination, sendError } from '../lib/http';
import { mapPost, mapPostWithStatus } from '../lib/mappers';
import { supabase } from '../lib/supabase';
import { asPostStatus, asReaction, asTopic, isNonEmptyString } from '../lib/validation';
import { requireRole, verifyToken, type AuthRequest } from '../middleware/auth';
import { runModeration } from '../services/ai.service';
import type { DbPost, ModerationResult, ReactionType } from '../types/domain';

const router = Router();

function normalizeReactions(value: unknown): Record<ReactionType, number> {
  const raw = (value || {}) as Partial<Record<ReactionType, number>>;
  return {
    hug: Number(raw.hug ?? 0),
    empathy: Number(raw.empathy ?? 0),
    peace: Number(raw.peace ?? 0),
  };
}

router.get(
  '/',
  asyncRoute(async (req, res) => {
    const { limit, offset } = parsePagination(req.query, { limit: 20, offset: 0 });
    const topic = req.query.topic ? asTopic(req.query.topic) : null;

    if (req.query.topic && !topic) {
      return sendError(res, 400, 'Topic khong hop le', 'INVALID_TOPIC');
    }

    let query = supabase
      .from('posts')
      .select('id,author_id,content,topic,status,author_label,reactions,created_at', { count: 'exact' })
      .eq('status', 'public')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (topic) {
      query = query.eq('topic', topic);
    }

    const { data, error, count } = await query;
    if (error) {
      throw new ApiError(500, error.message, 'SUPABASE_SELECT_FAILED');
    }

    return res.status(200).json({
      posts: ((data ?? []) as DbPost[]).map(mapPost),
      total: count ?? 0,
      hasMore: offset + limit < (count ?? 0),
    });
  })
);

router.get(
  '/flagged',
  verifyToken,
  requireRole('admin'),
  asyncRoute(async (_req, res) => {
    const { data, error } = await supabase
      .from('posts')
      .select('id,author_id,content,topic,status,author_label,reactions,created_at')
      .eq('status', 'flagged')
      .order('created_at', { ascending: false });

    if (error) {
      throw new ApiError(500, error.message, 'SUPABASE_SELECT_FAILED');
    }

    return res.status(200).json({
      posts: ((data ?? []) as DbPost[]).map(mapPostWithStatus),
    });
  })
);

router.post(
  '/',
  verifyToken,
  asyncRoute(async (req, res) => {
    const auth = (req as AuthRequest).user!;
    const { content, topic: rawTopic } = req.body as Record<string, unknown>;
    const cleanContent = typeof content === 'string' ? content.trim() : '';
    const topic = asTopic(rawTopic);

    if (!isNonEmptyString(cleanContent) || cleanContent.length > 500) {
      return sendError(res, 400, 'Content bat buoc tu 1 den 500 ky tu', 'INVALID_CONTENT');
    }

    if (!topic) {
      return sendError(res, 400, 'Topic khong hop le', 'INVALID_TOPIC');
    }

    let moderation: ModerationResult;
    try {
      moderation = await runModeration(cleanContent);
    } catch (error) {
      console.error('AI moderation failed:', error);
      moderation = {
        verdict: 'flagged',
        triggerSOS: false,
        reason: 'AI moderation tam thoi khong kha dung, can admin xem xet.',
      };
    }

    if (moderation.verdict === 'blocked') {
      return res.status(400).json({
        message: 'Noi dung khong phu hop tieu chuan cong dong',
        code: 'CONTENT_BLOCKED',
        triggerSOS: moderation.triggerSOS,
        reason: moderation.reason,
      });
    }

    const status = moderation.verdict === 'flagged' || moderation.triggerSOS ? 'flagged' : 'public';
    const { data, error } = await supabase
      .from('posts')
      .insert({
        author_id: auth.userId,
        content: cleanContent,
        topic,
        status,
        author_label: 'An danh',
        reactions: DEFAULT_REACTIONS,
      })
      .select('id,author_id,content,topic,status,author_label,reactions,created_at')
      .single();

    if (error || !data) {
      throw new ApiError(500, error?.message || 'Khong the tao post', 'SUPABASE_INSERT_FAILED');
    }

    return res.status(201).json({
      ...mapPostWithStatus(data as DbPost),
      triggerSOS: moderation.triggerSOS,
    });
  })
);

router.post(
  '/:id/react',
  verifyToken,
  asyncRoute(async (req, res) => {
    const auth = (req as AuthRequest).user!;
    const reaction = asReaction((req.body as Record<string, unknown>).reaction);

    if (!reaction) {
      return sendError(res, 400, 'Reaction khong hop le', 'INVALID_REACTION');
    }

    const { data: postData, error: postError } = await supabase
      .from('posts')
      .select('id,reactions')
      .eq('id', req.params.id)
      .single();

    if (postError || !postData) {
      throw new ApiError(404, 'Khong tim thay post', 'POST_NOT_FOUND');
    }

    const { data: existingData, error: existingError } = await supabase
      .from('post_reactions')
      .select('id,reaction_type')
      .eq('post_id', req.params.id)
      .eq('user_id', auth.userId)
      .maybeSingle();

    if (existingError) {
      throw new ApiError(500, existingError.message, 'SUPABASE_SELECT_FAILED');
    }

    const reactions = normalizeReactions((postData as Pick<DbPost, 'reactions'>).reactions);
    let userReaction: ReactionType | null = reaction;

    if (existingData?.reaction_type === reaction) {
      const { error } = await supabase.from('post_reactions').delete().eq('id', existingData.id);
      if (error) throw new ApiError(500, error.message, 'SUPABASE_DELETE_FAILED');
      reactions[reaction] = Math.max(0, reactions[reaction] - 1);
      userReaction = null;
    } else if (existingData) {
      const oldReaction = existingData.reaction_type as ReactionType;
      const { error } = await supabase
        .from('post_reactions')
        .update({ reaction_type: reaction })
        .eq('id', existingData.id);
      if (error) throw new ApiError(500, error.message, 'SUPABASE_UPDATE_FAILED');
      reactions[oldReaction] = Math.max(0, reactions[oldReaction] - 1);
      reactions[reaction] += 1;
    } else {
      const { error } = await supabase.from('post_reactions').insert({
        post_id: req.params.id,
        user_id: auth.userId,
        reaction_type: reaction,
      });
      if (error) throw new ApiError(500, error.message, 'SUPABASE_INSERT_FAILED');
      reactions[reaction] += 1;
    }

    const { error: updateError } = await supabase.from('posts').update({ reactions }).eq('id', req.params.id);
    if (updateError) {
      throw new ApiError(500, updateError.message, 'SUPABASE_UPDATE_FAILED');
    }

    return res.status(200).json({ reactions, userReaction });
  })
);

router.patch(
  '/:id/status',
  verifyToken,
  requireRole('admin'),
  asyncRoute(async (req, res) => {
    const status = asPostStatus((req.body as Record<string, unknown>).status);

    if (!status || status === 'flagged') {
      return sendError(res, 400, 'Status chi duoc la public hoac hidden', 'INVALID_STATUS');
    }

    const { data, error } = await supabase
      .from('posts')
      .update({ status })
      .eq('id', req.params.id)
      .select('id,status')
      .single();

    if (error || !data) {
      throw new ApiError(404, 'Khong tim thay post', 'POST_NOT_FOUND');
    }

    return res.status(200).json(data);
  })
);

export default router;
