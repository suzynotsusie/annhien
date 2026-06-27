import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth';
import { createVideo, listApprovedVideos, listPendingVideos, updateVideoStatus } from '../services/videos.service';
import type { CreateVideoBody, ListVideosQuery, UpdateVideoStatusBody } from '../validations/videos.validation';

export async function listPendingVideosController(_req: AuthenticatedRequest, res: Response) {
  const payload = await listPendingVideos();
  return res.status(200).json(payload);
}

export async function updateVideoStatusController(req: AuthenticatedRequest, res: Response) {
  const params = req.params as { id: string };
  const payload = await updateVideoStatus(params.id, (req.body as UpdateVideoStatusBody).status);
  return res.status(200).json(payload);
}

/**
 * @param req Incoming request.
 * @param res Express response object.
 * @returns Approved video list.
 */
export async function listVideosController(req: Request, res: Response) {
  const payload = await listApprovedVideos(req.query as ListVideosQuery);
  return res.status(200).json(payload);
}

/**
 * @param req Authenticated doctor request.
 * @param res Express response object.
 * @returns Newly created video payload.
 */
export async function createVideoController(req: AuthenticatedRequest, res: Response) {
  const payload = await createVideo(req.user!.userId, req.body as CreateVideoBody);
  return res.status(201).json(payload);
}
