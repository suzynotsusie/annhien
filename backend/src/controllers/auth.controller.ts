import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth';
import { getCurrentUser, loginStaffUser, setupAnonymousUser, updateCurrentUserStatus } from '../services/auth.service';
import type { AuthLoginBody, AuthSetupBody, AuthStatusBody } from '../validations/auth.validation';

/**
 * @param req Incoming setup request.
 * @param res Express response object.
 * @returns Newly created anonymous account payload.
 */
export async function setupAuthController(req: Request, res: Response) {
  const payload = await setupAnonymousUser(req.body as AuthSetupBody);
  return res.status(201).json(payload);
}

/**
 * @param req Incoming staff login request.
 * @param res Express response object.
 * @returns Staff auth payload.
 */
export async function loginAuthController(req: Request, res: Response) {
  const payload = await loginStaffUser(req.body as AuthLoginBody);
  return res.status(200).json(payload);
}

/**
 * @param req Authenticated request.
 * @param res Express response object.
 * @returns Current user profile.
 */
export async function getMeController(req: AuthenticatedRequest, res: Response) {
  const payload = await getCurrentUser(req.user!.userId);
  return res.status(200).json(payload);
}

/**
 * @param req Authenticated staff request.
 * @param res Express response object.
 * @returns Updated user status payload.
 */
export async function updateStatusController(req: AuthenticatedRequest, res: Response) {
  const body = req.body as AuthStatusBody;
  const payload = await updateCurrentUserStatus(req.user!.userId, body.status);
  return res.status(200).json(payload);
}
