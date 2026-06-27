# Video Assets Folder (Trạm Chữa Lành)

Thư mục này dùng để lưu trữ các video ngắn (shorts) định dạng `.mp4` do bạn tải về.

## Hướng dẫn cập nhật video cục bộ:

1. Copy 6 file video của bạn vào thư mục này, ví dụ:
   - `vid_1_breathe.mp4`
   - `vid_2_forest.mp4`
   - v.v...

2. Cập nhật lại đường dẫn trong file `frontend/src/lib/mock-data.ts`.
Thay vì dùng link web (https://...), bạn hãy đổi thành đường dẫn tương đối trỏ về thư mục này:

```typescript
// Trong file frontend/src/lib/mock-data.ts
export const videos: Video[] = [
  {
    id: "vid_1",
    title: "Bài tập thở hạ hỏa tức thì 4-7-8 🌿",
    // ...
    videoUrl: "/assets/videos/vid_1_breathe.mp4", // Đổi thành đường dẫn cục bộ
    // ...
  },
  // ...
]
```

> **Lưu ý:** Next.js sẽ tự động phục vụ (serve) các file trong thư mục `public/`, vì vậy khi dùng đường dẫn `/assets/videos/tên-file.mp4`, ứng dụng sẽ tải được video ngay.
