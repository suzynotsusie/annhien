# Bước ADD-5: Triển Khai Sản Phầm & Tối Ưu Hóa (AI Agent Prompt Guide)

## Hướng dẫn dành cho lập trình viên

Sao chép toàn bộ phần **PROMPT DÀNH CHO AI AGENT** dưới đây và dán vào công cụ AI Coding Assistant để tối ưu hóa hiệu suất, cấu hình bảo mật production và chuẩn bị các tệp tin cấu hình sẵn sàng deploy lên Cloud.

---

## PROMPT DÀNH CHO AI AGENT: CORS, RATE LIMITING, PERFORMANCE & SECURITY OPTIMIZATION

```prompt
Bạn là một AI Coding Agent chuyên nghiệp. Hãy tối ưu hóa hiệu suất, thắt chặt bảo mật production và chuẩn bị cấu hình deploy cho toàn bộ dự án An Nhiên (cả Frontend và Backend) theo đúng các yêu cầu kỹ thuật dưới đây.

### 1. Bối cảnh & Các tệp tin liên quan cần đọc trước:
- **Tệp khởi chạy Backend**: Đọc kỹ `backend/src/index.ts` để hiểu cách khởi động máy chủ Express hiện tại, cấu hình CORS và các middleware đăng ký.
- **Tệp cấu hình Frontend**: Đọc kỹ `frontend/package.json` và `frontend/next.config.js` để kiểm tra các plugin Next.js và cấu hình môi trường.
- **Các trang hiển thị Media**: Đọc kỹ `frontend/src/app/(main)/tram-chua-lanh/page.tsx` và các component hiển thị ảnh chân dung của bác sĩ/healer để nắm rõ cách nạp tài nguyên hiện tại.
- **Quy tắc nhất quán**:
  - Việc cấu hình bảo mật và tối ưu hóa không được làm thay đổi bất kỳ logic nghiệp vụ cốt lõi nào đã phát triển ở các bước trước.
  - Vẫn tuân thủ nghiêm ngặt nguyên tắc text-only cho các tính năng chat và bảng tin cộng đồng.

---

### 2. Thắt chặt Bảo mật và CORS phía Backend:
Đảm bảo máy chủ Express chạy an toàn trên Internet:
- Sửa tệp `backend/src/index.ts`:
  - Cài đặt thư viện `helmet` làm dependency để bảo vệ headers. Đăng ký middleware `app.use(helmet())`.
  - Cấu hình middleware `cors` chỉ cho phép duy nhất tên miền của Frontend được quyền gọi tài nguyên:
    ```typescript
    app.use(cors({
      origin: process.env.FRONTEND_URL || 'https://annhien.vercel.app',
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    }));
    ```
  - Cài đặt thư viện `express-rate-limit` làm dependency. Thiết lập bộ giới hạn tần suất yêu cầu (rate limiter) cho các API gọi sang Gemini AI để chống spam phá hoại tiêu tốn tài nguyên:
    ```typescript
    import rateLimit from 'express-rate-limit';
    const aiLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 phút
      max: 30, // Tối đa 30 requests từ 1 IP trong 15 phút
      message: { message: 'Cậu đang gọi trợ lý hơi nhanh quá rồi. Hãy thở chậm lại một chút nhé!', code: 'TOO_MANY_REQUESTS' }
    });
    app.use('/api/ai/', aiLimiter);
    ```

---

### 3. Tối ưu hóa Hiệu suất và UX phía Frontend (Next.js):
Cải thiện chỉ số Core Web Vitals (LCP, CLS, FID) để ứng dụng chạy mượt mà:
- **Tối ưu hóa hình ảnh (next/image)**: Sửa tất cả các thẻ `<img>` thô hiển thị avatar của Bác sĩ/Healer sang sử dụng thành phần `<Image>` của `next/image` để tự động nén, cắt và lazy-load ảnh. Cấu hình tệp `next.config.js` cho phép tải ảnh từ domain `images.unsplash.com` và domain Supabase.
- **Tải chậm Video Trạm Chữa Lành**: Sửa tệp trình phát video shorts, mặc định thêm thuộc tính `preload="none"` trên thẻ `<video>`. Chỉ khi video đó được hiển thị đầy đủ trên màn hình (được kích hoạt bởi `IntersectionObserver`), mới chuyển sang `preload="auto"` để tiết kiệm băng thông mạng di động cho người dùng.
- **Loading Skeleton**: Tạo component `SkeletonCard` nhấp nháy chuyển động nhẹ (`animate-pulse`) để hiển thị mô phỏng khung dữ liệu trong lúc chờ cuộc gọi API tải bảng tin cộng đồng hoặc nhật ký hoàn tất.
- **Error Boundary**: Tạo component `ErrorBoundary` bọc ngoài các màn hình chính để hiển thị card thông báo lỗi thân thiện nếu có sự cố ngoài dự kiến, ngăn chặn ứng dụng bị crash trắng trang.

Hãy triển khai toàn bộ các tệp tin cấu hình và tối ưu hóa trên bằng mã nguồn TypeScript hoàn chỉnh.
```

---

## KIỂM TRA & XÁC MINH (Checklist cuối bước ADD-5)

Sau khi AI Agent hoàn thành các cấu hình bảo mật và hiệu suất, hãy kiểm thử các mục sau:

- [ ] Chạy lệnh `npm run build` ở cả frontend và backend thành công, không xuất hiện bất kỳ lỗi biên dịch nào.
- [ ] Thử gọi API từ một domain lạ không được cấp phép, backend Express phải trả về lỗi chặn đứng CORS chính xác.
- [ ] Thử spam liên tục API chat AI, hệ thống phải kích hoạt rate limiter và trả về mã lỗi `TOO_MANY_REQUESTS` kèm câu nhắc nhở thân thiện bằng tiếng Việt.
- [ ] Điểm số Google Lighthouse của trang chủ đạt trên 85 điểm, các ảnh chân dung tải chậm mượt mà và không gây giật lag (CLS < 0.1).
- [ ] Mở tab mạng (Network) trong công cụ phát triển của trình duyệt, xác nhận dữ liệu tệp tin video ở Trạm Chữa Lành chỉ được tải xuống khi người dùng cuộn tới vị trí hiển thị (Lazy-loading media hoạt động tốt).
