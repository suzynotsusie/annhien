import { Router } from 'express';
import { createVideoController, listVideosController, listPendingVideosController, updateVideoStatusController } from '../controllers/videos.controller';
import { requireRole, verifyToken } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createVideoBodySchema, listVideosQuerySchema, updateVideoStatusBodySchema } from '../validations/videos.validation';
import { entityIdParamSchema } from '../validations/shared.validation';

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

router.get(
  '/pending',
  verifyToken,
  requireRole('admin', 'doctor'),
  listPendingVideosController
);

router.patch(
  '/:id/status',
  verifyToken,
  requireRole('admin'),
  validate(
    { params: entityIdParamSchema, body: updateVideoStatusBodySchema },
    {
      codeByPath: {
        id: 'INVALID_VIDEO_ID',
        status: 'INVALID_STATUS',
      },
      messageByPath: {
        id: 'Video ID khong hop le',
        status: 'Trang thai khong hop le',
      },
    }
  ),
  updateVideoStatusController
);

export default router;
