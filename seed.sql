-- =========================================================
-- SEED DATA — An Nhiên MVP
-- Chạy script này trên Supabase SQL Editor SAU KHI chạy database.sql
-- Kích hoạt pgcrypto để băm mật khẩu
-- =========================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================
-- 1. Bác sĩ (Doctors)
-- Mật khẩu mặc định: 123456
-- =========================================================
INSERT INTO users (id, username, password_hash, nickname, role, status, topics) VALUES
('d1111111-1111-1111-1111-111111111111', 'dr_lanhuong', crypt('123456', gen_salt('bf')), 'ThS. BS Nguyễn Lân Hương', 'doctor', 'offline', '["study", "daily"]'),
('d2222222-2222-2222-2222-222222222222', 'dr_hoangnam', crypt('123456', gen_salt('bf')), 'TS. BS Trần Hoàng Nam', 'doctor', 'offline', '["family", "daily"]'),
('d3333333-3333-3333-3333-333333333333', 'dr_khanhchi', crypt('123456', gen_salt('bf')), 'ThS. BS Mai Khánh Chi', 'doctor', 'offline', '["relationship", "daily"]'),
('d4444444-4444-4444-4444-444444444444', 'dr_ducminh', crypt('123456', gen_salt('bf')), 'TS. BS Lê Đức Minh', 'doctor', 'offline', '["study", "family"]'),
('d5555555-5555-5555-5555-555555555555', 'dr_maianh', crypt('123456', gen_salt('bf')), 'ThS. BS Phạm Thị Mai Anh', 'doctor', 'offline', '["study", "relationship"]');

-- =========================================================
-- 2. Người đồng hành (Healers)
-- Mật khẩu mặc định: 123456
-- =========================================================
INSERT INTO users (id, username, password_hash, nickname, role, status, topics) VALUES
('h1111111-1111-1111-1111-111111111111', 'healer_linh', crypt('123456', gen_salt('bf')), 'Linh (Peer Supporter)', 'healer', 'online', '["study"]'),
('h2222222-2222-2222-2222-222222222222', 'healer_minh', crypt('123456', gen_salt('bf')), 'Minh (Peer Supporter)', 'healer', 'online', '["relationship"]'),
('h3333333-3333-3333-3333-333333333333', 'healer_haan', crypt('123456', gen_salt('bf')), 'Hà An (Peer Supporter)', 'healer', 'offline', '["family"]'),
('h4444444-4444-4444-4444-444444444444', 'healer_thuhang', crypt('123456', gen_salt('bf')), 'Lê Thu Hằng (Peer Supporter)', 'healer', 'online', '["family"]'),
('h5555555-5555-5555-5555-555555555555', 'healer_baokhanh', crypt('123456', gen_salt('bf')), 'Phạm Bảo Khánh (Peer Supporter)', 'healer', 'offline', '["study", "daily"]');

-- =========================================================
-- 3. Kho Video Chữa Lành
-- =========================================================
INSERT INTO videos (id, doctor_id, title, topic, video_url, description, likes, saved) VALUES
('v1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'Bài tập thở hạ hỏa tức thì 4-7-8 🌿', 'daily', 'https://assets.mixkit.co/videos/preview/mixkit-meditating-woman-by-the-sea-43093-large.mp4', 'Kỹ thuật thở 4-7-8 giúp hạ nhịp tim và giảm lo âu cấp tốc trong 60 giây.', 1240, 890),
('v2222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', 'Chữa lành tâm hồn cùng tiếng suối rừng 🍃', 'daily', 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4', 'Âm thanh suối rừng giúp kích hoạt hệ thần kinh phó giao cảm, giảm cortisol.', 948, 712),
('v3333333-3333-3333-3333-333333333333', 'd3333333-3333-3333-3333-333333333333', 'Âm thanh tiếng mưa giúp ngủ ngon và giảm lo âu 🌧️', 'study', 'https://assets.mixkit.co/videos/preview/mixkit-rain-drops-on-a-window-1521-large.mp4', 'Tiếng mưa tự nhiên giúp mask tiếng ồn xung quanh và đưa tâm trí về trạng thái nghỉ ngơi.', 2310, 1850),
('v4444444-4444-4444-4444-444444444444', 'd2222222-2222-2222-2222-222222222222', 'Chánh niệm: Đi bộ thư giãn trong rừng nắng ☀️', 'daily', 'https://assets.mixkit.co/videos/preview/mixkit-man-walking-in-a-sunny-forest-44917-large.mp4', 'Bài tập đi bộ chánh niệm 10 phút giúp kéo sự chú ý về hiện tại và giảm vòng lặp suy nghĩ tiêu cực.', 560, 420),
('v5555555-5555-5555-5555-555555555555', 'd4444444-4444-4444-4444-444444444444', 'Bình minh mới — Tìm lại hy vọng mỗi sáng 🌅', 'daily', 'https://assets.mixkit.co/videos/preview/mixkit-sunrise-nature-placeholder-large.mp4', 'Mỗi buổi sáng là một cơ hội mới. Cùng TS. Lê Đức Minh bắt đầu ngày với tâm thế tích cực.', 780, 540),
('v6666666-6666-6666-6666-666666666666', 'd5555555-5555-5555-5555-555555555555', 'Sóng biển — Buông bỏ và thở 🌊', 'relationship', 'https://assets.mixkit.co/videos/preview/mixkit-waves-beach-placeholder-large.mp4', 'Để tiếng sóng biển cuốn trôi lo lắng. Bài thiền hướng dẫn buông bỏ những điều ngoài tầm kiểm soát.', 1560, 1120);

-- =========================================================
-- 4. Người dùng cơ bản (Users)
-- Mật khẩu mặc định: 123456
-- =========================================================
INSERT INTO users (id, username, password_hash, nickname, role, status, topics) VALUES
('a1111111-1111-1111-1111-111111111111', 'user1', crypt('123456', gen_salt('bf')), 'Học sinh cuối cấp', 'user', 'offline', '["study"]'),
('a2222222-2222-2222-2222-222222222222', 'user2', crypt('123456', gen_salt('bf')), 'Sinh viên năm nhất', 'user', 'online', '["relationship"]'),
('a3333333-3333-3333-3333-333333333333', 'user3', crypt('123456', gen_salt('bf')), 'Người đi làm', 'user', 'offline', '["daily", "family"]');

-- =========================================================
-- 5. Bài đăng cộng đồng (Posts)
-- =========================================================
INSERT INTO posts (id, author_id, content, topic, status, author_label, reactions) VALUES
('b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Gần thi đại học rồi mà mình cảm thấy kiệt sức quá. Bố mẹ cứ kỳ vọng mình vào Y nhưng mình chỉ muốn học thiết kế. Mình không dám nói ra.', 'family', 'public', 'Ẩn danh', '{"hug": 15, "empathy": 42, "peace": 5}'),
('b2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'Lên đại học mình bị sốc văn hóa và cảm thấy cô đơn kinh khủng. Không có ai để tâm sự, bạn bè cũ thì đều bận rộn với cuộc sống mới.', 'study', 'public', 'Ẩn danh', '{"hug": 23, "empathy": 12, "peace": 8}'),
('b3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'Hôm nay sếp lại mắng mình trước mặt mọi người. Cảm giác bao nhiêu cố gắng đều không được công nhận. Thật sự muốn bỏ việc...', 'daily', 'public', 'Ẩn danh', '{"hug": 50, "empathy": 80, "peace": 12}'),
('b4444444-4444-4444-4444-444444444444', 'a1111111-1111-1111-1111-111111111111', 'Chia tay mối tình 3 năm thật sự rất đau. Cứ ngỡ sẽ đi cùng nhau thật lâu, giờ mọi thứ đều trống rỗng.', 'relationship', 'public', 'Ẩn danh', '{"hug": 100, "empathy": 50, "peace": 25}'),
('b5555555-5555-5555-5555-555555555555', 'a2222222-2222-2222-2222-222222222222', 'Sắp tới kỳ bảo vệ khóa luận mà nhóm mình mỗi người một ý, chả ai chịu làm. Cảm thấy bất lực và mệt mỏi quá.', 'study', 'public', 'Sinh viên năm cuối', '{"hug": 30, "empathy": 15, "peace": 10}'),
('b6666666-6666-6666-6666-666666666666', 'a3333333-3333-3333-3333-333333333333', 'Dạo này vợ chồng mình cãi nhau suốt vì chuyện tài chính. Về nhà mà không khí ngột ngạt như muốn nổ tung, chẳng biết chia sẻ cùng ai.', 'family', 'public', 'Người bố trẻ', '{"hug": 45, "empathy": 60, "peace": 20}'),
('b7777777-7777-7777-7777-777777777777', 'a1111111-1111-1111-1111-111111111111', 'Mình luôn cảm thấy tự ti về ngoại hình. Mỗi lần ra ngoài đều phải trang điểm rất kỹ, nhìn các bạn khác tự tin mặt mộc mà thèm.', 'daily', 'public', 'Ẩn danh', '{"hug": 80, "empathy": 33, "peace": 41}'),
('b8888888-8888-8888-8888-888888888888', 'a2222222-2222-2222-2222-222222222222', 'Hôm nay trời mưa to, tự dưng nhớ lại những kỷ niệm cũ rồi khóc một mình. Đôi khi chỉ muốn một cái ôm thật chặt.', 'daily', 'public', 'Cô đơn', '{"hug": 120, "empathy": 50, "peace": 30}'),
('b9999999-9999-9999-9999-999999999999', 'a3333333-3333-3333-3333-333333333333', 'Crush của mình vừa công khai người yêu mới. Dù biết trước kết quả nhưng vẫn thấy chạnh lòng quá.', 'relationship', 'public', 'Kẻ đơn phương', '{"hug": 55, "empathy": 22, "peace": 15}'),
('baaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a1111111-1111-1111-1111-111111111111', 'Làm sao để cân bằng giữa học tập và việc làm thêm nhỉ? Tuần vừa rồi mình ngủ chưa tới 20 tiếng, gục ngã mất.', 'study', 'public', 'Sinh viên cày cuốc', '{"hug": 88, "empathy": 60, "peace": 40}'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'a2222222-2222-2222-2222-222222222222', 'Mẹ lại so sánh mình với "con nhà người ta". Mình đã cố gắng rất nhiều mà dường như mẹ không bao giờ thấy đủ.', 'family', 'public', 'Đứa con vô hình', '{"hug": 95, "empathy": 110, "peace": 35}'),
('bccccccc-cccc-cccc-cccc-cccccccccccc', 'a3333333-3333-3333-3333-333333333333', 'Dự án thất bại, công ty cắt giảm nhân sự và mình nằm trong danh sách đó. Tương lai sắp tới mù mịt quá mọi người ạ.', 'daily', 'public', 'Người mất phương hướng', '{"hug": 200, "empathy": 150, "peace": 60}'),
('bddddddd-dddd-dddd-dddd-dddddddddddd', 'a1111111-1111-1111-1111-111111111111', 'Phát hiện bạn thân nói xấu sau lưng mình. Chơi với nhau 5 năm trời, giờ thấy lòng tin vỡ vụn.', 'relationship', 'public', 'Ẩn danh', '{"hug": 75, "empathy": 85, "peace": 20}'),
('beeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'a2222222-2222-2222-2222-222222222222', 'Deadline dồn dập, bài tập nhóm thì các bạn ỷ lại. Mình ôm đồm hết mọi thứ và giờ thì quá tải. Khóc sưng cả mắt.', 'study', 'public', 'Cánh chim lẻ loi', '{"hug": 130, "empathy": 45, "peace": 25}'),
('bfffffff-ffff-ffff-ffff-ffffffffffff', 'a3333333-3333-3333-3333-333333333333', 'Mình muốn đi xa nhà một thời gian để trốn tránh thực tại nhưng không có can đảm bỏ lại gia đình. Cảm giác như chim trong lồng.', 'family', 'public', 'Ẩn danh', '{"hug": 40, "empathy": 55, "peace": 30}'),
('c1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Yêu xa khó thật sự, múi giờ chênh lệch khiến cả hai dần ít nói chuyện hơn. Sợ một ngày nào đó khoảng cách sẽ chia cắt chúng mình.', 'relationship', 'public', 'Người đợi chờ', '{"hug": 66, "empathy": 44, "peace": 18}'),
('c2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'Vừa thi rớt môn chuyên ngành. Cảm thấy bản thân quá kém cỏi, không biết mình có hợp với ngành này không nữa.', 'study', 'public', 'Ẩn danh', '{"hug": 85, "empathy": 70, "peace": 30}'),
('c3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'Có những ngày thức dậy chỉ thấy vô định. Không buồn, không vui, chỉ là thấy trống rỗng và thiếu động lực sống.', 'daily', 'public', 'Trống rỗng', '{"hug": 150, "empathy": 120, "peace": 80}'),
('c4444444-4444-4444-4444-444444444444', 'a1111111-1111-1111-1111-111111111111', 'Anh trai mình vừa mất sau thời gian dài bạo bệnh. Cả nhà suy sụp, mình cố mạnh mẽ để làm chỗ dựa cho bố mẹ nhưng đêm về lại khóc nấc lên.', 'family', 'public', 'Đứa em nhỏ', '{"hug": 500, "empathy": 300, "peace": 150}'),
('c5555555-5555-5555-5555-555555555555', 'a2222222-2222-2222-2222-222222222222', 'Vượt qua được một đợt trầm cảm nhẹ. Cảm ơn ứng dụng và những người không quen biết đã luôn lắng nghe mình.', 'daily', 'public', 'Ánh sáng', '{"hug": 250, "empathy": 90, "peace": 200}');
