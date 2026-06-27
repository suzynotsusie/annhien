# Bước 5: Cộng Đồng Ẩn Danh & Kiểm Duyệt Admin (AI Agent Prompt Guide)

## Hướng dẫn dành cho lập trình viên

Sao chép toàn bộ phần **PROMPT DÀNH CHO AI AGENT** dưới đây và dán vào công cụ AI Coding Assistant trong thư mục `frontend/` để xây dựng trang cộng đồng ẩn danh, các tương tác thấu cảm và trang quản trị kiểm duyệt dành cho Admin.

---

## PROMPT DÀNH CHO AI AGENT: XÂY DỰNG COMMUNITY FEED, COMFORTING REACTIONS & ADMIN DASHBOARD

```prompt
Bạn là một AI Coding Agent chuyên nghiệp. Hãy viết mã nguồn cho tính năng cộng đồng ẩn danh và trang quản trị Admin nằm trong thư mục `frontend/` theo đúng các chỉ dẫn kỹ thuật dưới đây.

### 1. Bối cảnh & Các tệp tin liên quan cần đọc trước:
- **Tệp tin schema cơ sở dữ liệu**: Đọc kỹ cấu trúc bảng `posts` và `post_reactions` trong file `database.sql` để hiểu các trường dữ liệu và ràng buộc khóa ngoại (ví dụ: `author_id`, `content`, `topic`, `status`, `author_label`, `reactions` JSONB).
- **Tệp tin Backend Routes**:
  - Đọc `backend/src/routes/posts.routes.ts` để hiểu rõ endpoint lấy bài viết (`GET /api/posts`), đăng bài viết ẩn danh (`POST /api/posts`), thả cảm xúc (`POST /api/posts/:id/react`), lấy bài bị cắm cờ (`GET /api/posts/flagged`), và phê duyệt bài viết (`PATCH /api/posts/:id/status`).
  - Đọc `backend/src/routes/ai.routes.ts` để hiểu API kiểm duyệt bài viết `POST /api/ai/moderation`.
- **Thành phần UI có sẵn**:
  - Đọc và tái sử dụng component `SOSModal.tsx` tại `src/components/ui/SOSModal.tsx` đã được tạo ở Bước 4 để hiển thị can thiệp khẩn cấp nếu người dùng đăng bài viết có ý định tự hại.
- **Quy tắc nhất quán**:
  - Đăng bài viết cộng đồng là ẩn danh tuyệt đối. Bài viết được lưu trữ và hiển thị dưới dạng văn bản thuần túy (text-only). Tuyệt đối không được phép thiết kế bất cứ tính năng tải ảnh, đính kèm file hay lưu trữ link ảnh nào.
  - Phân quyền trang Admin: Phải kiểm tra thông tin JWT trong `localStorage` để chắc chắn người dùng có `role === 'admin'` trước khi cho phép xem hàng đợi kiểm duyệt.

---

### 2. Xây dựng Bảng tin Cộng đồng tại `src/app/(main)/cong-dong/page.tsx`:
Trang cộng đồng là nơi người dùng trẻ tuổi chia sẻ áp lực cuộc sống một cách ẩn danh hoàn toàn:
- **Bộ lọc chủ đề**: Thanh tab ngang để chọn xem tất cả hoặc lọc theo các chủ đề (Học tập, Gia đình, Bạn bè, Hàng ngày, Khác).
- **Form đăng bài ẩn danh**: 
  - Textarea nhập nội dung giới hạn tối đa 500 ký tự.
  - Dropdown chọn chủ đề bài đăng.
  - **CHÚ Ý QUAN TRỌNG VỀ BẢO MẬT**: Form đăng bài chỉ chấp nhận văn bản thuần túy, tuyệt đối không có nút đính kèm ảnh, nút tải ảnh hay bất kỳ trường dữ liệu hình ảnh nào.
  - **Logic xử lý đăng bài (AI Moderation Integration)**:
    1. Khi người dùng nhấn nút gửi, trước tiên gọi API kiểm duyệt `POST http://localhost:3001/api/ai/moderation` gửi nội dung lên để quét độc hại.
    2. Nếu AI trả về `verdict === 'blocked'`: Chặn đăng bài, hiển thị thông báo bài viết vi phạm tiêu chuẩn cộng đồng.
    3. Nếu AI trả về `verdict === 'flagged'` và `triggerSOS === true`: Lưu bài đăng ẩn ở DB thông qua API `POST /api/posts` (bài viết sẽ ở trạng thái flagged, không hiển thị công khai trên feed), đồng thời lập tức kích hoạt mở **SOS Emergency Modal** (sử dụng component đã tạo ở Bước 4) để can thiệp kịp thời giúp người viết.
    4. Nếu AI trả về `verdict === 'safe'`: Gọi API `POST /api/posts` gửi dữ liệu lên lưu DB, bài đăng được hiển thị công khai ngay lập tức trên bảng tin.

---

### 3. Triển khai Nút Tương tác Thấu cảm (Comforting Reactions Component):
Dưới mỗi card bài viết confession trên bảng tin, thiết kế thành phần thả cảm xúc:
- Hiển thị 3 nút bấm tương tác: `🤗 Ôm chặt`, `🤝 Đồng cảm`, `🌿 Bình yên` kèm bộ đếm số lượng.
- Khi người dùng bấm nút:
  1. Gọi API `POST http://localhost:3001/api/posts/:id/react` truyền lên body `{ reaction: 'hug' | 'empathy' | 'peace' }`.
  2. API sẽ trả về danh sách đếm mới và trạng thái reaction của user.
  3. Cập nhật state cục bộ để hiển thị viền highlight nút tương cảm mà user đã chọn. Cơ chế backend JWT sẽ bảo đảm mỗi user chỉ chọn tối đa 1 reaction trên mỗi bài để chống spam.

---

### 4. Xây dựng Trang quản trị Admin tại `src/app/admin/page.tsx`:
Trang này dành riêng cho tài khoản Quản trị viên (`role === 'admin'`) để duyệt các bài đăng bị AI cắm cờ cảnh báo:
- **Phân quyền bảo mật**: Đọc token trong `localStorage`, nếu người dùng không phải là `admin`, chuyển hướng về trang chủ hoặc thông báo lỗi không có quyền truy cập.
- **Hàng đợi kiểm duyệt (Flagged Queue)**: Gọi API `GET http://localhost:3001/api/posts/flagged` để lấy toàn bộ các bài đăng đang ở trạng thái `flagged`.
- **Hành động phê duyệt**: Mỗi card bài viết flagged hiển thị nội dung và 2 nút bấm:
  - Nút "Duyệt bài" (Approve): Gọi API `PATCH http://localhost:3001/api/posts/:id/status` truyền lên `{ status: 'public' }`. Bài viết biến mất khỏi hàng đợi và xuất hiện công khai trên bảng tin chung.
  - Nút "Ẩn bài" (Hide/Reject): Gọi API `PATCH http://localhost:3001/api/posts/:id/status` truyền lên `{ status: 'hidden' }`. Bài viết biến mất vĩnh viễn.

Hãy thực hiện triển khai toàn bộ các tệp tin trên bằng mã nguồn TypeScript chặt chẽ, tối ưu trải nghiệm người dùng.
```

---

## KIỂM TRA & XÁC MINH (Checklist cuối bước 5)

Sau khi AI Agent hoàn thành mã nguồn Cộng đồng & Admin, hãy kiểm tra các hành vi sau:

- [ ] Mở trang `/cong-dong`, lướt feed đọc được các confession mẫu và lọc chủ đề theo các tab hoạt động bình thường.
- [ ] Giao diện đăng bài cộng đồng hoàn toàn sạch sẽ, không chứa bất kỳ nút đính kèm ảnh hay upload ảnh nào.
- [ ] Thử đăng một bài viết chứa từ ngữ tục tĩu vi phạm, hệ thống phải chặn lại ngay lập tức và hiển thị thông báo lỗi.
- [ ] Thử đăng bài viết có dấu hiệu tự hại cực đoan ("reset game"), bài viết phải không được xuất hiện trên bảng tin chung và hệ thống lập tức bật ngay **SOS Emergency Modal** khẩn cấp.
- [ ] Bấm thả cảm xúc Ôm/Đồng cảm trên các card bài viết, số đếm phản hồi tăng/giảm chính xác khi bấm lại để hủy.
- [ ] Giả lập tài khoản Admin đăng nhập vào trang `/admin`, nhìn thấy bài đăng bị flagged vừa tạo ở trên, bấm "Duyệt bài" -> bài viết biến mất khỏi hàng chờ và xuất hiện công khai trên trang `/cong-dong` thành công.
