export type UserRole = 'user' | 'healer' | 'doctor' | 'admin';
export type Topic = 'study' | 'family' | 'relationship' | 'daily' | 'other';
export type Mood = 'great' | 'good' | 'okay' | 'tired' | 'anxious';
export type PostStatus = 'public' | 'flagged' | 'hidden';
export type ReactionType = 'hug' | 'empathy' | 'peace';
export type ConversationStatus = 'waiting' | 'active' | 'closed';
export type SenderRole = 'user' | 'healer' | 'doctor' | 'ai' | 'system';
export type RiskLevel = 'low' | 'medium' | 'high';
export type ModerationVerdict = 'safe' | 'flagged' | 'blocked';

export interface AuthUser {
  userId: string;
  role: UserRole;
  nickname: string;
}

export interface DbUser {
  id: string;
  nickname: string;
  role: UserRole;
  topics: string[];
  created_at: string;
}

export interface DbJournal {
  id: string;
  user_id: string;
  encrypted_content: string;
  mood: Mood;
  created_at: string;
}

export interface DbPost {
  id: string;
  author_id: string;
  content: string;
  topic: Topic;
  status: PostStatus;
  author_label: string;
  reactions: Record<ReactionType, number>;
  created_at: string;
}

export interface DbConversation {
  id: string;
  user_id: string;
  healer_id: string | null;
  status: ConversationStatus;
  ai_insights: string | null;
  created_at: string;
}

export interface DbMessage {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  sender_role: SenderRole;
  content: string;
  created_at: string;
}

export interface DbVideo {
  id: string;
  doctor_id: string | null;
  title: string;
  topic: Topic;
  video_url: string;
  description: string | null;
  status: 'pending' | 'approved' | 'rejected';
  likes: number;
  saved: number;
  created_at: string;
}

export interface AiHistoryItem {
  role: 'user' | 'model';
  content: string;
}

export interface TriageResult {
  riskLevel: RiskLevel;
  mood: Mood;
  triggerSOS: boolean;
  suggestedResponse: string;
}

export interface ModerationResult {
  verdict: ModerationVerdict;
  triggerSOS: boolean;
  reason: string;
}
