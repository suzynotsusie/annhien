# Bước 7: Tích Hợp Hệ Thống, Nạp Dữ Liệu & Hướng Dẫn Thuyết Trình (AI Agent Prompt Guide)

## Hướng dẫn dành cho lập trình viên

Sao chép toàn bộ phần **PROMPT DÀNH CHO AI AGENT** dưới đây và dán vào công cụ AI Coding Assistant ở thư mục gốc của dự án để tạo tập lệnh nạp dữ liệu mẫu (Seed Data) và hoàn thiện hệ thống phục vụ buổi demo thuyết trình trước Ban giám khảo.

---

## PROMPT DÀNH CHO AI AGENT: NẠP DỮ LIỆU SEED DATABASE & KỊCH BẢN DEMO

```prompt
Bạn là một AI Coding Agent chuyên nghiệp. Hãy viết mã nguồn và chuẩn bị dữ liệu mẫu (Database Seeding) cho dự án An Nhiên theo đúng các chỉ dẫn kỹ thuật dưới đây.

### 1. Bối cảnh & Các tệp tin liên quan cần đọc trước:
- **Tệp tin schema cơ sở dữ liệu**: Đọc kỹ cấu trúc 7 bảng trong `database.sql` để hiểu các ràng buộc khóa ngoại (foreign key constraints), khóa chính (primary key), các kiểu dữ liệu và thứ tự chèn dữ liệu hợp lệ (ví dụ: chèn bảng `users` trước khi chèn vào `videos` hoặc `posts`).
- **Tệp tin dữ liệu mẫu gốc**: Đọc kỹ file `mock_data.js` ở thư mục gốc của dự án để đảm bảo dữ liệu chèn vào PostgreSQL trùng khớp hoàn toàn (100%) về ID, tên nhân vật, vai trò, đường dẫn avatar và đặc biệt là các đường dẫn URL video trực tiếp (Mixkit CDN) nhằm tránh lỗi không tải được video khi demo.
- **Quy tắc nhất quán**:
  - Không tự chế các ID ngẫu nhiên cho nhân vật nếu chúng đã được định nghĩa trong `mock_data.js` để tránh mismatch liên kết dữ liệu giữa client và server.
  - Đảm bảo các bài đăng cộng đồng mẫu không chứa bất kỳ hình ảnh nào.

---

### 2. Tạo tập lệnh SQL Nạp Dữ liệu Mẫu (seed_data.sql):
Tạo file `seed_data.sql` tại thư mục root để tôi có thể sao chép chạy trên Supabase SQL Editor. Tập lệnh này phải nạp đầy đủ dữ liệu mẫu sạch vào database phục vụ chạy thử sản phẩm, bao gồm các dữ liệu sau:

#### A. Nạp 5 Bác sĩ và 5 Healers thực tế vào bảng `users` (đảm bảo đúng ID và Role):
- Bác sĩ 1 (`doc_1`): ThS. BS Nguyễn Lân Hương, Chuyên gia Tâm lý Lâm sàng.
- Bác sĩ 2 (`doc_2`): TS. BS Trần Hoàng Nam, Chuyên gia Trị liệu Gia đình & Trầm cảm.
- Bác sĩ 3 (`doc_3`): ThS. BS Mai Khánh Chi, Chuyên gia Chữa lành Cảm xúc & Mối quan hệ.
- Bác sĩ 4 (`doc_4`): TS. BS Lê Đức Minh, Chuyên gia Tâm lý Thanh thiếu niên.
- Bác sĩ 5 (`doc_5`): ThS. BS Phùng Thị Mai Anh, Chuyên gia Lo âu Xã hội & Phát triển Cá nhân.
- Healer 1 (`heal_1`): Linh Healer (Peer Supporter).
- Healer 2 (`heal_2`): Minh Healer (Peer Supporter).
- Healer 3 (`heal_3`): Hà An Healer (Peer Supporter).
- Healer 4 (`heal_4`): Thu Hằng Healer (Peer Supporter).
- Healer 5 (`heal_5`): Bảo Khánh Healer (Peer Supporter).
- Tạo thêm 1 tài khoản Admin (`BBBBBBBB-BBBB-BBBB-BBBB-BBBBBBBBBBBB`) tên Quản trị viên An Nhiên để test duyệt bài.

#### B. Nạp 6 Video ngắn trị liệu gắn với Bác sĩ duyệt vào bảng `videos` (khớp hoàn hảo URL từ `mock_data.js`):
- Video 1: "Bài tập thở hạ hỏa tức thì 4-7-8 🌿" gắn với `doc_1`. Link video: `https://assets.mixkit.co/videos/preview/mixkit-meditating-woman-by-the-sea-43093-large.mp4`.
- Video 2: "Chữa lành tâm hồn cùng tiếng suối rừng 🍃" gắn với `doc_2`. Link video: `https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4`.
- Video 3: "Âm thanh tiếng mưa giúp ngủ ngon và giảm lo âu 🌧️" gắn với `doc_3`. Link video: `https://assets.mixkit.co/videos/preview/mixkit-rain-drops-on-a-window-1521-large.mp4`.
- Video 4: "Chánh niệm: Đi bộ thư giãn trong rừng nắng ☀️" gắn với `doc_2`. Link video: `https://assets.mixkit.co/videos/preview/mixkit-man-walking-in-a-sunny-forest-44917-large.mp4`.
- Video 5: "Bình minh mới — Tìm lại hy vọng mỗi sáng 🌅" gắn với `doc_4`. Link video: `https://assets.mixkit.co/videos/preview/mixkit-sunrise-nature-placeholder-large.mp4`.
- Video 6: "Sóng biển — Buông bỏ và thở 🌊" gắn với `doc_5`. Link video: `https://assets.mixkit.co/videos/preview/mixkit-waves-beach-placeholder-large.mp4`.

#### C. Nạp 5 Bài viết mẫu ẩn danh phong phú vào bảng `posts`:
- Viết sẵn 5 bài đăng confession chia sẻ tâm tư thấu cảm về áp lực thi cử, mâu thuẫn gia đình, cô đơn học đường của giới trẻ Việt kèm các số lượng reactions ngẫu nhiên đã có sẵn để bảng tin cộng đồng trông sinh động khi vừa mở app.

---

### 3. Viết tài liệu Kịch bản Thuyết trình Demo (Happy Path Presentation Guide):
Tạo file `HACKATHON_DEMO.md` tại thư mục root trình bày chi tiết kịch bản 7 bước cho nhóm thuyết trình. Hãy viết tài liệu này bằng tiếng Việt cực kỳ rõ ràng:
- **Chuẩn bị**: Mở 2 cửa sổ trình duyệt đặt song song trên màn hình:
  - Cửa sổ A (Bên trái): Giao diện người dùng User (Mây Nhỏ).
  - Cửa sổ B (Bên phải): Giao diện Healer / Admin (Linh Healer).
- **Bước 1 — Onboarding**: Mây Nhỏ đăng ký ẩn danh, chọn áp lực gia đình.
- **Bước 2 — Nhật ký & AI Triage**: Viết nhật ký buồn -> AI trả về lời khuyên khích lệ.
- **Bước 3 — SOS Khẩn cấp**: Viết nhật ký chứa từ khóa *"chán sống, muốn reset game"* -> Hệ thống tự động chặn đăng bài công khai, bật ngay **SOS Emergency Modal** chứa hotline cứu hộ.
- **Bước 4 — Gửi yêu cầu hỗ trợ**: Mây Nhỏ nhấn kết nối với Healer trên SOS Modal, hiển thị trạng thái chờ.
- **Bước 5 — Healer tiếp nhận & Chat realtime**: Healer Linh bên Cửa sổ B thấy phòng chờ kèm phân tích **AI Insights** của Gemini, bấm "Nhận hỗ trợ". Hai bên chat văn bản real-time mượt mà qua WebSocket.
- **Bước 6 — AI Fallback Agent**: Mô phỏng khi Healer ngoại tuyến, sau 15 giây hệ thống tự chuyển phòng chat sang **Linh AI Persona** tự động trả lời thấu cảm bằng Gemini.
- **Bước 7 — Trạm Chữa Lành**: Lướt feed cộng đồng ẩn danh thả cảm xúc Ôm/Bình yên và cuộn xem video shorts thở thiền.

Hãy tạo ra các file dữ liệu và tài liệu kịch bản thuyết trình trên theo đúng yêu cầu.
```

---

## KIỂM TRA & XÁC MINH (Checklist cuối bước 7)

Sau khi AI Agent hoàn thành các tệp tin tích hợp và nạp dữ liệu, hãy kiểm tra các mục sau:

- [ ] File `seed_data.sql` được tạo ở root chứa đầy đủ mã SQL nạp đúng 10 tài khoản (5 bác sĩ, 5 healers), 6 videos trị liệu và 5 bài đăng cộng đồng mẫu.
- [ ] Chạy SQL Script này thành công trên Supabase SQL Editor không gặp lỗi cú pháp hay ràng buộc khóa ngoại (foreign keys).
- [ ] Mở ứng dụng, bảng tin cộng đồng và danh sách video trị liệu ở Trạm Chữa Lành phải hiển thị đầy đủ thông tin mẫu phong phú vừa nạp.
- [ ] File `HACKATHON_DEMO.md` được tạo ở root chứa đúng 7 bước kịch bản demo phân chia song song 2 trình duyệt để đội ngũ tập dượt.
- [ ] Xác nhận hệ thống phân tách hoạt động trơn tru 100% từ frontend đến backend và database thực tế, sẵn sàng cho buổi trình diễn giật giải.
