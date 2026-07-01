import { mapJournal, mapJournalMeta } from '../lib/mappers';
import { createLocalId, createTimestamp, localStore } from '../lib/local-store';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { ApiError } from '../utils/app-error';
import type { DbJournal } from '../types/domain';
import type { CreateJournalBody, JournalListQuery } from '../validations/journals.validation';

/**
 * @param userId Authenticated user id.
 * @param input Validated journal creation payload.
 * @returns Created journal metadata in API shape.
 */
export async function createJournal(userId: string, input: CreateJournalBody) {
  let journal: DbJournal;

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('journals')
      .insert({
        user_id: userId,
        encrypted_content: input.encryptedContent,
        mood: input.mood,
      })
      .select('id,user_id,encrypted_content,mood,created_at')
      .single();

    if (error || !data) {
      throw new ApiError(500, error?.message || 'Khong the luu journal', 'SUPABASE_INSERT_FAILED');
    }

    journal = data as DbJournal;
  } else {
    journal = {
      id: createLocalId('journal'),
      user_id: userId,
      encrypted_content: input.encryptedContent,
      mood: input.mood,
      created_at: createTimestamp(),
    };
    localStore.journals.push(journal);
  }

  return mapJournalMeta(journal);
}

/**
 * @param userId Authenticated user id.
 * @param query Validated pagination query.
 * @returns Paginated journal metadata for the current user.
 */
export async function listMyJournals(userId: string, query: JournalListQuery) {
  const limit = query.limit ?? 30;
  const offset = query.offset ?? 0;

  if (isSupabaseConfigured) {
    const { data, error, count } = await supabase
      .from('journals')
      .select('id,user_id,encrypted_content,mood,created_at', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new ApiError(500, error.message, 'SUPABASE_SELECT_FAILED');
    }

    const journals = ((data ?? []) as DbJournal[]).map(mapJournalMeta);
    return {
      journals,
      total: count ?? 0,
    };
  }

  const rows = localStore.journals
    .filter((journal) => journal.user_id === userId)
    .sort((left, right) => right.created_at.localeCompare(left.created_at));

  return {
    journals: rows.slice(offset, offset + limit).map(mapJournalMeta),
    total: rows.length,
  };
}

/**
 * @param userId Authenticated user id.
 * @param journalId Requested journal id.
 * @returns Full journal payload for the owner.
 */
export async function getJournalById(userId: string, journalId: string) {
  const journal = isSupabaseConfigured
    ? await findSupabaseJournalById(userId, journalId)
    : localStore.journals.find((item) => item.id === journalId) || null;

  if (!journal) {
    throw new ApiError(404, 'Khong tim thay nhat ky', 'JOURNAL_NOT_FOUND');
  }

  return mapJournal(journal);
}

export async function deleteJournal(userId: string, journalId: string) {
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('journals')
      .delete()
      .eq('id', journalId)
      .eq('user_id', userId);

    if (error) {
      throw new ApiError(500, error.message, 'SUPABASE_DELETE_FAILED');
    }
  } else {
    const index = localStore.journals.findIndex((item) => item.id === journalId && item.user_id === userId);
    if (index === -1) {
      throw new ApiError(404, 'Khong tim thay nhat ky', 'JOURNAL_NOT_FOUND');
    }
    localStore.journals.splice(index, 1);
  }

  return { success: true };
}

/**
 * @param userId User id.
 * @param journalId Journal id.
 * @returns Matching Supabase journal or null.
 */
async function findSupabaseJournalById(userId: string, journalId: string): Promise<DbJournal | null> {
  const { data, error } = await supabase
    .from('journals')
    .select('id,user_id,encrypted_content,mood,created_at')
    .eq('id', journalId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, error.message, 'SUPABASE_SELECT_FAILED');
  }

  return (data as DbJournal | null) ?? null;
}
