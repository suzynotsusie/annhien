import type { Request, Response } from 'express';
import { ApiError } from '../utils/app-error';
import { assertPersonaId, generatePersonaReply, runModeration, runTriage } from '../services/ai.service';
import type { AiChatBody, AiModerationBody, AiTriageBody } from '../validations/ai.validation';

/**
 * @param req Incoming request.
 * @param res Express response object.
 * @returns Persona-based AI reply.
 */
export async function aiChatController(req: Request, res: Response) {
  const body = req.body as AiChatBody;
  const personaId = assertPersonaId(body.personaId);

  if (!personaId) {
    throw new ApiError(400, 'PersonaId khong hop le', 'INVALID_PERSONA_ID');
  }

  const payload = await generatePersonaReply(personaId, body.userMessage, body.history ?? []);
  return res.status(200).json(payload);
}

/**
 * @param req Incoming request.
 * @param res Express response object.
 * @returns Triage analysis payload.
 */
export async function aiTriageController(req: Request, res: Response) {
  const body = req.body as AiTriageBody;
  const payload = await runTriage(body.plainText);
  return res.status(200).json(payload);
}

/**
 * @param req Incoming request.
 * @param res Express response object.
 * @returns Moderation payload.
 */
export async function aiModerationController(req: Request, res: Response) {
  const body = req.body as AiModerationBody;
  const payload = await runModeration(body.content);
  return res.status(200).json(payload);
}
