import { compare } from 'bcryptjs';
import { mapUser } from '../lib/mappers';
import { createLocalId, createTimestamp, localStore } from '../lib/local-store';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { ApiError } from '../utils/app-error';
import { getJwtExpiresInSeconds, signAuthToken } from '../utils/jwt';
import type { DbUser, UserStatus } from '../types/domain';
import type { AuthLoginBody, AuthSetupBody } from '../validations/auth.validation';

interface AuthSuccessPayload {
  userId: string;
  token: string;
  nickname: string;
  role: DbUser['role'];
  expiresIn: number;
}

/**
 * @param input Validated onboarding payload.
 * @returns Auth payload for the newly created anonymous user.
 */
export async function setupAnonymousUser(input: AuthSetupBody): Promise<AuthSuccessPayload> {
  let user: DbUser;

  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('users')
      .insert({
        nickname: input.nickname,
        role: 'user',
        topics: input.topics,
      })
      .select('id,username,password_hash,nickname,role,status,topics,created_at')
      .single();

    if (error || !data) {
      throw new ApiError(500, error?.message || 'Khong the tao user', 'SUPABASE_INSERT_FAILED');
    }

    user = data as DbUser;
  } else {
    user = {
      id: createLocalId('user'),
      username: null,
      password_hash: null,
      nickname: input.nickname,
      role: 'user',
      status: 'offline',
      topics: input.topics,
      created_at: createTimestamp(),
    };
    localStore.users.push(user);
  }

  return {
    userId: user.id,
    token: signAuthToken({
      userId: user.id,
      role: user.role,
      nickname: user.nickname,
    }),
    nickname: user.nickname,
    role: user.role,
    expiresIn: getJwtExpiresInSeconds(),
  };
}

/**
 * @param input Validated login payload.
 * @returns Auth payload for a user, healer, doctor, or admin.
 */
export async function loginStaffUser(input: AuthLoginBody): Promise<AuthSuccessPayload> {
  const user = isSupabaseConfigured
    ? await findSupabaseUserByUsername(input.username)
    : findLocalUserByUsername(input.username);

  if (!user) {
    throw new ApiError(401, 'Tai khoan hoac mat khau khong dung', 'INVALID_CREDENTIALS');
  }

  if (!user.password_hash) {
    throw new ApiError(
      503,
      'Dang nhap local chua san sang. Hay cau hinh Supabase hoac LOCAL_DEMO_PASSWORD de kiem thu role.',
      'STAFF_LOGIN_NOT_AVAILABLE'
    );
  }

  const passwordMatches = await compare(input.password, user.password_hash);
  if (!passwordMatches) {
    throw new ApiError(401, 'Tai khoan hoac mat khau khong dung', 'INVALID_CREDENTIALS');
  }

  return {
    userId: user.id,
    token: signAuthToken({
      userId: user.id,
      role: user.role,
      nickname: user.nickname,
    }),
    nickname: user.nickname,
    role: user.role,
    expiresIn: getJwtExpiresInSeconds(),
  };
}

/**
 * @param userId Authenticated user id.
 * @returns Current user profile in API shape.
 */
export async function getCurrentUser(userId: string) {
  const user = isSupabaseConfigured ? await findSupabaseUserById(userId) : findLocalUserById(userId);

  if (!user) {
    throw new ApiError(404, 'Khong tim thay user', 'USER_NOT_FOUND');
  }

  return mapUser(user);
}

/**
 * @param userId Authenticated staff id.
 * @param status New presence status.
 * @returns Minimal status response payload.
 */
export async function updateCurrentUserStatus(userId: string, status: UserStatus): Promise<{ id: string; status: UserStatus }> {
  const user = isSupabaseConfigured
    ? await updateSupabaseUserStatus(userId, status)
    : updateLocalUserStatus(userId, status);

  if (!user) {
    throw new ApiError(404, 'Khong tim thay user', 'USER_NOT_FOUND');
  }

  return {
    id: user.id,
    status: user.status,
  };
}

/**
 * @param username Staff username.
 * @returns Matching local user or null.
 */
function findLocalUserByUsername(username: string): DbUser | null {
  return localStore.users.find((user) => user.username === username) || null;
}

/**
 * @param userId User id.
 * @returns Matching local user or null.
 */
function findLocalUserById(userId: string): DbUser | null {
  return localStore.users.find((user) => user.id === userId) || null;
}

/**
 * @param userId User id.
 * @param status New presence status.
 * @returns Updated local user or null.
 */
function updateLocalUserStatus(userId: string, status: UserStatus): DbUser | null {
  const user = findLocalUserById(userId);
  if (!user) {
    return null;
  }

  user.status = status;
  return user;
}

/**
 * @param username Staff username.
 * @returns Matching Supabase user or null.
 */
async function findSupabaseUserByUsername(username: string): Promise<DbUser | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id,username,password_hash,nickname,role,status,topics,created_at')
    .eq('username', username)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, error.message, 'SUPABASE_SELECT_FAILED');
  }

  return (data as DbUser | null) ?? null;
}

/**
 * @param userId User id.
 * @returns Matching Supabase user or null.
 */
async function findSupabaseUserById(userId: string): Promise<DbUser | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id,username,password_hash,nickname,role,status,topics,created_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, error.message, 'SUPABASE_SELECT_FAILED');
  }

  return (data as DbUser | null) ?? null;
}

/**
 * @param userId User id.
 * @param status New presence status.
 * @returns Updated Supabase user or null.
 */
async function updateSupabaseUserStatus(userId: string, status: UserStatus): Promise<DbUser | null> {
  const { data, error } = await supabase
    .from('users')
    .update({ status })
    .eq('id', userId)
    .select('id,username,password_hash,nickname,role,status,topics,created_at')
    .maybeSingle();

  if (error) {
    throw new ApiError(500, error.message, 'SUPABASE_UPDATE_FAILED');
  }

  return (data as DbUser | null) ?? null;
}
