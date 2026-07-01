import { Router } from 'express';
import {
  acceptConversationController,
  closeConversationController,
  createConversationController,
  getConversationQueueController,
  transferConversationController,
  listMyConversationsController,
  deleteConversationController,
} from '../controllers/conversations.controller';
import { requireRole, verifyToken } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { conversationIdRouteSchema } from '../validations/conversations.validation';

const router = Router();

router.use(verifyToken);

router.post('/', requireRole('user'), createConversationController);
router.get('/me', requireRole('user'), listMyConversationsController);
router.get('/queue', requireRole('healer'), getConversationQueueController);
router.patch(
  '/:id/accept',
  requireRole('healer'),
  validate(
    { params: conversationIdRouteSchema },
    {
      code: 'INVALID_CONVERSATION_ID',
      message: 'ConversationId khong hop le',
    }
  ),
  acceptConversationController
);
router.patch(
  '/:id/close',
  validate(
    { params: conversationIdRouteSchema },
    {
      code: 'INVALID_CONVERSATION_ID',
      message: 'ConversationId khong hop le',
    }
  ),
  closeConversationController
);
router.post(
  '/:id/transfer',
  requireRole('healer'),
  validate(
    { params: conversationIdRouteSchema },
    {
      code: 'INVALID_CONVERSATION_ID',
      message: 'ConversationId khong hop le',
    }
  ),
  transferConversationController
);
router.delete(
  '/:id',
  validate(
    { params: conversationIdRouteSchema },
    {
      code: 'INVALID_CONVERSATION_ID',
      message: 'ConversationId khong hop le',
    }
  ),
  deleteConversationController
);

export default router;
