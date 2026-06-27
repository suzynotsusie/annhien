import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth';
import {
  createPost,
  listFlaggedPosts,
  listPublicPosts,
  reactToPost,
  updatePostStatus,
} from '../services/posts.service';
import type {
  CreatePostBody,
  ListPostsQuery,
  PostIdParams,
  ReactToPostBody,
  UpdatePostStatusBody,
} from '../validations/posts.validation';

/**
 * @param req Incoming request.
 * @param res Express response object.
 * @returns Public post feed.
 */
export async function listPostsController(req: Request, res: Response) {
  const payload = await listPublicPosts(req.query as ListPostsQuery);
  return res.status(200).json(payload);
}

/**
 * @param _req Incoming request.
 * @param res Express response object.
 * @returns Flagged posts for admins.
 */
export async function listFlaggedPostsController(_req: AuthenticatedRequest, res: Response) {
  const payload = await listFlaggedPosts();
  return res.status(200).json(payload);
}

/**
 * @param req Authenticated request.
 * @param res Express response object.
 * @returns Created post payload.
 */
export async function createPostController(req: AuthenticatedRequest, res: Response) {
  const payload = await createPost(req.user!.userId, req.body as CreatePostBody);
  return res.status(201).json(payload);
}

/**
 * @param req Authenticated request.
 * @param res Express response object.
 * @returns Updated reaction counters.
 */
export async function reactToPostController(req: AuthenticatedRequest, res: Response) {
  const params = req.params as PostIdParams;
  const payload = await reactToPost(req.user!.userId, params.id, req.body as ReactToPostBody);
  return res.status(200).json(payload);
}

/**
 * @param req Authenticated request.
 * @param res Express response object.
 * @returns Minimal updated status payload.
 */
export async function updatePostStatusController(req: AuthenticatedRequest, res: Response) {
  const params = req.params as PostIdParams;
  const payload = await updatePostStatus(params.id, req.body as UpdatePostStatusBody);
  return res.status(200).json(payload);
}
