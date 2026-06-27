import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_EXPIRES_IN, JWT_EXPIRES_IN_SECONDS } from '../lib/constants';
import { ApiError, asyncRoute, sendError } from '../lib/http';
import { mapUser } from '../lib/mappers';
import { supabase } from '../lib/supabase';
import { asUserRole, isNonEmptyString, sanitizeTopics } from '../lib/validation';
import { verifyToken, type AuthRequest } from '../middleware/auth';
import type { DbUser } from '../types/domain';

const router = Router();

router.post(
  '/setup',
  asyncRoute(async (req, res) => {
    const { nickname, topics, role: rawRole } = req.body as Record<string, unknown>;
    const cleanNickname = typeof nickname === 'string' ? nickname.trim() : '';
    const role = asUserRole(rawRole);
    const cleanTopics = sanitizeTopics(topics);

    if (!isNonEmptyString(cleanNickname) || cleanNickname.length > 50) {
      return sendError(res, 400, 'Nickname bat buoc tu 1 den 50 ky tu', 'INVALID_NICKNAME');
    }

    if (!cleanTopics) {
      return sendError(res, 400, 'Topics phai la mang string', 'INVALID_TOPICS');
    }

    if (!role) {
      return sendError(res, 400, 'Role khong hop le', 'INVALID_ROLE');
    }

    const { data, error } = await supabase
      .from('users')
      .insert({ nickname: cleanNickname, role, topics: cleanTopics })
      .select('id,nickname,role,topics,created_at')
      .single();

    if (error || !data) {
      throw new ApiError(500, error?.message || 'Khong the tao user', 'SUPABASE_INSERT_FAILED');
    }

    const user = data as DbUser;
    const token = jwt.sign(
      { userId: user.id, role: user.role, nickname: user.nickname },
      process.env.JWT_SECRET || 'annhien_hackathon_jwt_secret_2025',
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      userId: user.id,
      token,
      nickname: user.nickname,
      role: user.role,
      expiresIn: JWT_EXPIRES_IN_SECONDS,
    });
  })
);

router.get(
  '/me',
  verifyToken,
  asyncRoute(async (req, res) => {
    const auth = (req as AuthRequest).user!;
    const { data, error } = await supabase
      .from('users')
      .select('id,nickname,role,topics,created_at')
      .eq('id', auth.userId)
      .single();

    if (error || !data) {
      throw new ApiError(404, 'Khong tim thay user', 'USER_NOT_FOUND');
    }

    return res.status(200).json(mapUser(data as DbUser));
  })
);

export default router;
