# Kế Hoạch Triển Khai MVP An Nhiên — Real PostgreSQL + Tách Frontend/Backend (4-Hour Hackathon Plan)

Tài liệu này hướng dẫn định hướng phát triển nhanh trong 4 giờ hackathon, tích hợp **cơ sở dữ liệu PostgreSQL thực tế trên Supabase**, **máy chủ Express.js kết nối Gemini AI**, và **giao diện Next.js 14** thuần Việt tuyệt đẹp.

---

## 1. Bản Đồ Lập Trình Hệ Thống MVP (System Architecture Map)

| Tính năng chính | Frontend (Next.js 14) | Backend (Express.js + Gemini) | Database (Supabase PostgreSQL) |
| :--- | :--- | :--- | :--- |
| **Giao diện & Onboarding** | Next.js 14 App Router, Tailwind CSS, Framer Motion. Form đăng ký biệt danh ẩn danh. | `POST /api/auth/setup` tạo user, ký và trả về mã JWT. | Lưu thông tin user vào bảng `users`. |
| **Sổ tay & Cảm xúc (E2EE)** | Mood picker 5 cấp độ. Mã hóa Base64 phía client trước khi gửi. Giải mã tại client bằng mã PIN. | `POST /api/journals` lưu nhật ký.<br>`GET /api/journals/me` lấy danh sách. | Lưu nhật ký mã hóa vào bảng `journals`. |
| **Phân tích Nguy cơ & SOS** | Gửi văn bản chưa mã hóa qua request RAM. Hiển thị **SOS Modal** khi phát hiện nguy kịch. | `POST /api/ai/triage` phân tích tâm lý bằng Gemini (trả về JSON nguy cơ). | Đánh giá mức độ rủi ro cảm xúc để cảnh báo khẩn cấp. |
| **Cộng đồng ẩn danh** | Bảng tin confession chia theo 5 chủ đề áp lực. Nút thả cảm xúc: Ôm, Đồng cảm, Bình yên. | `GET /api/posts` công khai.<br>`POST /api/posts` (chạy AI moderation).<br>`POST /api/posts/:id/react`. | Lưu bài viết vào bảng `posts` và lượt tương tác vào `post_reactions`. |
| **Kiểm duyệt Admin** | Trang quản trị `/admin` lọc các bài viết bị AI gắn cờ (`status = 'flagged'`). | `GET /api/posts/flagged`<br>`PATCH /api/posts/:id/status` để duyệt/ẩn. | Cập nhật `status` bài viết thành `'public'` hoặc `'hidden'`. |
| **Trạm Chữa Lành** | Trình phát video ngắn dọc (TikTok style), tự động phát khi cuộn qua, trích dẫn Bác sĩ. | `GET /api/videos` lấy danh sách video đã duyệt của Bác sĩ. | Lưu liên kết MP4 trực tiếp và mô tả vào bảng `videos`. |
| **Chat kết nối Hybrid** | Kết nối real-time qua WebSocket. Đợi quá 15s tự động chuyển sang AI Persona (Gemini). | `POST /api/conversations` bắt đầu chờ.<br>`POST /api/messages` gửi tin.<br>`POST /api/ai/chat` gọi Gemini trả lời. | Quản lý phiên trong bảng `conversations` và tin nhắn trong `messages`. |

---

## 2. Kịch Bản Demo Tối Ưu Cho Ban Giám Khảo (Hackathon Happy Path)

Khi thuyết trình trước Ban Giám Khảo (BGK), hãy mở song song hai trình duyệt độc lập để demo luồng tương tác thực tế:

*   **Trình duyệt A (User - Mây Nhỏ)**: Trình diễn hành trình của người dùng trẻ đang gặp khủng hoảng.
*   **Trình duyệt B (Healer/Admin - Linh Healer)**: Trình diễn phản ứng điều phối hỗ trợ và kiểm duyệt thời gian thực.

### Luồng Demo 7 bước thuyết phục:

1.  **Bước 1 (Đăng ký ẩn danh)**: User Mây Nhỏ đăng ký ẩn danh qua 3 bước Onboarding cực mượt, chọn chủ đề áp lực thi cử và gia đình. Nhận mã JWT lưu trữ tại LocalStorage.
2.  **Bước 2 (Viết nhật ký & Phân tích tâm lý)**: Mây Nhỏ chọn cảm xúc `tired` (Mệt mỏi), ghi nhật ký: *"Hôm nay học hành áp lực quá, điểm số sa sút..."*. Hệ thống lưu nhật ký dạng mã hóa E2EE và hiển thị câu khích lệ từ AI.
3.  **Bước 3 (Kích hoạt SOS khẩn cấp)**: Mây Nhỏ viết tiếp một dòng tâm sự tuyệt vọng: *"Tớ mệt mỏi quá rồi, chỉ muốn biến mất, muốn reset game cho xong..."*. Hệ thống ngay lập tức phát hiện từ khóa nguy hiểm qua Gemini, không đăng bài lên cộng đồng và tự động bật **SOS Emergency Modal** hiển thị hotline hỗ trợ.
4.  **Bước 4 (Kết nối Live Healer)**: Từ SOS Modal, Mây Nhỏ click nút *"Kết nối với Người đồng hành"*. Hệ thống chuyển sang phòng chat và hiển thị vòng xoay đang kết nối.
5.  **Bước 5 (Healer nhận ca chat)**: Trên Trình duyệt B (Healer), Linh Healer nhìn thấy yêu cầu trong hàng đợi kèm dòng **AI Insights** của Gemini phân tích tình trạng của Mây Nhỏ. Linh bấm *"Nhận hỗ trợ"*. Hai bên chat real-time bằng WebSocket của Supabase cực nhanh.
6.  **Bước 6 (Trò chuyện tự động AI Fallback)**: Giả định Healer bận, sau 15 giây hệ thống tự động định tuyến chat sang **Linh (AI đồng hành)**. AI chat bằng giọng điệu gần gũi thấu cảm của Linh Healer, lưu toàn bộ lịch sử vào DB thực tế.
7.  **Bước 7 (Cộng đồng & Trạm Chữa Lành)**: Trình diễn việc thả tim tương tác thấu cảm trên feed cộng đồng và vuốt xem các video thở chánh niệm ở Trạm Chữa Lành.

---

## 3. Phân Chia Vai Trò Nhóm Lập Trình (Team Coordination)

*   **Dev 1 (Frontend Lead / UI System)**: Setup Next.js, cấu hình globals.css, code giao diện App Shell, Onboarding, Trang chủ, và Mood Picker.
*   **Dev 2 (Backend / AI / DB Engineer)**: Setup Express.js, thiết lập Supabase PostgreSQL schema, cấu hình Gemini Client, viết 15 API routes, và viết SQL script nạp dữ liệu mẫu (Seed Data).
*   **Dev 3 (Community / Admin Features)**: Code Bảng tin cộng đồng ẩn danh, đăng bài kiểm duyệt, nút cảm xúc thấu cảm, và Dashboard kiểm duyệt bài đăng cho Admin.
*   **Dev 4 (Media / Hybrid Chat System)**: Code Trạm Chữa Lành (Video Shorts) vuốt dọc, hệ thống phòng chat 1-1 realtime (WebSocket Supabase), và logic tích hợp AI Persona tự động.
