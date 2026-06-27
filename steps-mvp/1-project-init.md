# Bước 1: Khởi Tạo Dự Án & Cấu Hình Cơ Sở Dữ Liệu (AI Agent Prompt Guide)

## Hướng dẫn dành cho lập trình viên

Sao chép toàn bộ phần **PROMPT DÀNH CHO AI AGENT** dưới đây và dán vào công cụ AI Coding Assistant (Cursor, Claude, hoặc Copilot) ở thư mục gốc của dự án để khởi tạo cấu trúc và cấu hình ban đầu.

---

## PROMPT DÀNH CHO AI AGENT: KHỞI TẠO DỰ ÁN & DATABASE SCHEMA

```prompt
Bạn là một AI Coding Agent chuyên nghiệp. Hãy khởi tạo cấu trúc thư mục phân tách Frontend và Backend cho ứng dụng chăm sóc sức khỏe tinh thần "An Nhiên" theo đúng các chỉ dẫn kỹ thuật dưới đây.

### 1. Bối cảnh & Các tệp tin liên quan cần đọc trước:
- **Tệp tin tham chiếu**: Đọc tệp `mock_data.js` và `api-contract.md` (nếu có) ở thư mục gốc để nắm được thông tin dữ liệu mẫu và các endpoints, tên các trường dữ liệu (field names) cần định nghĩa trong database.
- **Tính nhất quán**: Hãy chắc chắn các tên trường và kiểu dữ liệu (data types) trong cơ sở dữ liệu sắp khởi tạo phải khớp hoàn toàn với quy ước đã được định rõ trong `api-contract.md` (ví dụ: cột `nickname`, `topics` dạng JSONB, `role` mặc định `'user'`, bảng `messages` không có trường ảnh).

### 2. Cấu trúc thư mục cần tạo:
Tạo cấu trúc thư mục và các tệp cấu hình ban đầu tại thư mục gốc:
- Thư mục `frontend/` (Next.js 14 App Router, TypeScript, Tailwind CSS)
- Thư mục `backend/` (Express.js, Node.js, TypeScript)

### 3. Thiết lập Backend (Node.js + Express.js + TypeScript):
Tạo thư mục `backend/` và các tệp tin sau:

#### tệp `backend/package.json`:
Hãy ghi nội dung sau vào file:
{
  "name": "annhien-backend",
  "version": "1.0.0",
  "description": "API Server cho An Nhien",
  "main": "dist/index.js",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.19.2",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.12.0",
    "@supabase/supabase-js": "^2.43.4",
    "@google/generative-ai": "^0.11.0"
  },
  "devDependencies": {
    "typescript": "^5.4.5",
    "@types/node": "^20.12.12",
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/pg": "^8.11.6",
    "ts-node-dev": "^2.0.0"
  }
}

#### tệp `backend/tsconfig.json`:
{
  "compilerOptions": {
    "target": "es2022",
    "module": "commonjs",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"]
}

#### tệp `backend/.env`:
PORT=3001
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY]
GEMINI_API_KEY=[YOUR_GEMINI_API_KEY]
JWT_SECRET=annhien_hackathon_jwt_secret_2025

#### tệp `backend/src/index.ts` (Skeletal Setup):
Ghi mã Express cơ bản để test health check tại endpoint `/api/health`. Đảm bảo cors được cấu hình cho phép FRONTEND_URL và đính kèm credentials: true.

---

### 4. Thiết lập Frontend (Next.js 14 + Tailwind CSS + Framer Motion):
Tạo thư mục `frontend/` và các tệp tin cấu hình sau:

#### tệp `frontend/package.json`:
{
  "name": "annhien-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "framer-motion": "^11.2.6",
    "lucide-react": "^0.379.0",
    "@supabase/supabase-js": "^2.43.4"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "eslint": "^8",
    "eslint-config-next": "14.2.3"
  }
}

#### tệp `frontend/.env.local`:
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]

#### tệp `frontend/src/app/globals.css`:
Ghi cấu hình Tailwind CSS cơ bản:
@tailwind base;
@tailwind components;
@tailwind utilities;

---

### 5. Tạo SQL Script Khởi tạo Database (Supabase PostgreSQL):
Hãy tạo một file `database.sql` tại thư mục root chứa toàn bộ mã SQL khởi tạo 7 bảng sau để tôi có thể copy chạy trên Supabase SQL Editor:
1. Bảng `users` (id UUID PRIMARY KEY, nickname, role, topics JSONB, created_at)
2. Bảng `journals` (id UUID PRIMARY KEY, user_id REFERENCES users, encrypted_content, mood, created_at)
3. Bảng `posts` (id UUID PRIMARY KEY, author_id REFERENCES users, content, topic, status, author_label, reactions JSONB, created_at)
4. Bảng `post_reactions` (id UUID PRIMARY KEY, post_id REFERENCES posts, user_id REFERENCES users, reaction_type, created_at, UNIQUE(post_id, user_id))
5. Bảng `conversations` (id UUID PRIMARY KEY, user_id REFERENCES users, healer_id REFERENCES users, status, ai_insights, created_at)
6. Bảng `messages` (id UUID PRIMARY KEY, conversation_id REFERENCES conversations, sender_id REFERENCES users, sender_role, content, created_at) -- CHÚ Ý: Không có trường lưu ảnh image_url
7. Bảng `videos` (id UUID PRIMARY KEY, doctor_id REFERENCES users, title, topic, video_url, description, status, likes, saved, created_at)

Đồng thời viết câu lệnh kích hoạt tính năng Realtime cho bảng `conversations` và `messages`.

Hãy tạo ra tất cả các thư mục, file cấu hình và nội dung code mẫu tương ứng theo đúng chỉ dẫn trên.
```

---

## KIỂM TRA & XÁC MINH (Checklist cuối bước 1)

Sau khi AI Agent chạy xong prompt trên, bạn hãy kiểm tra các mục sau:

- [ ] Thư mục `frontend/` và `backend/` đã được tạo riêng biệt ở root.
- [ ] Tệp `backend/package.json` và `frontend/package.json` chứa đúng các dependencies được yêu cầu (đặc biệt là `@supabase/supabase-js` ở cả hai bên, và `@google/generative-ai` ở backend).
- [ ] Tệp `backend/.env` và `frontend/.env.local` đã được tạo và chứa đầy đủ các biến môi trường cấu hình.
- [ ] Có tệp `database.sql` được tạo ở root chứa đầy đủ mã SQL khởi tạo 7 bảng (bảng `messages` không được phép chứa trường `image_url` hay bất cứ trường nào liên quan đến hình ảnh).
- [ ] Chạy lệnh `npm install` ở cả hai thư mục và khởi chạy thử `npm run dev` ở backend để đảm bảo cổng 3001 phản hồi `/api/health` thành công.
