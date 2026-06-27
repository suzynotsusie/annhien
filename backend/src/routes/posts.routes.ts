import { Router } from 'express';
import {
  createPostController,
  listFlaggedPostsController,
  listPostsController,
  reactToPostController,
  updatePostStatusController,
} from '../controllers/posts.controller';
import { requireRole, verifyToken } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createPostBodySchema,
  listPostsQuerySchema,
  postIdParamSchema,
  reactToPostBodySchema,
  updatePostStatusBodySchema,
} from '../validations/posts.validation';

const router = Router();

router.get(
  '/',
  validate(
    { query: listPostsQuerySchema },
    {
      codeByPath: { topic: 'INVALID_TOPIC' },
      messageByPath: { topic: 'Topic khong hop le' },
    }
  ),
  listPostsController
);
router.get('/flagged', verifyToken, requireRole('admin'), listFlaggedPostsController);
router.post(
  '/',
  verifyToken,
  validate(
    { body: createPostBodySchema },
    {
      codeByPath: {
        content: 'INVALID_CONTENT',
        topic: 'INVALID_TOPIC',
      },
      messageByPath: {
        content: 'Content bat buoc tu 1 den 500 ky tu',
        topic: 'Topic khong hop le',
      },
    }
  ),
  createPostController
);
router.post(
  '/:id/react',
  verifyToken,
  validate(
    { params: postIdParamSchema, body: reactToPostBodySchema },
    {
      codeByPath: {
        id: 'INVALID_POST_ID',
        reaction: 'INVALID_REACTION',
      },
      messageByPath: {
        id: 'PostId khong hop le',
        reaction: 'Reaction khong hop le',
      },
    }
  ),
  reactToPostController
);
router.patch(
  '/:id/status',
  verifyToken,
  requireRole('admin'),
  validate(
    { params: postIdParamSchema, body: updatePostStatusBodySchema },
    {
      codeByPath: {
        id: 'INVALID_POST_ID',
        status: 'INVALID_STATUS',
      },
      messageByPath: {
        id: 'PostId khong hop le',
        status: 'Status chi duoc la public hoac hidden',
      },
    }
  ),
  updatePostStatusController
);

export default router;
