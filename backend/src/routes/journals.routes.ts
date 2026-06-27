import { Router } from 'express';
import {
  createJournalController,
  getJournalByIdController,
  listMyJournalsController,
} from '../controllers/journals.controller';
import { verifyToken } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createJournalBodySchema,
  journalIdParamSchema,
  journalListQuerySchema,
} from '../validations/journals.validation';

const router = Router();

router.use(verifyToken);

router.post(
  '/',
  validate(
    { body: createJournalBodySchema },
    {
      codeByPath: {
        encryptedContent: 'INVALID_ENCRYPTED_CONTENT',
        mood: 'INVALID_MOOD',
      },
      messageByPath: {
        encryptedContent: 'encryptedContent la bat buoc',
        mood: 'Mood khong hop le',
      },
    }
  ),
  createJournalController
);
router.get('/me', validate({ query: journalListQuerySchema }), listMyJournalsController);
router.get(
  '/:id',
  validate(
    { params: journalIdParamSchema },
    {
      code: 'INVALID_JOURNAL_ID',
      message: 'JournalId khong hop le',
    }
  ),
  getJournalByIdController
);

export default router;
