import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth';
import { createMessage, listMessages } from '../services/messages.service';
import type { CreateMessageBody, ListMessagesParams, ListMessagesQuery } from '../validations/messages.validation';

/**
 * @param req Authenticated request.
 * @param res Express response object.
 * @returns Created message payload.
 */
export async function createMessageController(req: AuthenticatedRequest, res: Response) {
  const payload = await createMessage(req.user!, req.body as CreateMessageBody);
  return res.status(201).json(payload);
}

/**
 * @param req Authenticated request.
 * @param res Express response object.
 * @returns Paginated message history.
 */
export async function listMessagesController(req: AuthenticatedRequest, res: Response) {
  const params = req.params as ListMessagesParams;
  const payload = await listMessages(req.user!, params.conversationId, req.query as ListMessagesQuery);
  return res.status(200).json(payload);
}
