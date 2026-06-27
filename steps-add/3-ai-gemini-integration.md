# Bước ADD-3: AI Trị Liệu Nâng Cao (AI Agent Prompt Guide)

## Hướng dẫn dành cho lập trình viên

Sao chép toàn bộ phần **PROMPT DÀNH CHO AI AGENT** dưới đây và dán vào công cụ AI Coding Assistant để nâng cấp các tính năng trí tuệ nhân tạo (AI) lên cấp độ chuyên nghiệp, cá nhân hóa sâu sắc cho người dùng.

---

## PROMPT DÀNH CHO AI AGENT: LONG-TERM MEMORY, AUTO SESSION SUMMARY & GROWTH REPORTS

```prompt
Bạn là một AI Coding Agent chuyên nghiệp. Hãy xây dựng các tính năng AI nâng cao sử dụng Gemini 1.5 Flash API cho dự án An Nhiên (cả Frontend và Backend) theo đúng các chỉ dẫn kỹ thuật dưới đây.

### 1. Bối cảnh & Các tệp tin liên quan cần đọc trước:
- **Tệp cấu hình Gemini hiện tại**: Đọc kỹ `backend/src/lib/gemini.ts` để nắm được cách khởi tạo client và sử dụng model `gemini-1.5-flash` và các System Prompts của 10 personas.
- **Tệp các route AI hiện có**: Đọc kỹ `backend/src/routes/ai.routes.ts` để hiểu các endpoint phân tích tâm trạng (`/triage`) và chat thấu cảm (`/chat`).
- **Tệp tin schema cơ sở dữ liệu**: Đọc kỹ cấu trúc các bảng `users`, `journals`, và `conversations` trong `database.sql` để hiểu cách lưu trữ thông tin bộ nhớ và lịch sử cảm xúc.
- **Quy tắc nhất quán**:
  - Không thay đổi hoặc làm sai lệch 10 giọng điệu (personas) đã định nghĩa trước đó. Bản nâng cấp chỉ đính kèm thêm ngữ cảnh bộ nhớ dài hạn vào system instructions.
  - Tuyệt đối không cho phép sinh bất cứ đường dẫn hình ảnh hay trả về hình ảnh nào từ AI. Tất cả kết quả trả về của AI phải là văn bản thuần túy hoặc định dạng Markdown ấm áp.

---

### 2. Triển khai Bộ nhớ Hội thoại Dài hạn (Long-term Session Memory):
Giúp các AI Personas ghi nhớ thói quen, sở thích và những sự kiện lớn của người dùng qua nhiều ngày:
- Sửa cấu trúc bảng `users`: Thêm cột `ai_memory` (TEXT, mặc định NULL) vào bảng `users` trên database.
- Sửa tệp `backend/src/routes/ai.routes.ts` ở endpoint `POST /api/ai/chat`:
  1. Trước khi gọi Gemini, đọc dữ liệu cột `ai_memory` của user đó từ bảng `users`.
  2. Chèn bộ nhớ dài hạn này vào làm một phần của `systemInstruction` khi tạo Gemini Model (Ví dụ: *"Đây là bộ nhớ dài hạn về người bạn này: {ai_memory}"*).
  3. Cấu hình Gemini phản hồi dựa trên toàn bộ bối cảnh hệ thống + lịch sử chat + bộ nhớ dài hạn này.

---

### 3. Triển khai Tự động Tóm tắt Ca trực khi Đóng phòng (Auto-Summarizer):
Khi một phiên chat 1-1 đóng lại, hệ thống tự động tóm tắt để Healer ca sau đọc được:
- Sửa tệp `backend/src/routes/conversations.routes.ts` ở endpoint `PATCH /:id/close`:
  1. Khi nhận yêu cầu đóng phòng, trước khi cập nhật status, đọc toàn bộ lịch sử tin nhắn của cuộc trò chuyện đó từ bảng `messages`.
  2. Định dạng hội thoại thành một văn bản chuỗi (transcript).
  3. Gọi Gemini API với System Prompt: *"Bạn là trưởng nhóm cố vấn tâm lý. Hãy viết một bản tóm tắt ca trực ngắn gọn (dưới 100 từ) gồm: Lý do bế tắc của người dùng, phản ứng của Healer và khuyến nghị theo dõi tiếp theo."*
  4. Nhận kết quả tóm tắt và cập nhật đè vào trường `ai_insights` của conversation đó, đồng thời cập nhật `status = 'closed'`.

---

### 4. Triển khai Báo cáo Tiến trình Sức khỏe Tinh thần 30 ngày (Growth Reports):
Phân tích lịch sử tâm trạng của người dùng để gửi thư động viên cá nhân hóa:
- Viết API Route trên Backend (`backend/src/routes/ai.routes.ts`):
  - Viết endpoint `POST /api/ai/growth-report` (Yêu cầu token):
    1. Đọc toàn bộ lịch sử nhật ký (`mood` và `created_at`) trong 30 ngày qua của user từ bảng `journals`.
    2. Nếu số lượng dòng nhật ký dưới 3, trả về thông báo cần viết thêm nhật ký.
    3. Định dạng danh sách cảm xúc thành chuỗi dữ liệu.
    4. Gọi Gemini API với System Prompt: *"Bạn là chuyên gia tư vấn tâm lý học đường. Đọc danh sách theo dõi tâm trạng của người dùng thời gian qua, phân tích xu hướng cảm xúc và viết một bức thư gửi người dùng bằng tiếng Việt xưng hô 'tớ - cậu' cực kỳ ấm áp, ghi nhận nỗ lực của họ và đề xuất 2 bài tập tự chăm sóc bản thân thực tế."*
    5. Trả về bức thư dưới định dạng Markdown.
- Cập nhật giao diện Hồ sơ ở Frontend (`frontend/src/app/(main)/ho-so/page.tsx`):
  - Thêm nút "Tạo báo cáo tiến trình cảm xúc bằng AI". Khi click, gọi API `/api/ai/growth-report` hiển thị vòng xoay đang phân tích, sau đó kết xuất bức thư ấm áp của AI bằng thẻ render Markdown tuyệt đẹp.

Hãy thực hiện triển khai toàn bộ các tệp tin trên theo đúng yêu cầu bằng mã nguồn TypeScript hoàn chỉnh.
```

---

## KIỂM TRA & XÁC MINH (Checklist cuối bước ADD-3)

Sau khi AI Agent hoàn thành nâng cấp các tính năng AI, hãy kiểm thử các mục sau:

- [ ] Chat với AI Healer Linh và nói một thông tin quan trọng (Ví dụ: *"Tớ chuẩn bị thi tốt nghiệp vào tuần tới"*). Đóng app và mở lại, AI phải chủ động hỏi thăm về kỳ thi tốt nghiệp của bạn (Xác nhận bộ nhớ dài hạn hoạt động).
- [ ] Tiến hành một phiên chat giữa User và Healer. Healer bấm nút "Đóng phòng chat" -> Vào database Supabase kiểm tra bảng `conversations` phải thấy cột `ai_insights` được tự động cập nhật một đoạn tóm tắt ca trực dưới 100 từ rất mạch lạc của Gemini.
- [ ] Vào trang cá nhân `/ho-so`, bấm nút "Tạo báo cáo tiến trình cảm xúc" (Đảm bảo tài khoản đã có ít nhất 3 ngày viết nhật ký khác nhau) -> Giao diện hiển thị đúng bức thư phân tích xu hướng cảm xúc thấu cảm bằng định dạng Markdown từ Gemini.
- [ ] Thử tạo báo cáo khi tài khoản chưa viết đủ 3 ngày nhật ký, hệ thống phải hiển thị thông báo khích lệ viết thêm nhật ký thay vì báo lỗi crash.
