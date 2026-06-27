# Bước ADD-2: Nâng Cấp Tính Năng Chat Nâng Cao (AI Agent Prompt Guide)

## Hướng dẫn dành cho lập trình viên

Sao chép toàn bộ phần **PROMPT DÀNH CHO AI AGENT** dưới đây và dán vào công cụ AI Coding Assistant để nâng cấp giao diện và tính năng trò chuyện trực tiếp lên cấp độ chuyên nghiệp.

---

## PROMPT DÀNH CHO AI AGENT: TRẠNG THÁI TYPING, READ RECEIPTS & MESSAGE REACTIONS

```prompt
Bạn là một AI Coding Agent chuyên nghiệp. Hãy nâng cấp toàn bộ hệ thống chat 1-1 thời gian thực hiện có của dự án An Nhiên (cả Frontend và Backend) để bổ sung 3 tính năng nâng cao dưới đây. Bảo đảm mã nguồn TypeScript chặt chẽ và không chứa bất kỳ tính năng gửi ảnh hay upload ảnh nào.

### 1. Bối cảnh & Các tệp tin liên quan cần đọc trước:
- **Tệp tin giao diện Chat hiện tại**: Đọc kỹ `frontend/src/app/(main)/nhan-tin/page.tsx` (hoặc component `ChatInterface.tsx` liên quan) để hiểu cách thức hiển thị danh sách tin nhắn và kết nối WebSocket hiện có.
- **Tệp tin Backend Routes hiện tại**: Đọc kỹ `backend/src/routes/messages.routes.ts` để hiểu các endpoint gửi tin và lấy tin cũ.
- **Tệp tin schema cơ sở dữ liệu**: Đọc kỹ `database.sql` ở thư mục gốc để biết cấu trúc bảng `messages`.
- **Quy tắc nhất quán**:
  - Không phá vỡ luồng lưu trữ tin nhắn hiện tại. Bản nâng cấp chỉ đính kèm thêm metadata như trạng thái đã đọc (`is_read`) và danh sách cảm xúc thả trên tin nhắn (`reactions`).
  - Tuyệt đối không bổ sung nút gửi hình ảnh hay tài liệu nào vào khung chat. Chat vẫn phải là 100% text-only.

---

### 2. Triển khai Trạng thái Đang gõ chữ (Typing Indicators):
Sử dụng tính năng **Supabase Presence** chạy trên giao thức WebSocket để đồng bộ trạng thái soạn thảo tin nhắn thời gian thực:
- Sửa tệp giao diện Chat ở Frontend (`frontend/src/app/(main)/nhan-tin/page.tsx`):
  - Khi người dùng thay đổi text trong ô input, gọi hàm `chatChannel.track({ user_id, is_typing: true/false })` để cập nhật trạng thái online.
  - Thiết lập lắng nghe sự kiện `'presence'` trên channel chat. Khi nhận thấy đối phương đang gõ chữ (`is_typing === true`), hiển thị chỉ báo động dưới khung chat: *"Healer đang soạn tin nhắn..."* (hoặc ngược lại).

---

### 3. Triển khai Trạng thái Đã đọc (Read Receipts):
Đồng bộ trạng thái đã xem tin nhắn của cả hai phía:
- Sửa cấu trúc bảng `messages`: Chạy SQL script thêm cột `is_read` (BOOLEAN, mặc định `false`) vào bảng `messages` trên Supabase SQL Editor.
- Viết API Route trên Backend (`backend/src/routes/messages.routes.ts`):
  - Viết endpoint `PATCH /api/messages/read`: Nhận `{ conversationId }`. Thực hiện cập nhật toàn bộ các tin nhắn do đối phương gửi trong phòng chat này thành `is_read = true`.
- Cập nhật giao diện Chat ở Frontend:
  - Khi mở phòng chat, gọi ngay API `PATCH /api/messages/read` để cập nhật trạng thái.
  - Ở mỗi bong bóng tin nhắn của mình gửi đi, hiển thị một dấu tích xanh nếu `is_read === false` (Đã gửi), và hai dấu tích xanh nếu `is_read === true` (Đã đọc).
  - Lắng nghe cập nhật real-time bằng Supabase Realtime để cập nhật số lượng dấu tích ngay khi đối phương xem tin nhắn.

---

### 4. Triển khai Phản hồi Cảm xúc Tin nhắn (Message Reactions):
Cho phép người dùng thả emoji trực tiếp lên từng bong bóng tin nhắn văn bản của nhau để tăng tính thấu cảm:
- Sửa cấu trúc bảng `messages`: Chạy SQL script thêm cột `reactions` (JSONB, mặc định `'{}'::jsonb`) vào bảng `messages`.
- Viết API Route trên Backend (`backend/src/routes/messages.routes.ts`):
  - Viết endpoint `PATCH /api/messages/:id/react`: Nhận `{ emoji }` (ví dụ: '❤️', '🤝', '🙏', '🤗').
  - Đọc trường reactions hiện tại (cấu trúc JSONB dạng `{ "❤️": ["userId_1", "userId_2"] }`).
  - Nếu `userId` của người gọi đã tồn tại trong mảng của emoji đó, thực hiện xóa (hủy react). Nếu chưa, thêm `userId` vào mảng. Ghi đè JSONB mới vào database.
- Cập nhật giao diện Chat ở Frontend:
  - Khi nhấn giữ hoặc hover vào một tin nhắn, hiển thị thanh chứa 4 biểu tượng emoji chữa lành.
  - Khi click chọn emoji, gọi API `/api/messages/:id/react` gửi yêu cầu lên.
  - Hiển thị danh sách emoji đã được thả và số lượng đếm tương ứng nhỏ ở góc dưới bong bóng tin nhắn.

Hãy thực hiện triển khai toàn bộ các tệp tin trên theo đúng yêu cầu bằng mã nguồn hoàn chỉnh.
```

---

## KIỂM TRA & XÁC MINH (Checklist cuối bước ADD-2)

Sau khi AI Agent hoàn thành các tính năng chat nâng cao, hãy kiểm thử các mục sau:

- [ ] Mở song song 2 trình duyệt: Khi gõ chữ ở tab này, tab kia phải ngay lập tức hiển thị chỉ báo soạn thảo tin nhắn động ("Healer đang soạn tin nhắn...").
- [ ] Gửi tin nhắn đi hiển thị một dấu tích xám (Đã gửi), mở tab đối phương đọc tin nhắn -> Tab gửi phải chuyển ngay lập tức sang biểu tượng hai dấu tích xanh (Đã đọc) mà không cần tải lại trang.
- [ ] Nhấn giữ tin nhắn bất kỳ, bảng chọn emoji hiện ra. Chọn thả tim -> Emoji hiện nhỏ ở đáy bong bóng tin nhắn với số lượng đếm là 1. Bấm lại cùng emoji -> Biểu tượng biến mất thành công.
- [ ] Xác nhận hệ thống chat tuyệt đối bảo mật, không có bất kỳ nút bấm đính kèm tệp hay upload ảnh nào được tạo ra.
