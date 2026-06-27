# API Contract — An Nhiên

> **Tài liệu này là nguồn sự thật duy nhất** cho toàn bộ giao tiếp giữa frontend và backend.
> Frontend và Backend đều phải prompt/code theo đúng spec này để tránh mismatch.

---

## 1. Thông tin kết nối

| Môi trường | Frontend URL | Backend URL |
|---|---|---|
| Development | `http://localhost:3000` | `http://localhost:3001` |
| Production | `https://annhien.vercel.app` | `https://api-annhien.railway.app` |

**Frontend env** (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**Backend env** (`.env`):
```
PORT=3001
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GEMINI_API_KEY=AIza...
JWT_SECRET=annhien_hackathon_jwt_secret_2025
```

---

## 2. Authentication

### Strategy: Custom JWT (Simple, không cần thư viện Auth ngoài)

**Không dùng**: Clerk, Firebase Auth, NextAuth — quá phức tạp cho hackathon.

**Cách hoạt động**:
1. User hoàn thành Onboarding → Frontend gọi `POST /api/auth/setup`
2. Backend tạo row trong bảng `users` → ký JWT bằng `JWT_SECRET`
3. Frontend lưu `{ userId, token }` vào `localStorage`
4. Mọi request sau: đính kèm `Authorization: Bearer <token>` trong header
5. Backend middleware `verifyToken` giải mã JWT → lấy `userId`, `role`

**JWT Payload**:
```json
{
  "userId": "uuid-v4",
  "role": "user",
  "nickname": "Dương",
  "iat": 1719446400,
  "exp": 1751068800
}
```

**JWT TTL**: 365 ngày (hackathon — không cần refresh token)

**Frontend helper** (`src/lib/api-client.ts`):
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getToken(): string | null {
  return localStorage.getItem('annhien_token');
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}
```

**Backend middleware** (`src/middleware/auth.ts`):
```typescript
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: { userId: string; role: string; nickname: string };
}

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Chưa đăng nhập' });
  }
  try {
    const decoded = jwt.verify(auth.slice(7), process.env.JWT_SECRET!) as any;
    req.user = { userId: decoded.userId, role: decoded.role, nickname: decoded.nickname };
    next();
  } catch {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    next();
  };
}
```

---

## 3. Quy ước chung

### Error Response Format (tất cả lỗi đều trả về dạng này)
```json
{
  "message": "Mô tả lỗi bằng tiếng Việt",
  "code": "ERROR_CODE_SNAKE_CASE"
}
```

### Success Response Format
```json
{
  "data": { ... }
}
```
Hoặc flat object nếu rõ ràng (ví dụ: `{ "token": "...", "userId": "..." }`).

### Timestamp format: ISO 8601
```
"2025-06-27T07:30:00.000Z"
```

### UUID: v4 (Supabase auto-generate)

### Tên field: camelCase trong JSON

---

## 4. Database Schema — Field Names

### Bảng `users`
```sql
id           UUID    PRIMARY KEY DEFAULT uuid_generate_v4()
username     VARCHAR(50)  UNIQUE       -- Dành cho đăng nhập (Staff)
password_hash VARCHAR(255)             -- Dành cho đăng nhập (Staff)
nickname     VARCHAR(50)  NOT NULL
role         VARCHAR(20)  NOT NULL DEFAULT 'user'  -- 'user','healer','doctor','admin'
status       VARCHAR(20)  NOT NULL DEFAULT 'offline' -- 'online','busy','offline'
topics       JSONB        NOT NULL DEFAULT '[]'     -- ['study','family','relationship','daily']
created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
```

### Bảng `journals`
```sql
id                UUID    PRIMARY KEY DEFAULT uuid_generate_v4()
user_id           UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE
encrypted_content TEXT    NOT NULL    -- btoa(content) trong MVP
mood              VARCHAR(20) NOT NULL  -- 'great','good','okay','tired','anxious'
created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

### Bảng `posts`
```sql
id           UUID    PRIMARY KEY DEFAULT uuid_generate_v4()
author_id    UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE
content      TEXT    NOT NULL
topic        VARCHAR(50) NOT NULL   -- 'study','family','relationship','daily','other'
status       VARCHAR(20) NOT NULL DEFAULT 'public'  -- 'public','flagged','hidden'
author_label VARCHAR(50) NOT NULL DEFAULT 'Ẩn danh'
reactions    JSONB   NOT NULL DEFAULT '{"hug":0,"empathy":0,"peace":0}'
created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

### Bảng `post_reactions`
```sql
id            UUID    PRIMARY KEY DEFAULT uuid_generate_v4()
post_id       UUID    NOT NULL REFERENCES posts(id) ON DELETE CASCADE
user_id       UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE
reaction_type VARCHAR(20) NOT NULL  -- 'hug','empathy','peace'
created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
UNIQUE(post_id, user_id)
```

### Bảng `conversations`
```sql
id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4()
user_id     UUID    NOT NULL REFERENCES users(id)
healer_id   UUID    REFERENCES users(id)  -- NULL khi chờ
status      VARCHAR(20) NOT NULL DEFAULT 'waiting'  -- 'waiting','active','closed'
ai_insights TEXT    -- Tóm tắt AI về tâm trạng user (cho Healer đọc)
created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

### Bảng `messages`
```sql
id              UUID    PRIMARY KEY DEFAULT uuid_generate_v4()
conversation_id UUID    NOT NULL REFERENCES conversations(id) ON DELETE CASCADE
sender_id       UUID    REFERENCES users(id)  -- NULL = system message
sender_role     VARCHAR(20) NOT NULL  -- 'user','healer','ai','system'
content         TEXT    NOT NULL
created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

### Bảng `videos`
```sql
id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4()
doctor_id   UUID    REFERENCES users(id)
title       VARCHAR(200) NOT NULL
topic       VARCHAR(50)  NOT NULL
video_url   TEXT    NOT NULL
description TEXT
status      VARCHAR(20) NOT NULL DEFAULT 'approved'  -- 'pending','approved','rejected'
likes       INTEGER NOT NULL DEFAULT 0
saved       INTEGER NOT NULL DEFAULT 0
created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

---

## 5. API Endpoints — Full Spec

### 5.1 Auth

#### `POST /api/auth/setup`
Tạo tài khoản ẩn danh và nhận JWT token. Hệ thống tự động gán `role = 'user'`.

**Auth**: Không cần

**Request**:
```json
{
  "nickname": "Dương",
  "topics": ["study", "daily"]
}
```

**Response `201`**:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "nickname": "Dương",
  "role": "user",
  "expiresIn": 31536000
}
```

**Validation**:
- `nickname`: 1–50 ký tự, bắt buộc
- `topics`: mảng string, có thể rỗng

---

#### `POST /api/auth/login`
Đăng nhập dành cho nhân viên (Bác sĩ, Healer).

**Auth**: Không cần

**Request**:
```json
{
  "username": "dr_lanhuong",
  "password": "secure_password"
}
```

**Response `200`**:
```json
{
  "userId": "uuid",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "nickname": "ThS. BS Nguyễn Lân Hương",
  "role": "doctor",
  "expiresIn": 31536000
}
```

**Validation**:
- `username`: chuỗi, bắt buộc
- `password`: chuỗi, bắt buộc

---

#### `GET /api/auth/me`
Lấy thông tin user hiện tại.

**Auth**: Bearer token

**Response `200`**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "nickname": "Dương",
  "role": "user",
  "topics": ["study", "daily"],
  "createdAt": "2025-06-27T07:30:00.000Z"
}
```

---

#### `PATCH /api/auth/status`
Cập nhật trạng thái online/busy/offline cho Healer/Doctor.

**Auth**: Bearer token (chỉ cho role `healer` hoặc `doctor`)

**Request**:
```json
{ "status": "busy" }
```

**Response `200`**:
```json
{ "id": "user-uuid", "status": "busy" }
```

---

### 5.2 Journals

#### `POST /api/journals`
Lưu nhật ký đã mã hóa.

**Auth**: Bearer token

**Request**:
```json
{
  "encryptedContent": "RU5DX0FFUzI1Njo6SGjDtG0gbmF5...",
  "mood": "anxious"
}
```

**Response `201`**:
```json
{
  "id": "journal-uuid",
  "mood": "anxious",
  "createdAt": "2025-06-27T07:30:00.000Z"
}
```

**Validation**:
- `encryptedContent`: bắt buộc, string
- `mood`: một trong `['great', 'good', 'okay', 'tired', 'anxious']`

---

#### `GET /api/journals/me`
Lấy danh sách journals của user (chỉ metadata, không trả `encryptedContent`).

**Auth**: Bearer token

**Query params**: `?limit=30&offset=0`

**Response `200`**:
```json
{
  "journals": [
    {
      "id": "journal-uuid",
      "mood": "anxious",
      "createdAt": "2025-06-27T07:30:00.000Z"
    }
  ],
  "total": 3
}
```

---

#### `GET /api/journals/:id`
Lấy nội dung đã mã hóa của 1 journal (để user tự giải mã bằng PIN phía client).

**Auth**: Bearer token (chỉ owner mới lấy được)

**Response `200`**:
```json
{
  "id": "journal-uuid",
  "encryptedContent": "RU5DX0FFUzI1Njo6SGjDtG0gbmF5...",
  "mood": "anxious",
  "createdAt": "2025-06-27T07:30:00.000Z"
}
```

**Errors**:
- `403` nếu journal không thuộc user này

---

### 5.3 Posts (Cộng đồng)

#### `GET /api/posts`
Lấy bài đăng public.

**Auth**: Không cần

**Query params**: `?topic=study&limit=20&offset=0`
- `topic`: `'study' | 'family' | 'relationship' | 'daily' | 'other'` (optional, bỏ qua = tất cả)

**Response `200`**:
```json
{
  "posts": [
    {
      "id": "post-uuid",
      "content": "Hôm nay mình cảm thấy...",
      "topic": "study",
      "authorLabel": "Ẩn danh",
      "reactions": { "hug": 42, "empathy": 18, "peace": 7 },
      "createdAt": "2025-06-27T07:30:00.000Z"
    }
  ],
  "total": 15,
  "hasMore": false
}
```

---

#### `POST /api/posts`
Tạo bài đăng mới. Backend tự chạy AI moderation trước khi lưu.

**Auth**: Bearer token

**Request**:
```json
{
  "content": "Hôm nay mình cảm thấy rất mệt...",
  "topic": "daily"
}
```

**Response `201`**:
```json
{
  "id": "post-uuid",
  "content": "Hôm nay mình cảm thấy rất mệt...",
  "topic": "daily",
  "authorLabel": "Ẩn danh",
  "status": "public",
  "reactions": { "hug": 0, "empathy": 0, "peace": 0 },
  "triggerSOS": false,
  "createdAt": "2025-06-27T07:30:00.000Z"
}
```

**Lưu ý**: Nếu `status = "flagged"` hoặc `triggerSOS = true` → Frontend hiển thị SOS Modal.
- `triggerSOS: true`: bài bị flagged + SOS modal bật
- `status: "flagged"`: bài chờ Admin duyệt, không xuất hiện công khai

**Validation**:
- `content`: 1–500 ký tự
- `topic`: một trong 5 topics hợp lệ

---

#### `POST /api/posts/:id/react`
Thêm hoặc bỏ reaction vào bài đăng.

**Auth**: Bearer token

**Request**:
```json
{ "reaction": "hug" }
```

**Response `200`**:
```json
{
  "reactions": { "hug": 43, "empathy": 18, "peace": 7 },
  "userReaction": "hug"
}
```

---

#### `GET /api/posts/flagged`
Admin: lấy bài đang bị flagged.

**Auth**: Bearer token + role `admin`

**Response `200`**:
```json
{
  "posts": [
    {
      "id": "post-uuid",
      "content": "...",
      "topic": "daily",
      "status": "flagged",
      "authorLabel": "Ẩn danh",
      "createdAt": "2025-06-27T07:30:00.000Z"
    }
  ]
}
```

---

#### `PATCH /api/posts/:id/status`
Admin: duyệt hoặc ẩn bài.

**Auth**: Bearer token + role `admin`

**Request**:
```json
{ "status": "hidden" }
```

**Response `200`**:
```json
{ "id": "post-uuid", "status": "hidden" }
```

---

### 5.4 Conversations & Chat

#### `POST /api/conversations`
User bắt đầu chờ kết nối Healer.

**Auth**: Bearer token + role `user`

**Request**: `{}` (empty body)

**Response `201`**:
```json
{
  "conversationId": "conv-uuid",
  "status": "waiting",
  "createdAt": "2025-06-27T07:30:00.000Z"
}
```

---

#### `GET /api/conversations/queue`
Healer xem danh sách user đang chờ.

**Auth**: Bearer token + role `healer`

**Response `200`**:
```json
{
  "queue": [
    {
      "conversationId": "conv-uuid",
      "userNickname": "Dương",
      "waitingSince": "2025-06-27T07:25:00.000Z",
      "aiInsights": "Người dùng đang lo âu về kỳ thi. Nên tiếp cận nhẹ nhàng."
    }
  ]
}
```

---

#### `PATCH /api/conversations/:id/accept`
Healer nhận ca.

**Auth**: Bearer token + role `healer`

**Request**: `{}` (empty body)

**Response `200`**:
```json
{
  "conversationId": "conv-uuid",
  "status": "active",
  "healerId": "healer-uuid",
  "healerNickname": "Linh"
}
```

---

#### `PATCH /api/conversations/:id/close`
Đóng cuộc hội thoại.

**Auth**: Bearer token (user hoặc healer trong conversation)

**Request**: `{}` (empty body)

**Response `200`**:
```json
{ "conversationId": "conv-uuid", "status": "closed" }
```

---

#### `POST /api/conversations/:id/transfer`
Healer chuyển ca cho Bác sĩ (chỉ dùng khi phát hiện ca cần y khoa).

**Auth**: Bearer token (role `healer`)

**Request**: `{}` (empty body)

**Response `200`**:
```json
{
  "conversationId": "conv-uuid",
  "status": "waiting",
  "healerId": null
}
```

---

#### `POST /api/messages`
Gửi tin nhắn và lưu vào DB. Backend gọi Gemini nếu `senderRole = 'ai'`.

**Auth**: Bearer token

**Request (User gửi)**:
```json
{
  "conversationId": "conv-uuid",
  "content": "Mình đang rất lo về kỳ thi sắp tới"
}
```

**Request (Trigger AI reply)**:
```json
{
  "conversationId": "conv-uuid",
  "content": "Mình đang rất lo về kỳ thi sắp tới",
  "requestAiReply": true,
  "personaId": "healer_linh"
}
```

**Response `201`**:
```json
{
  "userMessage": {
    "id": "msg-uuid-1",
    "conversationId": "conv-uuid",
    "senderId": "user-uuid",
    "senderRole": "user",
    "content": "Mình đang rất lo về kỳ thi sắp tới",
    "createdAt": "2025-06-27T07:30:00.000Z"
  },
  "aiReply": {
    "id": "msg-uuid-2",
    "conversationId": "conv-uuid",
    "senderId": null,
    "senderRole": "ai",
    "content": "Tớ hiểu cảm giác đó...",
    "createdAt": "2025-06-27T07:30:01.000Z"
  }
}
```

**Lưu ý**: `aiReply` chỉ có trong response nếu `requestAiReply: true`. Frontend dùng Supabase Realtime để nhận tin nhắn thật-thời (cả 2 phía không cần poll).

---

#### `GET /api/messages/:conversationId`
Lấy lịch sử tin nhắn.

**Auth**: Bearer token (phải là user hoặc healer trong conversation)

**Query params**: `?limit=50&before=<message-uuid>`

**Response `200`**:
```json
{
  "messages": [
    {
      "id": "msg-uuid",
      "conversationId": "conv-uuid",
      "senderId": "user-uuid",
      "senderRole": "user",
      "content": "Mình đang lo...",
      "createdAt": "2025-06-27T07:30:00.000Z"
    }
  ],
  "hasMore": false
}
```

---

### 5.5 Videos

#### `GET /api/videos`
Lấy videos đã được duyệt.

**Auth**: Không cần

**Query params**: `?topic=study&limit=10`

**Response `200`**:
```json
{
  "videos": [
    {
      "id": "vid-uuid",
      "title": "Bài tập thở hạ hỏa tức thì 4-7-8 🌿",
      "topic": "daily",
      "videoUrl": "https://assets.mixkit.co/videos/...",
      "doctorName": "ThS. BS Nguyễn Lân Hương",
      "description": "Kỹ thuật thở 4-7-8...",
      "likes": 1240,
      "saved": 890
    }
  ]
}
```

---

#### `POST /api/videos`
Bác sĩ tải lên video mới (lưu URL thay vì file thực tế).

**Auth**: Bearer token + role `doctor`

**Request**:
```json
{
  "title": "Tập thở 4-7-8",
  "topic": "daily",
  "videoUrl": "/assets/videos/vid_1_breathe.mp4",
  "description": "Hướng dẫn thở..."
}
```

**Response `201`**:
```json
{
  "id": "vid-uuid",
  "status": "pending",
  "createdAt": "2025-06-27T07:30:00.000Z"
}
```

---

### 5.6 AI Routes

#### `POST /api/ai/chat`
Gửi tin nhắn và nhận phản hồi từ AI đóng vai persona.

**Auth**: Bearer token

**Request**:
```json
{
  "personaId": "healer_linh",
  "userMessage": "Mình đang stress về kỳ thi",
  "history": [
    { "role": "model", "content": "Chào cậu! Hôm nay cậu cảm thấy thế nào?" }
  ]
}
```

**Response `200`**:
```json
{
  "reply": "Tớ hiểu cảm giác đó rất rõ...",
  "personaName": "Linh (Người đồng hành)"
}
```

**Lưu ý**: `history` dùng format đơn giản hơn Gemini native — backend tự convert sang format Gemini yêu cầu.

---

#### `POST /api/ai/triage`
Phân tích nội dung nhật ký để đánh giá mức độ rủi ro.

**Auth**: Bearer token

**Request**:
```json
{
  "plainText": "Hôm nay mình thấy rất mệt, muốn reset game..."
}
```

**Response `200`**:
```json
{
  "riskLevel": "high",
  "mood": "anxious",
  "triggerSOS": true,
  "suggestedResponse": "Cảm ơn bạn đã chia sẻ. Hãy nhớ rằng bạn không cô đơn 💛"
}
```

---

#### `POST /api/ai/moderation`
Kiểm duyệt nội dung bài đăng.

**Auth**: Bearer token (internal — chỉ backend gọi lẫn nhau, frontend không gọi trực tiếp)

**Request**:
```json
{ "content": "Mệt quá rồi không muốn tồn tại nữa..." }
```

**Response `200`**:
```json
{
  "verdict": "flagged",
  "triggerSOS": true,
  "reason": "Có ý định tự hại ẩn trong nội dung"
}
```

---

## 6. Supabase Realtime — Frontend Subscriptions

Frontend subscribe trực tiếp vào Supabase (không qua backend) để nhận updates real-time.

```typescript
// subscribe tin nhắn mới trong conversation
supabase
  .channel(`messages-${conversationId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`,
  }, (payload) => {
    setMessages(prev => [...prev, mapMessage(payload.new)]);
  })
  .subscribe();

// Healer subscribe hàng đợi
supabase
  .channel('healer-queue')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'conversations',
    filter: 'status=eq.waiting',
  }, (payload) => {
    // update queue
  })
  .subscribe();
```

**Lưu ý**: Frontend chỉ cần `NEXT_PUBLIC_SUPABASE_ANON_KEY` cho Realtime — không bao giờ expose `SERVICE_ROLE_KEY`.

---

## 7. CORS Configuration (backend)

```typescript
// backend/src/index.ts
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
```

---

## 8. HTTP Status Codes quy ước

| Code | Khi nào |
|---|---|
| `200` | GET thành công, PATCH thành công |
| `201` | POST tạo mới thành công |
| `400` | Validation lỗi (thiếu field, sai format) |
| `401` | Chưa đăng nhập hoặc token không hợp lệ |
| `403` | Không có quyền (sai role) |
| `404` | Resource không tồn tại |
| `500` | Lỗi server (Gemini, Supabase...) |
