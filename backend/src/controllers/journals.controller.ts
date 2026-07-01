import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth';
import { createJournal, getJournalById, listMyJournals, deleteJournal } from '../services/journals.service';
import type { CreateJournalBody, JournalIdParams, JournalListQuery } from '../validations/journals.validation';

/**
 * @param req Authenticated request.
 * @param res Express response object.
 * @returns Created journal metadata.
 */
export async function createJournalController(req: AuthenticatedRequest, res: Response) {
  const payload = await createJournal(req.user!.userId, req.body as CreateJournalBody);
  return res.status(201).json(payload);
}

/**
 * @param req Authenticated request.
 * @param res Express response object.
 * @returns Current user's journal list.
 */
export async function listMyJournalsController(req: AuthenticatedRequest, res: Response) {
  const payload = await listMyJournals(req.user!.userId, req.query as JournalListQuery);
  return res.status(200).json(payload);
}

export async function deleteJournalController(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params as JournalIdParams;
  await deleteJournal(req.user!.userId, id);
  return res.status(200).json({ success: true });
}

/**
 * @param req Authenticated request.
 * @param res Express response object.
 * @returns Full journal payload for the owner.
 */
export async function getJournalByIdController(req: AuthenticatedRequest, res: Response) {
  const params = req.params as JournalIdParams;
  const payload = await getJournalById(req.user!.userId, params.id);
  return res.status(200).json(payload);
}
