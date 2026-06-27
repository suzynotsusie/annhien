import { Router } from 'express';
import { aiChatController, aiModerationController, aiTriageController } from '../controllers/ai.controller';
import { verifyToken } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { aiChatBodySchema, aiModerationBodySchema, aiTriageBodySchema } from '../validations/ai.validation';

const router = Router();

router.use(verifyToken);

router.post(
  '/chat',
  validate(
    { body: aiChatBodySchema },
    {
      codeByPath: {
        personaId: 'INVALID_PERSONA_ID',
        userMessage: 'INVALID_USER_MESSAGE',
      },
      messageByPath: {
        personaId: 'PersonaId khong hop le',
        userMessage: 'userMessage la bat buoc',
      },
    }
  ),
  aiChatController
);
router.post(
  '/triage',
  validate(
    { body: aiTriageBodySchema },
    {
      code: 'INVALID_PLAIN_TEXT',
      message: 'plainText la bat buoc',
    }
  ),
  aiTriageController
);
router.post(
  '/moderation',
  validate(
    { body: aiModerationBodySchema },
    {
      code: 'INVALID_CONTENT',
      message: 'content la bat buoc',
    }
  ),
  aiModerationController
);

export default router;
