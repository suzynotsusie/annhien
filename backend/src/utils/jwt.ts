import jwt from 'jsonwebtoken';
import { JWT_EXPIRES_IN, JWT_EXPIRES_IN_SECONDS } from '../lib/constants';
import type { AuthUser } from '../types/domain';

const DEFAULT_JWT_SECRET = 'annhien_hackathon_jwt_secret_2025';

/**
 * @returns Secret used to sign and verify project JWTs.
 */
export function getJwtSecret(): string {
  return process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
}

/**
 * @param payload Authenticated user payload.
 * @returns Signed JWT token string.
 */
export function signAuthToken(payload: AuthUser): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * @param token Raw JWT token from the Authorization header.
 * @returns Decoded authenticated user payload.
 */
export function verifyAuthToken(token: string): AuthUser {
  const decoded = jwt.verify(token, getJwtSecret()) as AuthUser;
  return {
    userId: decoded.userId,
    role: decoded.role,
    nickname: decoded.nickname,
  };
}

/**
 * @returns Token TTL in seconds for API responses.
 */
export function getJwtExpiresInSeconds(): number {
  return JWT_EXPIRES_IN_SECONDS;
}
