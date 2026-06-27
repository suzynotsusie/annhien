import type { NextFunction, Request, Response } from 'express';
import { verifyAuthToken } from '../utils/jwt';
import { sendError } from '../utils/response';
import type { AuthUser, UserRole } from '../types/domain';

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

/**
 * @param req Incoming HTTP request.
 * @param res Express response object.
 * @param next Next middleware callback.
 * @returns Nothing.
 */
export function verifyToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return sendError(res, 401, 'Chua dang nhap', 'UNAUTHORIZED');
  }

  try {
    req.user = verifyAuthToken(authHeader.slice(7));
    return next();
  } catch {
    return sendError(res, 401, 'Token khong hop le hoac da het han', 'INVALID_TOKEN');
  }
}

/**
 * @param roles Allowed roles for the current route.
 * @returns Express middleware that enforces role-based access control.
 */
export function requireRole(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, 403, 'Khong co quyen truy cap', 'FORBIDDEN');
    }

    return next();
  };
}
