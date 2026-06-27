# Bước ADD-1: Nâng Cấp Xác Thực & Phân Quyền Bảo Mật (AI Agent Prompt Guide)

## Hướng dẫn dành cho lập trình viên

Sao chép toàn bộ phần **PROMPT DÀNH CHO AI AGENT** dưới đây và dán vào công cụ AI Coding Assistant để nâng cấp hệ thống xác thực và bảo mật cơ sở dữ liệu trên dự án của bạn.

---

## PROMPT DÀNH CHO AI AGENT: HASH PIN SERVER-SIDE, SUPABASE AUTH & RLS POLICIES

```prompt
Bạn là một AI Coding Agent chuyên nghiệp. Hãy nâng cấp hệ thống xác thực và thắt chặt phân quyền bảo mật cho toàn bộ dự án An Nhiên (cả Frontend và Backend) theo đúng các yêu cầu kỹ thuật dưới đây.

### 1. Bối cảnh & Các tệp tin liên quan cần đọc trước:
- **Tệp tin cơ sở dữ liệu hiện tại**: Đọc `database.sql` để hiểu cấu trúc 7 bảng hiện tại và cách các bảng liên kết với `users.id` làm khóa ngoại.
- **Tệp tin Auth Routes hiện tại**: Đọc `backend/src/routes/auth.routes.ts` để xem cách backend hiện tại đang xử lý `/setup` và ký token JWT đơn giản từ thông tin biệt danh.
- **Tệp tin Onboarding ở Frontend**: Đọc `frontend/src/app/onboarding/page.tsx` để xem cách màn hình onboarding đang lưu trữ token và userId vào localStorage.
- **Quy tắc nhất quán**:
  - Không phá vỡ cấu trúc bảng hiện tại; chỉ bổ sung các cột cần thiết (ví dụ: `pin_hash` trong bảng `users` thay cho mã PIN thô, nếu trước đó có dùng).
  - Đảm bảo việc nâng cấp lên xác thực thực tế không làm gián đoạn luồng trải nghiệm ẩn danh của người dùng. Email OTP chỉ được yêu cầu khi họ muốn lưu trữ dài hạn hoặc đồng bộ dữ liệu.
  - Tuyệt đối không thêm bất kỳ logic upload ảnh nào.

---

### 2. Thắt chặt Bảo mật Cơ sở dữ liệu (Supabase SQL Editor):
Hãy tạo tệp tin `database_rls.sql` chứa các câu lệnh SQL bật tính năng **Row-Level Security (RLS)** trên 7 bảng của database và thiết lập các chính sách (Policies) truy cập khắt khe sau:
- **users**: Cho phép đọc và cập nhật hồ sơ cá nhân chỉ khi `auth.uid() = id`.
- **journals**: Chỉ cho phép chủ sở hữu nhật ký đọc, thêm và xóa nhật ký của chính mình (`auth.uid() = user_id`).
- **posts**: Mọi người (kể cả khách chưa đăng nhập) đều được đọc bài viết có `status = 'public'`. Chỉ người dùng đã đăng nhập mới được tạo bài đăng mới (`auth.uid() = author_id`).
- **conversations**: Chỉ cho phép User tạo phòng hoặc Healer tham gia phòng chat được truy cập dữ liệu (`auth.uid() = user_id OR auth.uid() = healer_id`).
- **messages**: Chỉ cho phép thành viên của phòng chat (user hoặc healer tương ứng) được quyền đọc hoặc gửi tin nhắn.

---

### 3. Hash PIN bảo mật phía Backend:
Khi người dùng đăng ký hoặc đổi mã PIN bảo mật cho nhật ký, backend tuyệt đối không được lưu mã PIN thô (plaintext).
- Sửa tệp `backend/src/routes/auth.routes.ts`:
  - Cài đặt thư viện `bcryptjs` làm dependency.
  - Viết hoặc nâng cấp endpoint `POST /api/auth/register-secure`: Nhận `{ nickname, pin, userId }`.
  - Thực hiện mã hóa một chiều mã PIN 6 số bằng `bcrypt.hash(pin, 10)` để tạo `pinHash`.
  - Cập nhật thông tin `nickname` và `pin_hash` tương ứng của user đó trong bảng `users` bằng Supabase client.
- Sửa lại các hàm kiểm tra mã PIN khi giải mã nhật ký ở các route liên quan để đối chiếu hash bằng `bcrypt.compare()`.

---

### 4. Tích hợp Supabase Auth SDK phía Frontend:
Thay thế cơ chế tạo tài khoản setup ẩn danh custom bằng cách tích hợp trực tiếp **Supabase Auth SDK**:
- Sửa tệp `frontend/src/lib/auth.ts`:
  - Khai báo hàm `signInWithEmailOTP(email: string)` để hỗ trợ đăng nhập không mật khẩu (Passwordless Sign-In) bằng mã OTP gửi về email thông qua `supabase.auth.signInWithOtp()`.
  - Khai báo hàm `signOut()` để hủy session của người dùng thông qua `supabase.auth.signOut()`.
- Tạo tệp `frontend/src/lib/auth-context.tsx`:
  - Viết một React Context `AuthContext` và hook `useAuth()` để theo dõi trạng thái đăng nhập thời gian thực của người dùng (`supabase.auth.onAuthStateChange`).
  - Cung cấp đối tượng `user` và biến trạng thái `loading` cho toàn bộ ứng dụng.
- Bọc ứng dụng Next.js bằng `AuthProvider` tại tệp `frontend/src/app/layout.tsx`.

Hãy thực hiện triển khai toàn bộ các tệp tin trên bằng mã nguồn TypeScript chặt chẽ, tối ưu bảo mật.
```

---

## KIỂM TRA & XÁC MINH (Checklist cuối bước ADD-1)

Sau khi AI Agent hoàn thành nâng cấp xác thực và bảo mật, hãy kiểm thử các mục sau:

- [ ] Các bảng dữ liệu trên Supabase đã được bật tính năng Row-Level Security (RLS) thành công (Chạy thử query từ client không có auth phải bị từ chối truy cập).
- [ ] Đăng ký người dùng mới, kiểm tra trường `pin_hash` trong bảng `users` của PostgreSQL phải lưu chuỗi ký tự hash của bcrypt (Ví dụ: `$2a$10$...`), tuyệt đối không lưu mã PIN thô.
- [ ] Giao diện đăng nhập gửi thành công yêu cầu OTP về email của người dùng thông qua dịch vụ Auth của Supabase.
- [ ] Trạng thái phiên đăng nhập (Session) được theo dõi ổn định bằng `AuthContext` ở frontend, tự động chuyển hướng người dùng khi session hết hạn hoặc đăng xuất.
- [ ] Xác nhận không có chức năng gửi ảnh nào được lồng ghép vào hệ thống.
