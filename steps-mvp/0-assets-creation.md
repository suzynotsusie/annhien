# Bước 0: Tạo Assets — Ảnh Nhân Vật & Video (AI Agent Prompt Guide)

## Hướng dẫn dành cho lập trình viên

Sao chép toàn bộ phần **PROMPT DÀNH CHO AI AGENT** dưới đây và dán vào công cụ AI Coding Assistant trong thư mục `frontend/` để khởi tạo tài nguyên và tạo tệp tin `mock-data.ts` đồng bộ.

---

## PROMPT DÀNH CHO AI AGENT: KHỞI TẠO TÀI NGUYÊN & MOCK DATA

```prompt
Bạn là một AI Coding Agent chuyên nghiệp. Hãy viết mã nguồn thiết lập tài nguyên hình ảnh, video và tệp tin dữ liệu giả lập cho dự án An Nhiên trong thư mục `frontend/` theo đúng các chỉ dẫn kỹ thuật dưới đây.

### 1. Bối cảnh & Các tệp tin liên quan cần đọc trước:
- **Tệp tin tham chiếu**: Đọc tệp `mock_data.js` ở thư mục gốc của dự án (nếu có) để hiểu cấu trúc và dữ liệu mẫu của 5 Bác sĩ, 5 Healers, và 6 Videos.
- **Yêu cầu đồng bộ**: Đảm bảo tệp tin `mock-data.ts` mới sinh ra ở frontend phải khớp hoàn toàn về giá trị id, tên, avatar và videoUrl với dữ liệu trong `mock_data.js` để tránh mismatch giữa client và server.

### 2. Tạo cấu trúc thư mục chứa tài nguyên ảnh/video tại `public/assets/`:
Tạo các thư mục rỗng tại thư mục `public/` để sẵn sàng chứa ảnh chân dung nhân vật và thông tin video:
- `public/assets/doctors/` (chứa ảnh chân dung 5 Bác sĩ)
- `public/assets/healers/` (chứa ảnh chân dung 5 Healers)
- `public/assets/videos/` (thư mục chứa video ngắn dọc)

### 3. Viết tài liệu hướng dẫn tạo ảnh AI (README_PROMPTS.md):
Hãy viết tệp tin `public/assets/README_PROMPTS.md` mô tả bối cảnh và chứa **10 đoạn AI Prompts (Midjourney/DALL-E 3)** cực kỳ chi tiết để một thành viên trong nhóm có thể copy chạy trên AI tạo ra ảnh chân dung chân thực, độ phân giải 400x400px tỉ lệ 1:1, dung lượng nén dưới 150KB:
1. **ThS. BS Nguyễn Lân Hương** (`dr_lan_huong.jpg`): Nữ bác sĩ tâm lý lâm sàng Việt Nam 35 tuổi, mặc áo blouse trắng khoác ngoài sơ mi xanh nhạt, thần thái ấm áp thấu cảm, phông nền phòng khám mờ.
2. **TS. BS Trần Hoàng Nam** (`dr_hoang_nam.jpg`): Nam bác sĩ trị liệu gia đình Việt Nam 42 tuổi, mặc vest lịch lãm màu xám than, đeo cà vạt, thần thái điềm tĩnh, nền văn phòng tủ sách gỗ mờ.
3. **ThS. BS Mai Khánh Chi** (`dr_mai_khanh_chi.jpg`): Nữ bác sĩ 38 tuổi, mặc blazer beige nhẹ nhàng, tóc búi gọn, nụ cười bao dung thấu hiểu, nền phòng tham vấn ấm áp mờ.
4. **TS. BS Lê Đức Minh** (`dr_duc_minh.jpg`): Nam bác sĩ 45 tuổi, đeo kính gọng mỏng trí tuệ, mặc blazer đen bên ngoài sơ mi trắng không cà vạt, tóc muối tiêu nhẹ, nền học thuật mờ.
5. **ThS. BS Phạm Thị Mai Anh** (`dr_mai_anh.jpg`): Nữ bác sĩ 32 tuổi, mặc blazer màu xanh sage hiện đại, nụ cười năng động tích cực, tóc buộc đuôi ngựa thấp, nền phòng wellness tươi sáng mờ.
6. **Linh Healer** (`healer_linh.jpg`): Nữ sinh viên đồng hành 23 tuổi, mặc áo len dệt pastel màu vàng nhạt, nụ cười thân thiện gần gũi như bạn học, nền quán cafe ấm áp mờ.
7. **Minh Healer** (`healer_minh.jpg`): Nam thanh niên 24 tuổi trầm lặng, mặc áo phông trắng khoác sơ mi flannel xám, nụ cười thấu hiểu dịu dàng, nền phòng khách nhiều ánh sáng.
8. **Hà An Healer** (`healer_ha_an.jpg`): Nữ sinh viên 21 tuổi, mặc áo phông tím oải hương giản dị, nụ cười ôm ấp cảm xúc thấu cảm, nền sân vườn cây xanh mờ nắng.
9. **Thu Hằng Healer** (`healer_thu_hang.jpg`): Nữ healer 26 tuổi chín chắn, mặc sơ mi linen màu hồng bụi, thần thái bình yên vững chãi, nền giá sách mờ ấm áp.
10. **Bảo Khánh Healer** (`healer_bao_khanh.jpg`): Nam healer 25 tuổi cởi mở, mặc sơ mi màu xanh rêu xắn tay áo thoải mái, nụ cười thực tế và thấu hiểu, nền không gian làm việc mờ.

### 4. Viết tệp tin Thư viện Dữ liệu mẫu TypeScript tại `src/lib/mock-data.ts`:
Hãy viết mã nguồn tệp tin `src/lib/mock-data.ts` xuất bản (export) dữ liệu mẫu chứa đầy đủ thông tin của **5 Bác sĩ (doctors), 5 Healers (healers), và 6 Videos (videos)** để frontend hiển thị.

#### Đặc tả thuộc tính các Interface:
- `Doctor`: id, name, role ('doctor'), avatar (đường dẫn `/assets/doctors/dr_xxx.jpg`), title, credentials, specialties (mảng các thế mạnh trị liệu), quote (câu nói thấu cảm), approvedVideosCount.
- `Healer`: id, name, role ('healer'), avatar (đường dẫn `/assets/healers/healer_xxx.jpg`), specialties, online (boolean), bio.
- `Video`: id, title, doctorId, doctorName, topic, videoUrl (URL MP4 trực tiếp từ Mixkit CDN), description, likes, saved.

Hãy tạo ra các thư mục, tệp tin hướng dẫn và mã nguồn dữ liệu TypeScript trên theo đúng yêu cầu.
```

---

## KIỂM TRA & XÁC MINH (Checklist cuối bước 0)

Sau khi AI Agent hoàn thành các tệp tin tài nguyên, hãy kiểm tra các mục sau:

- [ ] Các thư mục chứa ảnh chân dung `frontend/public/assets/doctors/` và `frontend/public/assets/healers/` đã được tạo đầy đủ.
- [ ] Có tệp tin `frontend/public/assets/README_PROMPTS.md` chứa đầy đủ 10 đoạn AI Prompts chi tiết cho cả 5 bác sĩ và 5 healers để copy sử dụng.
- [ ] Tệp `frontend/src/lib/mock-data.ts` được viết bằng TypeScript chuẩn xác, export đúng 3 danh sách `doctors`, `healers`, và `videos` không chứa mã lỗi cú pháp.
- [ ] Dữ liệu trong `mock-data.ts` khớp hoàn hảo với thông tin gốc trong `mock_data.js`.
- [ ] Toàn bộ 6 video trong mock-data đều chứa đường dẫn MP4 trực tiếp hoạt động tốt từ các CDN miễn phí (Mixkit).
