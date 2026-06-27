import { Router } from 'express';
import { createVideoController, listVideosController } from '../controllers/videos.controller';
import { requireRole, verifyToken } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createVideoBodySchema, listVideosQuerySchema } from '../validations/videos.validation';

const router = Router();

router.get(
  '/',
  validate(
    { query: listVideosQuerySchema },
    {
      codeByPath: { topic: 'INVALID_TOPIC' },
      messageByPath: { topic: 'Topic khong hop le' },
    }
  ),
  listVideosController
);
router.post(
  '/',
  verifyToken,
  requireRole('doctor'),
  validate(
    { body: createVideoBodySchema },
    {
      codeByPath: {
        title: 'INVALID_TITLE',
        topic: 'INVALID_TOPIC',
        videoUrl: 'INVALID_VIDEO_URL',
        description: 'INVALID_DESCRIPTION',
      },
      messageByPath: {
        title: 'Title la bat buoc',
        topic: 'Topic khong hop le',
        videoUrl: 'videoUrl la bat buoc',
        description: 'Description khong hop le',
      },
    }
  ),
  createVideoController
);

export default router;
