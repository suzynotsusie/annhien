# Bước 4: Viết Nhật Ký Bảo Mật & Đánh Giá Tâm Trạng (AI Agent Prompt Guide)

## Hướng dẫn dành cho lập trình viên

Sao chép toàn bộ phần **PROMPT DÀNH CHO AI AGENT** dưới đây và dán vào công cụ AI Coding Assistant trong thư mục `frontend/` để xây dựng trang viết nhật ký tích hợp phân tích tâm trạng AI và cơ chế SOS khẩn cấp.

---

## PROMPT DÀNH CHO AI AGENT: XÂY DỰNG JOURNAL EDITOR, SOS MODAL & MOOD DASHBOARD

```prompt
Bạn là một AI Coding Agent chuyên nghiệp. Hãy viết mã nguồn cho tính năng viết nhật ký bảo mật và đánh giá cảm xúc nằm trong thư mục `frontend/` theo đúng các chỉ dẫn kỹ thuật dưới đây.

### 1. Bối cảnh & Các tệp tin liên quan cần đọc trước:
- **Tệp tin schema cơ sở dữ liệu**: Đọc kỹ cấu trúc bảng `journals` trong file `database.sql` để hiểu các trường dữ liệu cần lưu trữ (`id`, `user_id`, `encrypted_content`, `mood`, `created_at`).
- **Tệp tin đặc tả API và Backend Routes**:
  - Đọc `api-contract.md` để nắm chắc cấu trúc API lưu nhật ký (`POST /api/journals`), lấy danh sách nhật ký (`GET /api/journals/me`) và API phân tích tâm lý (`POST /api/ai/triage`).
  - Đọc các tệp tin backend route thực tế `backend/src/routes/journals.routes.ts` và `backend/src/routes/ai.routes.ts` để chắc chắn rằng các tham số truyền lên khớp hoàn toàn với những gì server Express đang chờ đợi.
- **Quy tắc nhất quán**:
  - Việc giải mã nhật ký cũ phải được thực hiện hoàn toàn ở phía client. API `GET /api/journals/me` của backend không trả về nội dung mã hóa, do đó khi lấy chi tiết cụ thể của một dòng nhật ký qua `GET /api/journals/:id`, client phải gọi hàm giải mã tương ứng.
  - Tuyệt đối không gửi hay lưu trữ hình ảnh kèm theo nhật ký. Cả giao diện và database đều chỉ xử lý text.

---

### 2. Tạo helper mã hóa đầu cuối E2EE giả lập tại `src/lib/crypto.ts`:
Viết 2 hàm mã hóa đối xứng giả lập chạy ở client để bảo mật văn bản nhật ký trước khi gửi lên lưu trữ ở server:
- `encryptClientSide(plainText: string): string`: chuyển đổi văn bản sang Base64 bằng cách sử dụng `btoa(encodeURIComponent(plainText))`.
- `decryptClientSide(cipherText: string): string`: giải mã Base64 ngược lại bằng `decodeURIComponent(atob(cipherText))`. Có cơ chế try-catch tránh crash ứng dụng khi giải mã sai hoặc gặp dữ liệu lỗi.

---

### 3. Xây dựng Hộp thoại Cứu trợ Khẩn cấp tại `src/components/ui/SOSModal.tsx`:
Tạo component `SOSModal` để cảnh báo và trợ giúp khẩn cấp khi người dùng có tâm trạng cực đoan hoặc ý định tự hại:
- **Giao diện**: Card nổi bật màu đỏ nhạt, thiết kế ấm áp, thấu cảm, khích lệ.
- **Nội dung**: Hiển thị thông điệp khuyên nhủ tùy biến của AI truyền vào.
- **Hotlines**: Hiển thị danh sách 2 hotline hỗ trợ trầm cảm/tự hại tại Việt Nam (Đường dây nóng Ngày Mai: 096 306 1414, Tổng đài MindCare: 1900 5999 30) có gắn link gọi điện trực tiếp `href="tel:..."`.
- **Nút hành động**: Nút "Kết nối ngay với Người đồng hành" nổi bật. Khi click sẽ tự động chuyển hướng người dùng sang trang chat `/nhan-tin` và tự động kích hoạt phiên kết nối live Healer.

---

### 4. Xây dựng Trình soạn thảo Nhật ký tại `src/components/features/JournalEditor.tsx`:
Tạo component `JournalEditor` cho phép viết nhật ký:
- **Mood Picker**: Grid hiển thị 5 mức cảm xúc (Rất tốt, Ổn, Bình thường, Mệt mỏi, Lo lắng) tương ứng với các icon thấu cảm.
- **Textarea**: Vùng nhập văn bản nhật ký trút bầu tâm sự.
- **Logic xử lý khi Lưu (Save Handler)**:
  1. Gửi request `POST http://localhost:3001/api/ai/triage` truyền lên văn bản rõ (plaintext) trong body JSON để AI phân tích tâm lý.
  2. Đọc kết quả phân tích: Nếu `triggerSOS === true` hoặc `riskLevel === 'high'`, lập tức kích hoạt bật `SOSModal` và truyền thông điệp khuyên nhủ của AI vào.
  3. Nếu an toàn, tiến hành mã hóa văn bản rõ bằng `encryptClientSide(content)`.
  4. Gửi request `POST http://localhost:3001/api/journals` truyền lên `{ encryptedContent, mood }` để lưu vào PostgreSQL.
  5. Reset form và gọi callback thông báo lưu thành công để tải lại lịch sử.

---

### 5. Xây dựng Trang chủ Chữa lành tại `src/app/(main)/trang-chu/page.tsx`:
Viết trang chủ tích hợp toàn bộ các thành phần:
- **Lời chào cá nhân**: Lấy `annhien_nickname` từ `localStorage` để hiển thị lời chào động theo buổi.
- **Vòng tròn tập thở chánh niệm**: Vẽ một vòng tròn gradient Sage Green lớn ở trung tâm. Áp dụng class `.animate-breathe` để vòng tròn tự động phồng to thu nhỏ nhịp nhàng hướng dẫn hít thở.
- **JournalEditor**: Nhúng component soạn thảo nhật ký và quản lý trạng thái đóng/mở `SOSModal`.
- **Lịch sử Nhật ký (History List)**: Gọi API `GET http://localhost:3001/api/journals/me` để lấy danh sách. Hiển thị dưới dạng dòng thời gian. Khi click vào một dòng nhật ký, hiển thị nội dung sau khi đã giải mã bằng `decryptClientSide(encrypted_content)`.
- **Biểu đồ Cảm xúc (Mood Chart)**: Tính toán phần trăm 5 loại cảm xúc từ lịch sử nhật ký và vẽ biểu đồ thanh ngang đơn giản bằng CSS Tailwind.

Hãy triển khai toàn bộ các tệp tin trên bằng mã nguồn TypeScript hoàn chỉnh.
```

---

## KIỂM TRA & XÁC MINH (Checklist cuối bước 4)

Sau khi AI Agent hoàn thành mã nguồn giao diện Nhật ký, hãy kiểm tra các hành vi sau:

- [ ] Truy cập `http://localhost:3000/trang-chu` hiển thị đúng biệt danh đã đăng ký trong Onboarding và vòng tròn tập thở co giãn đều đặn.
- [ ] Viết một tâm sự bình thường và bấm Lưu, dòng nhật ký mới xuất hiện trong lịch sử bên dưới. Vào database Supabase kiểm tra cột `encrypted_content` phải là chuỗi Base64 đã mã hóa.
- [ ] Nhấp vào dòng nhật ký cũ trong lịch sử, giao diện giải mã thành công và hiển thị đúng văn bản gốc ban đầu.
- [ ] Thử viết một nhật ký chứa từ khóa cực đoan ("muốn tự tử", "muốn reset game"), hệ thống phải kích hoạt bật ngay **SOS Emergency Modal** màu đỏ trên màn hình.
- [ ] Bấm nút kết nối trên SOS Modal chuyển hướng thành công sang trang `/nhan-tin`.
