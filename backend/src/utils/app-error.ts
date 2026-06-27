import { ZodError } from 'zod';

/**
 * Structured application error that can be serialized by the global error handler.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  /**
   * @param statusCode HTTP status code that should be returned.
   * @param message Human-readable error message.
   * @param code Stable machine-readable error code.
   * @param details Optional structured metadata for debugging or validation feedback.
   */
  constructor(statusCode: number, message: string, code = 'SERVER_ERROR', details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export interface ErrorPayload {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  code: string;
  message: string;
  details?: unknown;
}

/**
 * @param error Structured application error instance.
 * @returns Serializable JSON payload that keeps both enterprise and legacy fields.
 */
export function buildErrorPayload(error: ApiError): ErrorPayload {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      ...(error.details === undefined ? {} : { details: error.details }),
    },
    code: error.code,
    message: error.message,
    ...(error.details === undefined ? {} : { details: error.details }),
  };
}

/**
 * @param error Zod validation error thrown by schema parsing.
 * @returns Normalized validation details for API responses.
 */
export function mapZodIssues(error: ZodError): Array<{ path: string; message: string }> {
  return error.issues.map((issue) => ({
    path: issue.path.join('.') || 'root',
    message: issue.message,
  }));
}
