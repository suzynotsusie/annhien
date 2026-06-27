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
