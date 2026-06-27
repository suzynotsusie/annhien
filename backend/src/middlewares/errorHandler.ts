import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ApiError, buildErrorPayload, mapZodIssues } from '../utils/app-error';
import { logError } from '../utils/logger';

/**
 * @param req Incoming request.
 * @param res Express response object.
 * @returns 404 JSON response for unknown endpoints.
 */
export function notFoundHandler(req: Request, res: Response) {
  const error = new ApiError(404, `Khong tim thay endpoint ${req.method} ${req.path}`, 'NOT_FOUND');
  return res.status(404).json(buildErrorPayload(error));
}

/**
 * @param error Unknown error thrown anywhere in the request lifecycle.
 * @param _req Incoming request.
 * @param res Express response object.
 * @param _next Next middleware callback.
 * @returns Standardized JSON error response.
 */
export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    const apiError = new ApiError(400, 'Du lieu gui len khong hop le', 'VALIDATION_ERROR', mapZodIssues(error));
    return res.status(apiError.statusCode).json(buildErrorPayload(apiError));
  }

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json(buildErrorPayload(error));
  }

  const message = error instanceof Error ? error.message : 'Unknown server error';
  logError('Unhandled backend error', { message });
  const apiError = new ApiError(500, 'Loi server', 'SERVER_ERROR');
  return res.status(500).json(buildErrorPayload(apiError));
}
