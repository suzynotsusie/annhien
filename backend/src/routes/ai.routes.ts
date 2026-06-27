import { Router } from 'express';
import { asyncRoute, sendError } from '../lib/http';
import { isNonEmptyString } from '../lib/validation';
import { verifyToken } from '../middleware/auth';
import { assertPersonaId, generatePersonaReply, runModeration, runTriage } from '../services/ai.service';
import type { AiHistoryItem } from '../types/domain';

const router = Router();

router.use(verifyToken);

function sanitizeHistory(value: unknown): AiHistoryItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Record<string, unknown> => item && typeof item === 'object')
    .map((item): AiHistoryItem => ({
      role: item.role === 'model' ? 'model' : 'user',
      content: typeof item.content === 'string' ? item.content : '',
    }))
    .filter((item) => item.content.trim().length > 0)
    .slice(-20);
}

router.post(
  '/chat',
  asyncRoute(async (req, res) => {
    const { personaId, userMessage, history } = req.body as Record<string, unknown>;
    const safePersonaId = assertPersonaId(personaId);
    const cleanMessage = typeof userMessage === 'string' ? userMessage.trim() : '';

    if (!safePersonaId) {
      return sendError(res, 400, 'PersonaId khong hop le', 'INVALID_PERSONA_ID');
    }

    if (!isNonEmptyString(cleanMessage)) {
      return sendError(res, 400, 'userMessage la bat buoc', 'INVALID_USER_MESSAGE');
    }

    const reply = await generatePersonaReply(safePersonaId, cleanMessage, sanitizeHistory(history));
    return res.status(200).json(reply);
  })
);

router.post(
  '/triage',
  asyncRoute(async (req, res) => {
    const { plainText } = req.body as Record<string, unknown>;
    const cleanText = typeof plainText === 'string' ? plainText.trim() : '';

    if (!isNonEmptyString(cleanText)) {
      return sendError(res, 400, 'plainText la bat buoc', 'INVALID_PLAIN_TEXT');
    }

    const result = await runTriage(cleanText);
    return res.status(200).json(result);
  })
);

router.post(
  '/moderation',
  asyncRoute(async (req, res) => {
    const { content } = req.body as Record<string, unknown>;
    const cleanContent = typeof content === 'string' ? content.trim() : '';

    if (!isNonEmptyString(cleanContent)) {
      return sendError(res, 400, 'content la bat buoc', 'INVALID_CONTENT');
    }

    const result = await runModeration(cleanContent);
    return res.status(200).json(result);
  })
);

export default router;
