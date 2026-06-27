import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodType } from 'zod';
import { ApiError, mapZodIssues } from '../utils/app-error';

interface ValidationSchemas {
  body?: ZodType<unknown>;
  query?: ZodType<unknown>;
  params?: ZodType<unknown>;
}

interface ValidationErrorConfig {
  code?: string;
  message?: string;
  codeByPath?: Record<string, string>;
  messageByPath?: Record<string, string>;
}

/**
 * @param schemas Zod schemas for body, query, or route params.
 * @returns Express middleware that validates and normalizes request input.
 */
export function validate(schemas: ValidationSchemas, errorConfig: ValidationErrorConfig = {}) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as Request['query'];
      }

      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as Request['params'];
      }

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const firstPath = error.issues[0]?.path.join('.') || 'root';
        const code = errorConfig.codeByPath?.[firstPath] || errorConfig.code || 'VALIDATION_ERROR';
        const message = errorConfig.messageByPath?.[firstPath] || errorConfig.message || 'Du lieu gui len khong hop le';
        return next(new ApiError(400, message, code, mapZodIssues(error)));
      }

      return next(error);
    }
  };
}
