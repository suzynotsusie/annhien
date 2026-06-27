import type { Response } from 'express';
import { ApiError, buildErrorPayload } from './app-error';

/**
 * @param res Express response object.
 * @param statusCode HTTP status code to send.
 * @param message Human-readable error message.
 * @param code Stable machine-readable error code.
 * @param details Optional structured metadata for the client.
 * @returns Express response with the standardized error body.
 */
export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  code: string,
  details?: unknown
) {
  const error = new ApiError(statusCode, message, code, details);
  return res.status(statusCode).json(buildErrorPayload(error));
}
