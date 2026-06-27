import { Router } from 'express';
import { createMessageController, listMessagesController } from '../controllers/messages.controller';
import { verifyToken } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createMessageBodySchema,
  listMessagesParamsSchema,
  listMessagesQuerySchema,
} from '../validations/messages.validation';

const router = Router();

router.use(verifyToken);

router.post(
  '/',
  validate(
    { body: createMessageBodySchema },
    {
      codeByPath: {
        conversationId: 'INVALID_CONVERSATION_ID',
        content: 'INVALID_CONTENT',
        personaId: 'INVALID_PERSONA_ID',
      },
      messageByPath: {
        conversationId: 'conversationId la bat buoc',
        content: 'Content bat buoc tu 1 den 2000 ky tu',
        personaId: 'PersonaId khong hop le',
      },
    }
  ),
  createMessageController
);
router.get(
  '/:conversationId',
  validate(
    { params: listMessagesParamsSchema, query: listMessagesQuerySchema },
    {
      codeByPath: {
        conversationId: 'INVALID_CONVERSATION_ID',
        before: 'INVALID_BEFORE_CURSOR',
      },
      messageByPath: {
        conversationId: 'conversationId la bat buoc',
        before: 'before khong hop le',
      },
    }
  ),
  listMessagesController
);

export default router;
