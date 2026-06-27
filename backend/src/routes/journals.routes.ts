import { Router } from 'express';
import { ApiError, asyncRoute, parsePagination, sendError } from '../lib/http';
import { mapJournal, mapJournalMeta } from '../lib/mappers';
import { supabase } from '../lib/supabase';
import { asMood, isNonEmptyString } from '../lib/validation';
import { verifyToken, type AuthRequest } from '../middleware/auth';
import type { DbJournal } from '../types/domain';

const router = Router();

router.use(verifyToken);

router.post(
  '/',
  asyncRoute(async (req, res) => {
    const auth = (req as AuthRequest).user!;
    const { encryptedContent, mood: rawMood } = req.body as Record<string, unknown>;
    const mood = asMood(rawMood);

    if (!isNonEmptyString(encryptedContent)) {
      return sendError(res, 400, 'encryptedContent la bat buoc', 'INVALID_ENCRYPTED_CONTENT');
    }

    if (!mood) {
      return sendError(res, 400, 'Mood khong hop le', 'INVALID_MOOD');
    }

    const { data, error } = await supabase
      .from('journals')
      .insert({
        user_id: auth.userId,
        encrypted_content: encryptedContent.trim(),
        mood,
      })
      .select('id,mood,created_at')
      .single();

    if (error || !data) {
      throw new ApiError(500, error?.message || 'Khong the luu journal', 'SUPABASE_INSERT_FAILED');
    }

    return res.status(201).json(mapJournalMeta(data as Pick<DbJournal, 'id' | 'mood' | 'created_at'>));
  })
);

router.get(
  '/me',
  asyncRoute(async (req, res) => {
    const auth = (req as AuthRequest).user!;
    const { limit, offset } = parsePagination(req.query, { limit: 30, offset: 0 });

    const { data, error, count } = await supabase
      .from('journals')
      .select('id,mood,created_at', { count: 'exact' })
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new ApiError(500, error.message, 'SUPABASE_SELECT_FAILED');
    }

    return res.status(200).json({
      journals: ((data ?? []) as Pick<DbJournal, 'id' | 'mood' | 'created_at'>[]).map(mapJournalMeta),
      total: count ?? 0,
    });
  })
);

router.get(
  '/:id',
  asyncRoute(async (req, res) => {
    const auth = (req as AuthRequest).user!;
    const { data, error } = await supabase
      .from('journals')
      .select('id,user_id,encrypted_content,mood,created_at')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      throw new ApiError(404, 'Khong tim thay journal', 'JOURNAL_NOT_FOUND');
    }

    const journal = data as DbJournal;
    if (journal.user_id !== auth.userId) {
      return sendError(res, 403, 'Journal khong thuoc user nay', 'JOURNAL_FORBIDDEN');
    }

    return res.status(200).json(mapJournal(journal));
  })
);

export default router;
