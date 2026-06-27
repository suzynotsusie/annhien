# Bước 2: Xây Dựng Lõi Backend — Express.js + Supabase + Gemini AI (AI Agent Prompt Guide)

## Hướng dẫn dành cho lập trình viên

Sao chép toàn bộ phần **PROMPT DÀNH CHO AI AGENT** dưới đây và dán vào công cụ AI Coding Assistant (ví dụ: Cursor) trong thư mục `backend/` để tạo toàn bộ mã nguồn lõi cho máy chủ API.

---

## PROMPT DÀNH CHO AI AGENT: XÂY DỰNG TOÀN BỘ LÕI BACKEND API

```prompt
Bạn là một AI Coding Agent chuyên nghiệp. Hãy viết toàn bộ mã nguồn Express.js + TypeScript cho backend của dự án An Nhiên nằm trong thư mục `backend/src/` theo đúng đặc tả kỹ thuật dưới đây. Đảm bảo cấu trúc code sạch, phân tách rõ ràng và không sử dụng bất cứ placeholder hay code thiếu nào.

### 1. Bối cảnh & Các tệp tin liên quan cần đọc trước:
- **Tệp tin schema cơ sở dữ liệu**: Đọc kỹ file `database.sql` ở thư mục gốc để nắm được tên bảng, tên cột (ví dụ: `nickname`, `topics` dạng JSONB, `encrypted_content`, `mood`, `reactions` JSONB) và các ràng buộc khóa ngoại.
- **Tệp tin hợp đồng API**: Đọc kỹ file `api-contract.md` ở thư mục gốc để nắm được toàn bộ danh sách 15 API Endpoints, định dạng dữ liệu yêu cầu/phản hồi (Request/Response JSON), mã lỗi HTTP status, và cơ chế xác thực JWT.
- **Tệp tin dữ liệu mẫu gốc**: Đọc file `mock_data.js` ở thư mục gốc để đồng bộ hóa danh sách 5 Bác sĩ, 5 Healers (đặc biệt là 10 Persona IDs tương ứng) và danh sách video mẫu.
- **Quy tắc nhất quán**: 
  - KHÔNG tự tiện thay đổi tên cột hoặc kiểu dữ liệu so với `database.sql`.
  - KHÔNG thay đổi cấu trúc URL hoặc tên trường JSON so với `api-contract.md`.
  - KHÔNG thêm bất kỳ trường ảnh nào (`image_url`, `media_url`...) vào bảng `messages` hoặc logic chat vì hệ thống chat của MVP là nghiêm ngặt văn bản thuần túy (text-only).

---

### 2. Triển khai các tệp tin cấu hình thư viện tại `src/lib/`:

#### tệp `src/lib/supabase.ts`:
Khởi tạo Supabase client sử dụng `@supabase/supabase-js`. 
- Đọc `SUPABASE_URL` và `SUPABASE_SERVICE_ROLE_KEY` từ `process.env`.
- Cấu hình client ở chế độ Service Role (bypass RLS) để đọc/ghi dữ liệu trực tiếp nhanh chóng từ backend.

#### tệp `src/lib/gemini.ts`:
- Khởi tạo Gemini client bằng `@google/generative-ai` sử dụng `process.env.GEMINI_API_KEY`.
- Viết hàm `getGeminiModel(options?: { temperature?: number, maxOutputTokens?: number, systemInstruction?: string, jsonMode?: boolean })` trả về model `gemini-1.5-flash` cấu hình tương ứng.
- Khai báo hằng số `AI_PERSONAS` chứa System Prompts cho đúng **10 personas** sau (phải khớp hoàn hảo với thông tin trong `mock_data.js`):
  1. `healer_linh` (Linh - Peer Supporter, 23 tuổi, ấm áp, xưng tớ/cậu, từng bị burnout đại học, lắng nghe, không khuyên bảo y tế).
  2. `healer_minh` (Minh - Peer Supporter, 24 tuổi, trầm tĩnh, sâu sắc, lắng nghe không phán xét, xưng tớ/cậu).
  3. `healer_ha_an` (Hà An - Peer Supporter, 21 tuổi, dịu dàng, xưng tớ/cậu, từng bị mâu thuẫn gia đình).
  4. `healer_thu_hang` (Lê Thu Hằng - Peer Supporter, 26 tuổi, chín chắn, thấu suốt, xưng tớ/cậu hoặc chị/em).
  5. `healer_bao_khanh` (Phạm Bảo Khánh - Peer Supporter, 25 tuổi, anh đi trước, xưng tớ/cậu hoặc anh/em, từng bị burnout công sở).
  6. `doc_1` (ThS. BS Nguyễn Lân Hương - Chuyên gia áp lực đồng trang lứa, xưng Bác sĩ/tôi, thấu cảm, khoa học).
  7. `doc_2` (TS. BS Trần Hoàng Nam - Chuyên gia trầm cảm, điềm tĩnh, sâu sắc, xưng Bác sĩ).
  8. `doc_3` (ThS. BS Mai Khánh Chi - Chuyên gia chữa lành mối quan hệ, bao dung, xưng Bác sĩ, hướng dẫn tự thấu cảm).
  9. `doc_4` (TS. BS Lê Đức Minh - Chuyên gia tâm lý học đường, hiền hậu, xưng Thầy/Bác sĩ).
  10. `doc_5` (ThS. BS Phạm Thị Mai Anh - Chuyên gia lo âu xã hội, trẻ trung, năng động, ứng dụng CBT, xưng Bác sĩ/chị).

---

### 3. Triển khai Middleware Xác thực tại `src/middleware/auth.ts`:
- Viết middleware `verifyToken` đọc token JWT từ header `Authorization: Bearer <token>`, giải mã bằng `process.env.JWT_SECRET` để gán thông tin `{ userId, role, nickname }` vào đối tượng `req.user` (định nghĩa interface `AuthRequest` kế thừa từ `Request` của Express).
- Viết middleware `requireRole(...roles: string[])` để phân quyền truy cập, trả về `403 Forbidden` nếu user role không nằm trong danh sách roles được phép.

---

### 4. Triển khai các API Routes tại `src/routes/`:

#### tệp `src/routes/auth.routes.ts`:
- `POST /setup`: Nhận `{ nickname, topics, role }` từ client. Lưu vào bảng `users` trong Supabase. Ký JWT chứa `{ userId, role, nickname }` với hạn dùng 365 ngày. Trả về JSON chứa thông tin người dùng mới đăng ký kèm token JWT.
- `GET /me` (Yêu cầu token): Trả về thông tin cá nhân của user đang đăng nhập từ bảng `users`.

#### tệp `src/routes/journals.routes.ts` (Yêu cầu token):
- `POST /`: Nhận `{ encryptedContent, mood }` đã được mã hóa ở client. Lưu vào bảng `journals` liên kết với `userId`. Trả về metadata dòng nhật ký đã lưu.
- `GET /me`: Trả về danh sách metadata nhật ký của user đang đăng nhập (chỉ trả về id, mood, created_at, KHÔNG trả về encryptedContent để tối ưu bảo mật và băng thông, hỗ trợ phân trang limit/offset).
- `GET /:id`: Trả về nội dung nhật ký chi tiết bao gồm `encryptedContent` (chỉ cho phép chủ sở hữu của nhật ký đó đọc).

#### tệp `src/routes/posts.routes.ts`:
- `GET /`: Xem bảng tin cộng đồng công khai (`status = 'public'`). Hỗ trợ lọc theo query `?topic=...` và phân trang.
- `POST /` (Yêu cầu token): Đăng bài viết confession ẩn danh mới. Lưu vào bảng `posts` với `status = 'public'` hoặc `status = 'flagged'` tùy thuộc vào kết quả kiểm duyệt, kèm theo `author_label` (Ví dụ: "Người dùng ẩn danh").
- `POST /:id/react` (Yêu cầu token): Nhận `{ reaction }` (một trong `['hug', 'empathy', 'peace']`). Lưu lượt tương tác vào bảng `post_reactions` bảo đảm mỗi user chỉ thả tối đa 1 reaction trên mỗi bài đăng (tự động cập nhật bộ đếm JSONB hoặc cột đếm tương ứng trong bảng `posts` tương ứng).
- `GET /flagged` (Yêu cầu token + role admin): Lấy danh sách bài viết bị cảnh báo nguy cơ tự hại hoặc vi phạm tiêu chuẩn cộng đồng (`status = 'flagged'`).
- `PATCH /:id/status` (Yêu cầu token + role admin): Nhận `{ status }` (một trong `['public', 'hidden']`) để Admin phê duyệt hoặc ẩn bài đăng.

#### tệp `src/routes/conversations.routes.ts` (Yêu cầu token):
- `POST /`: User yêu cầu kết nối chat. Tạo conversation mới trong bảng `conversations` với trạng thái `waiting`, lưu `user_id` và để trống `healer_id`.
- `GET /queue` (Yêu cầu token + role healer): Healer xem danh sách phòng chat đang chờ kết nối trong hàng đợi (`status = 'waiting'`).
- `PATCH /:id/accept` (Yêu cầu token + role healer): Healer nhận phòng chat. Cập nhật `healer_id` và đổi trạng thái phòng thành `active`.
- `PATCH /:id/close`: Đóng cuộc trò chuyện, đổi trạng thái thành `closed`.

#### tệp `src/routes/messages.routes.ts` (Yêu cầu token):
- `POST /`: Gửi tin nhắn mới vào phòng chat (lưu vào bảng `messages`). **CHÚ Ý: Không chấp nhận hay lưu trữ bất kỳ tệp tin hay hình ảnh nào, chỉ xử lý trường `content` dạng text**.
- `GET /:conversationId`: Lấy toàn bộ lịch sử tin nhắn trong phòng chat phục vụ render lịch sử.

#### tệp `src/routes/videos.routes.ts`:
- `GET /`: Lấy toàn bộ danh sách video ngắn trị liệu đã được phê duyệt từ bảng `videos`.

#### tệp `src/routes/ai.routes.ts` (Yêu cầu token):
- `POST /chat`: Nhận `{ personaId, userMessage, history }`. Gọi Gemini API đóng vai `personaId` phản hồi thấu cảm dựa trên ngữ cảnh lịch sử hội thoại được truyền lên.
- `POST /triage`: Nhận `{ plainText }`. Gọi Gemini API chạy ở chế độ JSON để phân tích nguy cơ tự hại của nhật ký (riskLevel: low/medium/high, mood, triggerSOS: boolean, suggestedResponse).
- `POST /moderation`: Nhận `{ content }`. Gọi Gemini API chạy ở chế độ JSON để kiểm duyệt bài viết cộng đồng (verdict: safe/flagged/blocked, triggerSOS: boolean, reason).

---

### 5. Thiết lập tệp Khởi chạy `src/index.ts`:
Đăng ký toàn bộ 7 route handlers trên vào ứng dụng Express. Cấu hình middleware CORS, JSON body parser. Lắng nghe trên cổng 3001 và hiển thị log thông báo khi khởi động thành công.

Hãy viết toàn bộ các tệp tin mã nguồn trên theo đúng chỉ dẫn TypeScript chặt chẽ.
```

---

## KIỂM TRA & XÁC MINH (Checklist cuối bước 2)

Sau khi AI Agent hoàn thành mã nguồn Backend, hãy xác nhận các mục kiểm thử sau:

- [ ] Chạy lệnh `npm run build` trong thư mục `backend/` không xuất hiện bất kỳ lỗi biên dịch TypeScript nào.
- [ ] Chạy lệnh `npm run dev` khởi động máy chủ thành công ở cổng `3001`.
- [ ] Test API `POST /api/auth/setup` trả về đúng token JWT hợp lệ chứa thông tin người dùng.
- [ ] Test API `POST /api/ai/chat` với `personaId: 'healer_linh'` trả về đúng giọng điệu thấu cảm thân thiện xưng hô "tớ/cậu" khớp với file `mock_data.js`.
- [ ] Test API `POST /api/ai/triage` trả về JSON đúng cấu trúc với các trường `riskLevel`, `mood`, `triggerSOS` khi truyền các từ khóa nhạy cảm.
- [ ] Xác nhận trong toàn bộ code backend tuyệt đối không có API endpoint hay logic nào hỗ trợ tải ảnh lên hoặc gửi ảnh đi (bảng `messages` và các model chỉ xử lý text).
