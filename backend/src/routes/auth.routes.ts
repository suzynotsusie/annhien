import { Router } from 'express';
import {
  getMeController,
  loginAuthController,
  setupAuthController,
  updateStatusController,
} from '../controllers/auth.controller';
import { requireRole, verifyToken } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  authLoginBodySchema,
  authSetupBodySchema,
  authStatusBodySchema,
} from '../validations/auth.validation';

const router = Router();

router.post(
  '/setup',
  validate(
    { body: authSetupBodySchema },
    {
      codeByPath: {
        nickname: 'INVALID_NICKNAME',
        topics: 'INVALID_TOPICS',
      },
      messageByPath: {
        nickname: 'Nickname bat buoc tu 1 den 50 ky tu',
        topics: 'Topics phai la mang string',
      },
    }
  ),
  setupAuthController
);
router.post(
  '/login',
  validate(
    { body: authLoginBodySchema },
    {
      code: 'INVALID_LOGIN_PAYLOAD',
      message: 'Username va password la bat buoc',
    }
  ),
  loginAuthController
);
router.get('/me', verifyToken, getMeController);
router.patch(
  '/status',
  verifyToken,
  requireRole('healer', 'doctor'),
  validate(
    { body: authStatusBodySchema },
    {
      code: 'INVALID_STATUS',
      message: 'Status khong hop le',
    }
  ),
  updateStatusController
);

export default router;
