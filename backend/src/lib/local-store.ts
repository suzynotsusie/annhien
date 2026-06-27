import { randomUUID } from 'node:crypto';
import { hashSync } from 'bcryptjs';
import type {
  DbConversation,
  DbJournal,
  DbMessage,
  DbPost,
  DbPostReaction,
  DbUser,
  DbVideo,
} from '../types/domain';

interface LocalStore {
  users: DbUser[];
  journals: DbJournal[];
  posts: DbPost[];
  postReactions: DbPostReaction[];
  conversations: DbConversation[];
  messages: DbMessage[];
  videos: DbVideo[];
}

/**
 * @returns ISO 8601 timestamp string for the local development store.
 */
export function createTimestamp(): string {
  return new Date().toISOString();
}

/**
 * @param prefix Human-readable prefix for easier debugging.
 * @returns Unique identifier for in-memory entities.
 */
export function createLocalId(prefix: string): string {
  return `${prefix}-${randomUUID()}`;
}

/**
 * @returns Optional bcrypt hash for local demo staff accounts when explicitly enabled.
 */
function getLocalDemoPasswordHash(): string | null {
  const demoPassword = process.env.LOCAL_DEMO_PASSWORD;
  return demoPassword ? hashSync(demoPassword, 10) : null;
}

/**
 * @returns Fresh in-memory store used when Supabase is not configured locally.
 */
function createInitialStore(): LocalStore {
  const now = createTimestamp();
  const localDemoPasswordHash = getLocalDemoPasswordHash();

  const users: DbUser[] = [
    {
      id: 'local-doctor-lan-huong',
      username: 'dr_lanhuong',
      password_hash: localDemoPasswordHash,
      nickname: 'ThS. BS Nguyen Lan Huong',
      role: 'doctor',
      status: 'offline',
      topics: ['study', 'daily'],
      created_at: now,
    },
    {
      id: 'local-healer-linh',
      username: 'healer_linh',
      password_hash: localDemoPasswordHash,
      nickname: 'Linh (Peer Supporter)',
      role: 'healer',
      status: 'online',
      topics: ['study'],
      created_at: now,
    },
    {
      id: 'local-admin',
      username: 'admin',
      password_hash: localDemoPasswordHash,
      nickname: 'Admin An Nhien',
      role: 'admin',
      status: 'online',
      topics: [],
      created_at: now,
    },
  ];

  const videos: DbVideo[] = [
    {
      id: 'local-video-1',
      doctor_id: 'local-doctor-lan-huong',
      title: 'Tap tho 4-7-8 de ha nhip tim',
      topic: 'daily',
      video_url: '/assets/videos/video1.mp4',
      description: 'Huong dan ngan giup ha hoa tuc thi trong nhung luc qua tai.',
      status: 'approved',
      likes: 1240,
      saved: 890,
      created_at: now,
    },
    {
      id: 'local-video-2',
      doctor_id: 'local-doctor-lan-huong',
      title: 'Tieng mua de nghi ngoi sau mot ngay met',
      topic: 'study',
      video_url: '/assets/videos/video2.mp4',
      description: 'Khong gian am thanh de lam diu he than kinh.',
      status: 'approved',
      likes: 980,
      saved: 640,
      created_at: now,
    },
  ];

  return {
    users,
    journals: [],
    posts: [],
    postReactions: [],
    conversations: [],
    messages: [],
    videos,
  };
}

export const localStore: LocalStore = createInitialStore();
