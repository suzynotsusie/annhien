import type { DbConversation, DbJournal, DbMessage, DbPost, DbUser, DbVideo } from '../types/domain';

export function mapUser(row: DbUser) {
  return {
    id: row.id,
    nickname: row.nickname,
    role: row.role,
    topics: row.topics ?? [],
    createdAt: row.created_at,
  };
}

export function mapJournalMeta(row: Pick<DbJournal, 'id' | 'mood' | 'created_at'>) {
  return {
    id: row.id,
    mood: row.mood,
    createdAt: row.created_at,
  };
}

export function mapJournal(row: DbJournal) {
  return {
    id: row.id,
    encryptedContent: row.encrypted_content,
    mood: row.mood,
    createdAt: row.created_at,
  };
}

export function mapPost(row: DbPost) {
  return {
    id: row.id,
    content: row.content,
    topic: row.topic,
    authorLabel: row.author_label,
    reactions: row.reactions,
    createdAt: row.created_at,
  };
}

export function mapPostWithStatus(row: DbPost) {
  return {
    ...mapPost(row),
    status: row.status,
  };
}

export function mapConversation(row: DbConversation) {
  return {
    conversationId: row.id,
    status: row.status,
    createdAt: row.created_at,
  };
}

export function mapMessage(row: DbMessage) {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    senderRole: row.sender_role,
    content: row.content,
    createdAt: row.created_at,
  };
}

export function mapVideo(row: DbVideo, doctorName: string | null) {
  return {
    id: row.id,
    title: row.title,
    topic: row.topic,
    videoUrl: row.video_url,
    doctorName,
    description: row.description,
    likes: row.likes,
    saved: row.saved,
  };
}
