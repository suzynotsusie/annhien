# Kế Hoạch Tính Năng & Thiết Kế — Vai Trò Người Dùng (User)

Tài liệu này đặc tả chi tiết toàn bộ các tính năng, giao diện, hiệu ứng tương tác và cơ chế an toàn dành riêng cho vai trò **Người dùng (User)** trong ứng dụng web **An Nhiên**. Toàn bộ giao diện người dùng (UI/UX) được thiết kế thuần Việt để tạo sự gần gũi, chỉ riêng phần lưu trữ cơ sở dữ liệu (Database) là sử dụng tiếng Anh để tối ưu hóa kỹ thuật.

---

## 1. Giao Diện Web Tương Thích & Trải Nghiệm Ban Đầu

Giao diện được thiết kế tối ưu hóa cho nền tảng **Web Responsive** (hoạt động mượt mà trên cả máy tính và điện thoại), áp dụng phong cách thiết kế hiện đại, nhẹ nhàng với các dải màu xanh xám (Sage Green) và tím nhạt (Lavender) xoa dịu thị giác.

### 🚀 Trải nghiệm nhập môn
*   Giao diện gồm các thẻ slide chuyển động mượt mà bằng CSS.
*   **Bước 1**: Giới thiệu không gian an toàn, ẩn danh tuyệt đối.
*   **Bước 2**: Hỏi biệt danh (nickname) để cá nhân hóa lời chào.
*   **Bước 3**: Chọn các chủ đề đang gặp áp lực (ví dụ: *Áp lực học tập, Gia đình, Mối quan hệ, Rối loạn giấc ngủ...*).

### 🔐 Đăng nhập ẩn danh & Thiết lập mật mã
*   **Không cần email hay số điện thoại**: Người dùng chỉ cần nhập một **mã PIN bảo mật** gồm 4-6 chữ số trên trình duyệt.
*   **Mã hóa đầu cuối**: Mã PIN này được dùng làm khóa mật mã để tự động mã hóa nhật ký của người dùng ngay trên thiết bị trước khi gửi lên máy chủ (lưu trữ database dưới dạng tiếng Anh/Mã hóa).

---

## 2. Bản Đồ Tính Năng Màn Hình Chính (Bảng điều khiển Web)

Giao diện Web sử dụng cấu trúc **Thanh điều hướng bên cạnh (Sidebar)** trên máy tính, tự động co gọn thành **Thanh điều hướng bên dưới (Bottom Nav)** trên điện thoại.

### 😊 Bộ công cụ Theo dõi Cảm xúc
*   **Lời chào động**: Tự động thay đổi theo thời gian thực (*Chào buổi sáng / chiều / tối*) kèm tên người dùng: *"Hôm nay cậu thấy thế nào, Dương?"*.
*   **5 nút cảm xúc**: Tuyệt vời 😊 | Ổn 🙂 | Bình thường 😐 | Mệt mỏi 😮‍💨 | Lo lắng 😟.
*   **Hiệu ứng Web**: Rê chuột (hover) phóng to nhẹ, phát sáng viền. Áp dụng chuyển động nảy vật lý (spring) để tăng tính phản hồi.

### 📓 Sổ tay Nhật ký Bảo mật
*   **Thiết kế phong cách tả thực (Skeuomorphic)**: Card mô phỏng sổ tay kẻ ngang mờ, vạch lề trái màu đỏ nhạt và dán băng keo vàng ở góc. Dòng chữ: *"Viết ra suy nghĩ, cảm xúc — không ai phán xét đâu 💛"*.
*   **Hành động**: Click vào sẽ mở ra **Trình soạn thảo Nhật ký** bảo mật:
    *   **Mã hóa đầu cuối**: Nội dung văn bản nhật ký được mã hóa bằng thuật toán đối xứng **AES-256-GCM** trực tiếp trên trình duyệt. Máy chủ database chỉ lưu trữ chuỗi ký tự đã mã hóa, không ai có thể đọc trộm.
    *   **Thống kê cảm xúc**: Chỉ có nhãn cảm xúc (lưu vào database dưới dạng trường `mood` tiếng Anh) là được lưu ở dạng rõ để vẽ biểu đồ xu hướng cảm xúc trong trang Hồ sơ.
    *   **Phân tích tâm trạng (AI Triage)**: Khi nhấn lưu, trình duyệt giải mã tạm thời trên RAM để gửi văn bản rõ qua HTTPS bảo mật đến API phân tích nguy cơ tự hại ngầm ( Gemini API). Kết quả nguy cơ được mã hóa ngược lại thiết bị.

### 🌿 Người đồng hành Trực tuyến
*   Băng chuyền ngang hiển thị thẻ thông tin các Người đồng hành (Peer Supporters) đang trực tuyến (chấm xanh lá). Người dùng có thể nhấn nút **"Trò chuyện ngay"** để kết nối 1-1.

### 📊 Thống kê Nhanh
*   Hiển thị chuỗi ngày viết nhật ký liên tục (Streak) và emoji cảm xúc trong ngày để khuyến khích duy trì thói quen tự quán chiếu bản thân.

### 💫 Lời nhắn Hôm nay
*   Thẻ hiển thị ngẫu nhiên các câu khẳng định tích cực bằng tiếng Việt để xoa dịu tâm hồn.

---

## 3. Các Phân Hệ Chức Năng Chính

### 👥 Phân hệ 1: Cộng đồng ẩn danh & Hệ thống Kiểm duyệt kép
*   **Mặc định ẩn danh**: Toàn bộ bài đăng và bình luận mặc định ẩn danh hoàn toàn để người dùng tự do chia sẻ mà không sợ lộ danh tính.
*   **Phân chia chủ đề**: Gắn thẻ bài đăng (*Áp lực học tập*, *Gia đình*, *Mối quan hệ*...).
*   **Tương tác đa vai trò**: Bác sĩ và Người đồng hành tham gia thảo luận, đăng bài viết bổ ích với huy hiệu nổi bật `[Bác sĩ]` hoặc `[Người đồng hành]`. Tương tác bằng các nút cảm xúc: `🤗 Ôm`, `💛 Đồng cảm`, `🌿 Bình an`.
*   **Hệ thống Kiểm duyệt kép**:
    *   **Lớp 1: Bộ lọc từ khóa cục bộ**: Quét nhanh chửi thề, tục tĩu bằng danh sách từ khóa cấm ngay tại client để chặn tức thời.
    *   **Lớp 2: Kiểm duyệt ngữ nghĩa bằng AI**: Quét sâu ngữ nghĩa để phát hiện các ý định tự hại ẩn ý hoặc tiếng lóng lách luật (*"reset game"*, *"đăng xuất"*). Bài đăng nghi ngờ sẽ bị tạm ẩn và chuyển vào hàng đợi duyệt của **Admin** (database lưu trạng thái `status = 'flagged'`).
    *   **Admin duyệt**: Quản trị viên xem xét để phê duyệt hiển thị hoặc ẩn vĩnh viễn.

### 🎥 Phân hệ 2: Trạm Chữa Lành
*   **Định dạng**: Bảng tin video ngắn dọc (Reels/Shorts 9:16) đã được Admin kiểm duyệt, tối ưu hóa hiển thị trên Web.
*   **Nội dung**: Các video ngắn do các Bác sĩ đăng tải chia sẻ bài tập thở giải tỏa lo âu, bài tập thiền nhanh, và kiến thức tâm lý ứng dụng.
*   **Tương tác**: Nhấn Tim (Like), Lưu video vào thư viện cá nhân (để xem lại trong Hồ sơ), hoặc chia sẻ trực tiếp video vào khung chat hỗ trợ.

### 💬 Phân hệ 3: Khung Chat thông minh
*   **Luồng chat 1-1 tinh giản (Không thu phí)**:
    *   **Luồng 1 (Chat với AI)**: Nhấn nút Trợ lý AI ở góc dưới phải để chat 1-1 với An Nhiên Bot (AI phản hồi bằng tiếng Việt thấu cảm).
    *   **Luồng 2 (Kết nối Người đồng hành/Bác sĩ)**: Người dùng có thể gửi yêu cầu kết nối trò chuyện trực tiếp 1-1 với Người đồng hành hoặc Bác sĩ chuyên khoa khi cần tư vấn chuyên môn sâu. Tất cả các phiên chat đều hoàn toàn miễn phí và ẩn danh.

---

## 4. Cơ Chế An Toàn Khẩn Cấp (SOS)

*   **Nút SOS nổi**: Luôn hiển thị ở góc màn hình. Khi click vào sẽ mở ra bảng thông tin các hotline khẩn cấp tại Việt Nam (Tổng đài 111, Đường dây nóng Ngày Mai, Hotline y tế) kèm nút nhấn gọi nhanh.
*   **AI phát hiện tự hại**: Tự động phát hiện nguy cơ tự tử hoặc tự làm đau bản thân để kích hoạt ngay hộp thoại xoa dịu cục bộ.
