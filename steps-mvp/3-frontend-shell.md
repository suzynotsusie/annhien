# Bước 3: Giao Diện Khung & Onboarding (AI Agent Prompt Guide)

## Hướng dẫn dành cho lập trình viên

Sao chép toàn bộ phần **PROMPT DÀNH CHO AI AGENT** dưới đây và dán vào công cụ AI Coding Assistant trong thư mục `frontend/` để xây dựng giao diện khung và luồng đăng ký ban đầu.

---

## PROMPT DÀNH CHO AI AGENT: XÂY DỰNG FRONTEND SHELL & ONBOARDING FLOW

```prompt
Bạn là một AI Coding Agent chuyên nghiệp. Hãy viết mã nguồn cho hệ thống giao diện Next.js 14 App Router trong thư mục `frontend/src/` theo đúng các chỉ dẫn giao diện (UI/UX) thuần Việt ấm áp, kính mờ (Glassmorphism) dưới đây.

### 1. Bối cảnh & Các tệp tin liên quan cần đọc trước:
- **Tệp tin cấu hình và CSS**: Đọc kỹ `frontend/package.json` và `frontend/src/app/globals.css` để kiểm tra các thư viện đã được khai báo (như `framer-motion`, `lucide-react`) và sẵn sàng cho việc sử dụng các class Tailwind tùy chỉnh.
- **Tệp tin hợp đồng API**: Đọc kỹ `api-contract.md` ở thư mục gốc để nắm chắc cấu trúc API đăng ký ẩn danh `POST /api/auth/setup`, các tham số đầu vào (`nickname`, `topics`, `role`) và dữ liệu trả về (`token`, `userId`, `nickname`).
- **Quy tắc nhất quán**: 
  - Đảm bảo lưu đúng các khóa `annhien_token`, `annhien_user_id`, `annhien_nickname` vào `localStorage` sau khi đăng ký thành công.
  - Tuyệt đối không thiết kế hay xây dựng tính năng upload avatar, chụp ảnh hay bất cứ hình thức gửi file ảnh nào trong luồng onboarding. Tên người dùng và avatar của bác sĩ/healer sẽ là tĩnh.

---

### 2. Xây dựng Hệ thống Thiết kế (Design System) tại `src/app/globals.css`:
Hãy ghi đè nội dung file này để cấu hình các tiện ích Tailwind CSS tùy chỉnh:
- Class `.glass-card`: nền trắng mờ `rgba(255, 255, 255, 0.65)`, làm mờ hậu cảnh `backdrop-filter: blur(16px)`, viền mờ màu trắng, bóng đổ nhẹ ấm áp màu xanh lá (`rgba(132, 192, 137, 0.15)`).
- Class `.glass-input`: nền trắng mờ, viền mờ xanh lá khi active.
- Class `.btn-primary`: gradient từ xanh lá cây nhạt (`#57a35e`) sang xanh lá cây đậm (`#3d8744`), chữ trắng, bo tròn, hiệu ứng bóng đổ.
- Class `.btn-secondary`: nền trắng mờ, viền xám nhạt, hover đổi nền xám nhạt.
- Utility `.animate-breathe`: chạy hiệu ứng vòng tròn tập thở giãn nở trong 19 giây (Hít vào 4 giây -> Giữ hơi 7 giây -> Thở ra 8 giây).

---

### 3. Thiết lập Khung điều hướng Đáp ứng (Responsive App Shell Layout):
Hãy tạo các thành phần giao diện bố cục sau:

#### tệp `src/components/layout/Sidebar.tsx` (Desktop Sidebar):
- Thanh điều hướng bên trái màn hình cố định (fixed) chỉ hiển thị trên desktop (`hidden md:flex`).
- Chứa logo "An Nhiên" và menu các liên kết: Trang chủ (`/trang-chu`), Cộng đồng (`/cong-dong`), Trạm chữa lành (`/tram-chua-lanh`), Cá nhân (`/ho-so`).

#### tệp `src/components/layout/BottomNav.tsx` (Mobile Bottom Navigation):
- Thanh điều hướng cố định ở đáy màn hình chỉ hiển thị trên điện thoại di động (`md:hidden`).
- Chứa các icon tương tự dẫn tới 4 trang chính.

#### tệp `src/app/(main)/layout.tsx`:
- Bố cục layout bọc ngoài cho các trang chính. 
- Tự động hiển thị Sidebar ở bên trái trên desktop và chừa khoảng trống `pl-64` cho nội dung chính, đồng thời hiển thị BottomNav ở đáy trên mobile và chừa khoảng trống `pb-16`.

---

### 4. Xây dựng Trình Đăng Ký Ẩn Danh (3-Step Onboarding Flow):
Hãy viết tệp tin `src/app/onboarding/page.tsx` sử dụng React state để quản lý một trình wizard 3 bước:
- **Bước 1 — Chào mừng**: Giới thiệu sứ mệnh ẩn danh bảo mật của An Nhiên, cam kết không yêu cầu thông tin cá nhân.
- **Bước 2 — Chủ đề áp lực**: Hiển thị danh sách các chủ đề áp lực để người dùng tích chọn chọn (áp lực học tập, kỳ vọng gia đình, cô đơn bạn bè, burnout hàng ngày, nỗi sợ khác).
- **Bước 3 — Biệt danh**: Ô nhập biệt danh ẩn danh tùy chọn (không có trường tải ảnh hay gửi ảnh).

#### Logic kết nối API:
Khi nhấn nút "Bắt đầu ngay" ở Bước 3:
1. Gửi request `POST http://localhost:3001/api/auth/setup` với body JSON chứa `{ nickname, topics, role: 'user' }`.
2. Nhận response chứa `{ token, userId, nickname }`.
3. Lưu 3 giá trị trên vào `localStorage` của trình duyệt dưới các khóa tương ứng (`annhien_token`, `annhien_user_id`, `annhien_nickname`).
4. Chuyển hướng người dùng sang trang chủ `/trang-chu` bằng `router.push()`.

Sử dụng thư viện `framer-motion` để tạo hiệu ứng chuyển bước trượt ngang mượt mà. Đảm bảo giao diện mang tone màu chủ đạo xanh lá (Sage), tím nhạt (Lavender) xoa dịu thị giác.
```

---

## KIỂM TRA & XÁC MINH (Checklist cuối bước 3)

Sau khi AI Agent tạo xong khung giao diện, hãy chạy kiểm thử các mục sau:

- [ ] Lệnh `npm run dev` ở frontend chạy không lỗi, mở trình duyệt truy cập `http://localhost:3000/onboarding` hiển thị đúng giao diện onboarding.
- [ ] Trải nghiệm luồng Onboarding 3 bước hoạt động trơn tru với các hiệu ứng chuyển động mượt mà của Framer Motion.
- [ ] Nhập biệt danh và bấm Hoàn tất gọi thành công tới API setup của backend ở cổng 3001 mà không bị chặn bởi lỗi CORS.
- [ ] Xác nhận trong `localStorage` của trình duyệt đã lưu trữ chính xác các khóa `annhien_token` và `annhien_user_id` và `annhien_nickname`.
- [ ] Thu nhỏ trình duyệt về kích thước di động (mobile screen): Sidebar biến mất và Bottom Nav xuất hiện ở đáy màn hình chính xác.
