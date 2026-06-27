import type { NextFunction, Request, RequestHandler, Response } from 'express';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code = 'SERVER_ERROR'
  ) {
    super(message);
  }
}

export function sendError(res: Response, statusCode: number, message: string, code: string) {
  return res.status(statusCode).json({ message, code });
}

export function asyncRoute(handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export function parsePagination(query: Record<string, unknown>, defaults = { limit: 20, offset: 0 }) {
  const rawLimit = Number(query.limit ?? defaults.limit);
  const rawOffset = Number(query.offset ?? defaults.offset);
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.floor(rawLimit), 1), 100) : defaults.limit;
  const offset = Number.isFinite(rawOffset) ? Math.max(Math.floor(rawOffset), 0) : defaults.offset;
  return { limit, offset };
}
