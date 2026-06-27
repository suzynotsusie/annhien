import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { sendError } from '../lib/http';
import type { AuthUser, UserRole } from '../types/domain';

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return sendError(res, 401, 'Chua dang nhap', 'UNAUTHORIZED');
  }

  try {
    const decoded = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET || '') as AuthUser;
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      nickname: decoded.nickname,
    };
    return next();
  } catch {
    return sendError(res, 401, 'Token khong hop le hoac da het han', 'INVALID_TOKEN');
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, 403, 'Khong co quyen truy cap', 'FORBIDDEN');
    }

    return next();
  };
}
