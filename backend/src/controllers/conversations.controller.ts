import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth';
import {
  acceptConversation,
  closeConversation,
  createConversation,
  getConversationQueue,
  transferConversation,
  listMyConversations,
} from '../services/conversations.service';

export async function listMyConversationsController(req: AuthenticatedRequest, res: Response) {
  const payload = await listMyConversations(req.user!.userId);
  return res.status(200).json(payload);
}
import type { ConversationIdRouteParams } from '../validations/conversations.validation';

/**
 * @param req Authenticated request.
 * @param res Express response object.
 * @returns Newly created waiting conversation.
 */
export async function createConversationController(req: AuthenticatedRequest, res: Response) {
  const payload = await createConversation(req.user!.userId);
  return res.status(201).json(payload);
}

/**
 * @param _req Authenticated request.
 * @param res Express response object.
 * @returns Waiting queue for healers.
 */
export async function getConversationQueueController(_req: AuthenticatedRequest, res: Response) {
  const payload = await getConversationQueue();
  return res.status(200).json(payload);
}

/**
 * @param req Authenticated request.
 * @param res Express response object.
 * @returns Accepted conversation payload.
 */
export async function acceptConversationController(req: AuthenticatedRequest, res: Response) {
  const params = req.params as ConversationIdRouteParams;
  const payload = await acceptConversation(params.id, req.user!);
  return res.status(200).json(payload);
}

/**
 * @param req Authenticated request.
 * @param res Express response object.
 * @returns Closed conversation payload.
 */
export async function closeConversationController(req: AuthenticatedRequest, res: Response) {
  const params = req.params as ConversationIdRouteParams;
  const payload = await closeConversation(params.id, req.user!);
  return res.status(200).json(payload);
}

/**
 * @param req Authenticated request.
 * @param res Express response object.
 * @returns Transfer payload after sending the case back to the queue.
 */
export async function transferConversationController(req: AuthenticatedRequest, res: Response) {
  const params = req.params as ConversationIdRouteParams;
  const payload = await transferConversation(params.id, req.user!);
  return res.status(200).json(payload);
}
