import type { NextFunction, Request, Response } from 'express';
import { ApiError, sendError } from '../lib/http';

export function notFoundHandler(req: Request, res: Response) {
  return sendError(res, 404, `Khong tim thay endpoint ${req.method} ${req.path}`, 'NOT_FOUND');
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ApiError) {
    return sendError(res, error.statusCode, error.message, error.code);
  }

  console.error(error);
  return sendError(res, 500, 'Loi server', 'SERVER_ERROR');
}
