# Bước 6: Trạm Chữa Lành & Trò Chuyện Trực Tiếp (AI Agent Prompt Guide)

## Hướng dẫn dành cho lập trình viên

Sao chép toàn bộ phần **PROMPT DÀNH CHO AI AGENT** dưới đây và dán vào công cụ AI Coding Assistant trong thư mục `frontend/` để xây dựng Trạm Chữa Lành (Video Shorts) và Hệ thống Chat kết nối Hybrid thời gian thực giữa Healer và User.

---

## PROMPT DÀNH CHO AI AGENT: XÂY DỰNG VIDEO SHORTS & HYBRID REALTIME CHAT

```prompt
Bạn là một AI Coding Agent chuyên nghiệp. Hãy viết mã nguồn cho tính năng video trị liệu ngắn và hệ thống phòng chat 1-1 realtime (kết hợp Healer người thật và AI Fallback) trong thư mục `frontend/` theo đúng các chỉ dẫn kỹ thuật dưới đây.

### 1. Bối cảnh & Các tệp tin liên quan cần đọc trước:
- **Tệp tin cơ sở dữ liệu**: Đọc kỹ file `database.sql` để hiểu cấu trúc các bảng `conversations`, `messages`, và `videos` cùng các khóa ngoại và cột trạng thái liên quan.
- **Tệp dữ liệu mẫu**: Đọc `frontend/src/lib/mock-data.ts` (được tạo ở Bước 0) để đồng bộ thông tin của 5 Bác sĩ, 5 Healers và 6 Videos mẫu (khớp trường `id`, `name`, `avatar`, `videoUrl` của Mixkit).
- **Tệp tin Backend Routes**:
  - Đọc `backend/src/routes/conversations.routes.ts` để hiểu cách khởi tạo, xếp hàng đợi và tiếp nhận cuộc trò chuyện.
  - Đọc `backend/src/routes/messages.routes.ts` để gửi và lấy tin nhắn.
  - Đọc `backend/src/routes/videos.routes.ts` để lấy danh sách video trị liệu.
  - Đọc `backend/src/routes/ai.routes.ts` để kết nối API chat của Gemini AI.
- **Quy tắc nhất quán**:
  - Khung chat của MVP là hoàn toàn text-only. Tuyệt đối không thiết kế các nút upload ảnh, gửi file, ghi âm hay chụp hình.
  - Cần đăng ký Supabase Realtime (WebSocket) chính xác ở Client để lắng nghe trực tiếp sự thay đổi trên hai bảng `conversations` (để nhận biết khi nào Healer nhận ca) và `messages` (để hiển thị tin nhắn mới ngay lập tức).

---

### 2. Xây dựng Trạm Chữa Lành tại `src/app/(main)/tram-chua-lanh/page.tsx`:
Trạm chữa lành hiển thị danh sách video ngắn hướng dẫn trị liệu từ Bác sĩ theo dạng cuộn dọc toàn màn hình (TikTok style):
- **Bố cục cuộn**: Sử dụng lớp CSS `scroll-snap-type: y mandatory` để vuốt chuyển video mượt mà trên cả desktop và di động.
- **Component Trình phát Video (VideoPlayer.tsx)**:
  - Sử dụng thẻ `<video>` HTML5 với các thuộc tính `loop`, `muted`, `playsInline` và loại bỏ hoàn toàn controls mặc định.
  - Sử dụng **Intersection Observer** để tự động phát (`play()`) video khi slide cuộn qua hiển thị đầy đủ trên màn hình, và tự động dừng (`pause()`) khi cuộn đi.
  - Hiển thị lớp thông tin phủ (overlay) ở góc dưới trái gồm: Tiêu đề video, mô tả và tên Bác sĩ đã kiểm duyệt video đó.
  - Thanh công cụ tương tác ở góc phải gồm: Nút bật/tắt tiếng (Mute/Unmute), Nút thả tim (Like) và Nút lưu video vào danh sách yêu thích.
  - Gọi API `GET http://localhost:3001/api/videos` để lấy danh sách tệp video thật từ cơ sở dữ liệu.

---

### 3. Xây dựng Kênh Chat kết nối Hybrid tại `src/app/(main)/nhan-tin/page.tsx`:
Hệ thống chat 1-1 thời gian thực hỗ trợ người dùng vượt qua khủng hoảng tâm lý, tích hợp WebSocket và AI dự phòng:
- **CHÚ Ý QUAN TRỌNG VỀ BẢO MẬT**: Khung chat chỉ hỗ trợ nhập liệu và gửi tin nhắn dạng văn bản (text), tuyệt đối không có bất kỳ nút đính kèm tệp, nút chụp ảnh, nút gửi ảnh hay logic nào liên quan đến truyền tải hình ảnh.

#### Luồng hoạt động của phòng chat:
1. **Yêu cầu kết nối**: Nếu chưa có phiên chat active, hiển thị màn hình chờ kèm nút "Kết nối với Người đồng hành". Khi click sẽ gọi API `POST http://localhost:3001/api/conversations` (tạo conversation ở trạng thái `waiting`).
2. **Kích hoạt Realtime cập nhật ca trực**: Thiết lập lắng nghe WebSocket của **Supabase Realtime** trực tiếp vào bảng `conversations` lọc theo `conversationId`. Khi cột `status` chuyển sang `active` và có `healer_id` (nghĩa là có Healer thật nhận hỗ trợ), lập tức chuyển sang màn hình chat 1-1 và hiển thị tên Healer.
3. **Đăng ký tin nhắn thời gian thực**: Thiết lập lắng nghe Supabase Realtime vào bảng `messages` lọc theo `conversation_id`. Khi có tin nhắn mới insert, lập tức cập nhật vào danh sách hiển thị trên màn hình chat của cả 2 phía mà không cần tải lại trang.
4. **Gửi tin nhắn**: Form chat gửi tin nhắn văn bản gọi tới API `POST http://localhost:3001/api/messages`.

#### 🤖 Logic AI Persona Tự Động (Fallback Agent):
- Khi bắt đầu chờ kết nối ở Bước 1, thiết lập một đồng hồ đếm ngược **15 giây**.
- Nếu sau 15 giây phòng chat vẫn ở trạng thái `waiting` (không có Healer người thật nào trực tuyến nhấn nhận ca), client sẽ tự động chuyển phòng chat sang **Chế độ AI**.
- Thay đổi tên hiển thị người chat thành: "Linh (AI đồng hành)".
- Khi User gửi tin nhắn:
  1. Gọi API `POST http://localhost:3001/api/ai/chat` truyền lên `{ personaId: 'healer_linh', userMessage, history }` để nhận phản hồi thấu cảm từ Gemini.
  2. Ngay sau khi nhận câu trả lời từ AI, frontend gọi tiếp API `POST http://localhost:3001/api/messages` để lưu câu trả lời của AI vào bảng `messages` trong database thực tế với role là `'ai'`, bảo đảm lịch sử chat được lưu trữ đồng bộ.

---

### 4. Xây dựng Dashboard cho Healer tại `src/app/healer/page.tsx`:
Trang làm việc dành riêng cho tài khoản người đồng hành (`role === 'healer'`):
- **Hàng đợi ca trực**: Gọi API `GET http://localhost:3001/api/conversations/queue` lấy danh sách phòng chat đang chờ kết nối.
- **AI Insights hiển thị**: Mỗi card yêu cầu trong hàng đợi hiển thị biệt danh user, thời gian chờ và đặc biệt là đoạn **AI Insights** (tóm tắt tâm lý) do Gemini phân tích từ nhật ký trước đó để Healer chuẩn bị tinh thần tiếp cận.
- **Hành động tiếp nhận**: Healer bấm "Nhận hỗ trợ" -> gọi API `PATCH http://localhost:3001/api/conversations/:id/accept` và chuyển hướng Healer sang giao diện chat để trao đổi trực tiếp.

Hãy triển khai toàn bộ các tệp tin trên bằng mã nguồn TypeScript hoàn chỉnh.
```

---

## KIỂM TRA & XÁC MINH (Checklist cuối bước 6)

Sau khi AI Agent hoàn thành mã nguồn media và chat, hãy kiểm tra các hành vi sau:

- [ ] Mở trang `/tram-chua-lanh`, video ngắn tự động phát tiếng suối chảy/tiếng thở khi cuộn qua và tự động dừng khi cuộn đi. Nút bật/tắt tiếng hoạt động tốt.
- [ ] Bấm nút "Kết nối với Người đồng hành" trên trang `/nhan-tin` tạo thành công conversation ở trạng thái `waiting` trong DB.
- [ ] Mở song song 2 trình duyệt: 1 tab User đang chờ kết nối, 1 tab Healer mở trang `/healer`. Màn hình Healer phải hiển thị phòng chờ kèm đoạn phân tích **AI Insights** động từ database.
- [ ] Healer bấm "Nhận hỗ trợ" -> Phòng chat bên User phải tự động chuyển sang trạng thái `active` ngay lập tức (dưới 1 giây) nhờ kết nối WebSocket. Hai bên gõ tin nhắn văn bản và nhận được của nhau tức thời.
- [ ] Khung chat hoàn toàn không có bất kỳ tính năng hay nút đính kèm ảnh nào.
- [ ] Kiểm tra tính năng **AI Fallback**: Cho User yêu cầu kết nối và để im không cho Healer nhận ca. Sau đúng 15 giây, phòng chat phải tự động chuyển sang chế độ AI, hiển thị "Linh (AI đồng hành)". Khi gửi tin nhắn, AI phản hồi thấu cảm và câu trả lời của AI được lưu vào bảng `messages` của database thành công.
