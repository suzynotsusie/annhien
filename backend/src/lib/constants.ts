import type { Mood, PostStatus, ReactionType, Topic, UserRole } from '../types/domain';

export const JWT_EXPIRES_IN_SECONDS = 365 * 24 * 60 * 60;
export const JWT_EXPIRES_IN = '365d';

export const USER_ROLES: UserRole[] = ['user', 'healer', 'doctor', 'admin'];
export const TOPICS: Topic[] = ['study', 'family', 'relationship', 'daily', 'other'];
export const MOODS: Mood[] = ['great', 'good', 'okay', 'tired', 'anxious'];
export const REACTIONS: ReactionType[] = ['hug', 'empathy', 'peace'];
export const POST_STATUSES: PostStatus[] = ['public', 'flagged', 'hidden'];

export const DEFAULT_REACTIONS: Record<ReactionType, number> = {
  hug: 0,
  empathy: 0,
  peace: 0,
};
