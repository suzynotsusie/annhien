import { MOODS, POST_STATUSES, REACTIONS, TOPICS, USER_ROLES } from './constants';
import type { Mood, PostStatus, ReactionType, Topic, UserRole } from '../types/domain';

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function asUserRole(value: unknown, fallback: UserRole = 'user'): UserRole | null {
  if (value === undefined || value === null || value === '') return fallback;
  return typeof value === 'string' && USER_ROLES.includes(value as UserRole) ? (value as UserRole) : null;
}

export function asTopic(value: unknown): Topic | null {
  return typeof value === 'string' && TOPICS.includes(value as Topic) ? (value as Topic) : null;
}

export function asMood(value: unknown): Mood | null {
  return typeof value === 'string' && MOODS.includes(value as Mood) ? (value as Mood) : null;
}

export function asReaction(value: unknown): ReactionType | null {
  return typeof value === 'string' && REACTIONS.includes(value as ReactionType) ? (value as ReactionType) : null;
}

export function asPostStatus(value: unknown): PostStatus | null {
  return typeof value === 'string' && POST_STATUSES.includes(value as PostStatus) ? (value as PostStatus) : null;
}

export function sanitizeTopics(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  return value.filter((topic): topic is string => typeof topic === 'string').slice(0, 10);
}
