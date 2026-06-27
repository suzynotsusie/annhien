# 🌿 An Nhiên — Ứng dụng Chăm sóc Sức khỏe Tinh thần

> MVP Hackathon — Next.js 14 + Express.js + Supabase + Gemini AI

---

## 📋 Yêu cầu cài đặt

- [Node.js](https://nodejs.org/) >= 18
- npm >= 9
- Tài khoản [Supabase](https://supabase.com) (miễn phí)
- Tài khoản [Google AI Studio](https://aistudio.google.com) để lấy Gemini API Key

---

## 🚀 Hướng dẫn chạy dự án (lần đầu)

### Bước 1 — Clone repo về máy

```bash
git clone <repo-url>
cd annhien
```

### Bước 2 — Cấu hình biến môi trường

**Backend:**
```bash
cd backend
cp .env.example .env
# Mở file .env và điền SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY
```

**Frontend:**
```bash
cd ../frontend
cp .env.example .env.local
# Mở file .env.local và điền NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
```

> 💡 Xem hướng dẫn lấy key ở phần **Lấy credentials** bên dưới.

### Bước 3 — Cài đặt dependencies

Mở **2 terminal riêng biệt**:

**Terminal 1 — Backend:**
```bash
cd backend
npm install
npm run dev
# ✅ Server chạy tại http://localhost:3001
# ✅ Health check: http://localhost:3001/api/health
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
# ✅ App chạy tại http://localhost:3000
```

### Bước 4 — Khởi tạo Database

1. Đăng nhập vào [Supabase Dashboard](https://supabase.com/dashboard)
2. Vào project → **SQL Editor**
3. Copy toàn bộ nội dung file [`database.sql`](./database.sql) và chạy
4. ✅ 7 bảng được tạo + Realtime được kích hoạt

---

## 🔑 Lấy credentials

### Supabase
1. Vào [supabase.com/dashboard](https://supabase.com/dashboard) → Tạo project mới
2. Vào **Settings → API**
3. Lấy:
   - `Project URL` → dùng cho `SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_URL`
   - `anon / public key` → dùng cho `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role / secret key` → dùng cho `SUPABASE_SERVICE_ROLE_KEY` (**⚠️ chỉ dùng ở backend!**)

### Gemini API Key
1. Vào [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Click **Create API key**
3. Dùng cho `GEMINI_API_KEY` trong backend

---

## 📁 Cấu trúc dự án

```
annhien/
├── backend/              # Express.js API Server (port 3001)
│   ├── src/
│   │   └── index.ts      # Entry point
│   ├── .env.example      # Template biến môi trường
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/             # Next.js 14 App (port 3000)
│   ├── src/app/
│   │   └── globals.css
│   ├── .env.example      # Template biến môi trường
│   └── package.json
│
├── database.sql          # SQL schema khởi tạo 7 bảng Supabase
├── api-contract.md       # Spec API đầy đủ (nguồn sự thật duy nhất)
├── mock_data.js          # Dữ liệu mẫu doctors, healers, videos
└── .gitignore
```

---

## 🗄️ Database Schema (7 bảng)

| Bảng | Mô tả |
|------|-------|
| `users` | Người dùng ẩn danh, healers, doctors, admin |
| `journals` | Nhật ký tâm trạng mã hóa E2EE |
| `posts` | Bài đăng cộng đồng ẩn danh |
| `post_reactions` | Reactions: hug, empathy, peace |
| `conversations` | Phiên chat user ↔ healer |
| `messages` | Lịch sử tin nhắn (không có image_url) |
| `videos` | Video ngắn Trạm Chữa Lành |

---

## 🛠️ Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Framer Motion |
| Backend | Express.js, TypeScript, ts-node-dev |
| Database | Supabase PostgreSQL + Realtime |
| AI | Google Gemini AI |
| Auth | Custom JWT (không dùng thư viện ngoài) |
