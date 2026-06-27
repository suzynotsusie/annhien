-- =========================================================
-- DATABASE SCHEMA — An Nhiên MVP
-- Chạy toàn bộ script này trên Supabase SQL Editor
-- =========================================================

-- Kích hoạt extension uuid-ossp để tự sinh UUID v4
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================
-- 1. Bảng USERS
--    Lưu thông tin người dùng ẩn danh, healers, doctors, admin
-- =========================================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  username      VARCHAR(50)  UNIQUE, -- Dành cho Bác sĩ & Healer đăng nhập
  password_hash VARCHAR(255),        -- Dành cho Bác sĩ & Healer đăng nhập
  nickname      VARCHAR(50)  NOT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'user',  -- 'user' | 'healer' | 'doctor' | 'admin'
  status        VARCHAR(20)  NOT NULL DEFAULT 'offline', -- 'online' | 'busy' | 'offline'
  topics        JSONB        NOT NULL DEFAULT '[]',     -- ['study','family','relationship','daily']
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 2. Bảng JOURNALS
--    Lưu nhật ký tâm trạng đã mã hóa E2EE (btoa phía client)
-- =========================================================
CREATE TABLE IF NOT EXISTS journals (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  encrypted_content TEXT        NOT NULL,   -- btoa(content) trong MVP
  mood              VARCHAR(20) NOT NULL,   -- 'great'|'good'|'okay'|'tired'|'anxious'
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 3. Bảng POSTS
--    Bài đăng cộng đồng ẩn danh, qua AI moderation trước khi public
-- =========================================================
CREATE TABLE IF NOT EXISTS posts (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content      TEXT        NOT NULL,
  topic        VARCHAR(50) NOT NULL,                -- 'study'|'family'|'relationship'|'daily'|'other'
  status       VARCHAR(20) NOT NULL DEFAULT 'public', -- 'public'|'flagged'|'hidden'
  author_label VARCHAR(50) NOT NULL DEFAULT 'Ẩn danh',
  reactions    JSONB       NOT NULL DEFAULT '{"hug":0,"empathy":0,"peace":0}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 4. Bảng POST_REACTIONS
--    Lưu lượt tương tác (hug, empathy, peace) theo từng user — UNIQUE per post per user
-- =========================================================
CREATE TABLE IF NOT EXISTS post_reactions (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id       UUID        NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction_type VARCHAR(20) NOT NULL,  -- 'hug'|'empathy'|'peace'
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- =========================================================
-- 5. Bảng CONVERSATIONS
--    Quản lý phiên chat giữa user ↔ healer (hoặc AI fallback)
-- =========================================================
CREATE TABLE IF NOT EXISTS conversations (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        NOT NULL REFERENCES users(id),
  healer_id   UUID        REFERENCES users(id),  -- NULL khi đang chờ kết nối
  status      VARCHAR(20) NOT NULL DEFAULT 'waiting', -- 'waiting'|'active'|'closed'
  ai_insights TEXT,                              -- Tóm tắt AI về tâm trạng user (cho Healer đọc)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 6. Bảng MESSAGES
--    Lịch sử tin nhắn trong từng conversation
--    CHÚ Ý: Không có trường image_url hoặc bất kỳ trường ảnh nào
-- =========================================================
CREATE TABLE IF NOT EXISTS messages (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID        REFERENCES users(id),  -- NULL = system message
  sender_role     VARCHAR(20) NOT NULL,              -- 'user'|'healer'|'ai'|'system'
  content         TEXT        NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- 7. Bảng VIDEOS
--    Kho video ngắn dọc (Trạm Chữa Lành) được bác sĩ đăng tải
-- =========================================================
CREATE TABLE IF NOT EXISTS videos (
  id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id   UUID         REFERENCES users(id),
  title       VARCHAR(200) NOT NULL,
  topic       VARCHAR(50)  NOT NULL,
  video_url   TEXT         NOT NULL,
  description TEXT,
  status      VARCHAR(20)  NOT NULL DEFAULT 'approved', -- 'pending'|'approved'|'rejected'
  likes       INTEGER      NOT NULL DEFAULT 0,
  saved       INTEGER      NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- =========================================================
-- INDEXES — Tối ưu hiệu năng truy vấn
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_journals_user_id    ON journals(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_status        ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_topic         ON posts(topic);
CREATE INDEX IF NOT EXISTS idx_post_reactions_post ON post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_messages_conv       ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user  ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_videos_status       ON videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_topic        ON videos(topic);

-- =========================================================
-- REALTIME — Kích hoạt Supabase Realtime cho 2 bảng quan trọng
--   conversations: Healer nhận notification khi có user mới chờ
--   messages: Cả hai phía nhận tin nhắn tức thì không cần polling
-- =========================================================
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
