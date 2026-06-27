# Bước ADD-4: Tính Năng Bác Sĩ — Tải Video Trị Liệu & Duyệt Nội Dung (AI Agent Prompt Guide)

## Hướng dẫn dành cho lập trình viên

Sao chép toàn bộ phần **PROMPT DÀNH CHO AI AGENT** dưới đây và dán vào công cụ AI Coding Assistant để xây dựng tính năng tải video ngắn của Bác sĩ và hàng đợi phê duyệt chuyên môn dành cho Admin.

---

## PROMPT DÀNH CHO AI AGENT: VIDEO STORAGE UPLOAD & ADMIN APPROVAL WORKFLOW

```prompt
Bạn là một AI Coding Agent chuyên nghiệp. Hãy triển khai tính năng tải lên video ngắn trị liệu (.mp4) của Bác sĩ và quy trình kiểm duyệt phê duyệt của Admin cho dự án An Nhiên (cả Frontend và Backend) theo đúng các yêu cầu kỹ thuật dưới đây.

### 1. Bối cảnh & Các tệp tin liên quan cần đọc trước:
- **Tệp tin Backend Routes hiện có**: Đọc kỹ `backend/src/routes/videos.routes.ts` để hiểu cách thức API lấy danh sách video đã được xây dựng từ trước.
- **Tệp tin schema cơ sở dữ liệu**: Đọc kỹ cấu trúc bảng `videos` trong file `database.sql` để hiểu các trường dữ liệu (`id`, `doctor_id`, `title`, `topic`, `video_url`, `description`, `status`, `likes`, `saved`, `created_at`).
- **Giao diện Doctor Dashboard hiện tại**: Đọc kỹ cấu trúc trang `frontend/src/app/doctor/page.tsx` (nếu có) hoặc cách tổ chức trang để nhúng Tab tải lên phù hợp.
- **Quy tắc nhất quán**:
  - Trạng thái mặc định của video vừa tải lên phải là `pending`. Chỉ sau khi được Admin phê duyệt (`approved`), video mới được hiển thị công khai ở Trạm Chữa Lành của người dùng.
  - Video được lưu trữ thực tế trên Supabase Storage bucket tên là `healing-videos`.
  - Không được phép bổ sung hay liên kết bất kỳ tính năng tải ảnh nào trong quy trình này.

---

### 2. Cấu hình Kho lưu trữ video (Supabase Storage):
Tạo file SQL `storage_policies.sql` để chạy trên Supabase SQL Editor cấu hình phân quyền cho bucket `healing-videos` ở chế độ Public:
- Viết Storage Policy cho phép Bác sĩ (`role === 'doctor'`) được quyền tải lên (upload) video vào thư mục cá nhân trong bucket: `healing-videos`.
- Viết Storage Policy cho phép mọi người (kể cả khách) được quyền đọc (select) xem video.

---

### 3. Viết API quản lý Video trên Backend (`backend/src/routes/videos.routes.ts`):
- `POST /` (Yêu cầu token + role doctor): Nhận `{ title, videoUrl, topic, description }` từ client. Thực hiện lưu thông tin video mới vào bảng `videos` với trạng thái mặc định `status = 'pending'`.
- `GET /pending` (Yêu cầu token + role admin): Lấy toàn bộ danh sách các video đang ở trạng thái chờ duyệt (`status = 'pending'`).
- `PATCH /:id/status` (Yêu cầu token + role admin): Nhận `{ status }` (một trong `['approved', 'rejected']`) để Admin phê duyệt hoặc từ chối video.
- **Tương tác Like/Save (RPC Functions)**:
  - Viết 2 SQL function chạy trong Supabase SQL Editor:
    - `increment_video_likes(video_id UUID)`: cộng 1 vào cột `likes` của bảng `videos`.
    - `decrement_video_likes(video_id UUID)`: trừ 1 vào cột `likes` (giới hạn tối thiểu bằng 0).
  - Viết API Route `POST /:id/like` để gọi hàm RPC tương ứng cập nhật lượt tim trong DB thực tế.

---

### 4. Xây dựng Dashboard cho Bác sĩ (Frontend):
Tạo tệp tin `frontend/src/app/doctor/page.tsx` dành riêng cho Bác sĩ (Kiểm tra phân quyền `role === 'doctor'` từ JWT):
- **Tab 1 — Tải video mới**:
  - Thiết kế vùng kéo thả file (Drag & Drop Zone) viền nét đứt bo tròn màu Sage Green nhẹ nhàng. Chỉ nhận file `.mp4` dung lượng dưới 100MB.
  - Hiển thị tên file và thanh tiến trình tải lên (Progress Bar) chạy động từ `0%` đến `100%`.
  - Sử dụng `@supabase/supabase-js` để upload tệp tin thẳng lên bucket `healing-videos` của Supabase Storage.
  - Sau khi upload thành công, lấy Public URL của tệp tin gửi request `POST http://localhost:3001/api/videos` sang backend để lưu metadata.
- **Tab 2 — Video của tôi**:
  - Hiển thị danh sách video đã đăng kèm badge trạng thái tương ứng: `⏳ Chờ duyệt` (Vàng), `✅ Đã xuất bản` (Xanh lá), `❌ Từ chối` (Đỏ).

---

### 5. Nâng cấp Bảng điều khiển Admin để Duyệt Video:
Cập nhật tệp `frontend/src/app/admin/page.tsx`:
- Thêm tab "Duyệt video". Gọi API `GET http://localhost:3001/api/videos/pending` lấy danh sách chờ.
- Mỗi card video hiển thị tiêu đề, tên bác sĩ gửi và nhúng một **trình phát video nhỏ (HTML5 Video Player)** để Admin có thể xem trực tiếp nội dung trước khi bấm duyệt.
- Thiết kế 2 nút hành động gọi API PATCH status để Admin bấm "Phê duyệt" hoặc "Từ chối" tức thời.

Hãy triển khai toàn bộ các tệp tin trên theo đúng yêu cầu bằng mã nguồn TypeScript hoàn chỉnh.
```

---

## KIỂM TRA & XÁC MINH (Checklist cuối bước ADD-4)

Sau khi AI Agent hoàn thành mã nguồn tải video và kiểm duyệt, hãy kiểm thử các mục sau:

- [ ] Tài khoản Bác sĩ đăng nhập vào trang `/doctor`, thực hiện kéo thả tệp tin `.mp4` thành công, thanh tiến trình hiển thị đúng phần trăm tải lên.
- [ ] Vào mục Storage của Supabase Dashboard, xác nhận tệp tin video đã được lưu trữ chính xác trong bucket `healing-videos`.
- [ ] Tài khoản Admin đăng nhập vào trang `/admin`, nhìn thấy video vừa tải lên hiển thị trong hàng đợi, có thể bấm nút Play xem trực tiếp video bình thường.
- [ ] Admin bấm "Phê duyệt" -> Video biến mất khỏi hàng chờ. Quay lại trang `/doctor` của Bác sĩ, video đó phải tự động cập nhật trạng thái sang badge màu xanh `Đã xuất bản` thời gian thực.
- [ ] Quay lại trang Trạm Chữa Lành của người dùng `/tram-chua-lanh`, video vừa được duyệt phải xuất hiện công khai trên bảng tin và cuộn xem bình thường.
- [ ] Xác nhận không có tính năng xử lý hình ảnh nào được tích hợp vào luồng tải video này.
