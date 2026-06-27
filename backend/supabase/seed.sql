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
('d5555555-5555-5555-5555-555555555555', 'dr_maianh', crypt('123456', gen_salt('bf')), 'ThS. BS Phạm Thị Mai Anh', 'doctor', 'offline', '["study", "relationship"]')
ON CONFLICT (id) DO NOTHING;

-- =========================================================
-- 2. Người đồng hành (Healers)
-- Mật khẩu mặc định: 123456
-- UUID hex hợp lệ: dùng b thay cho h
-- =========================================================
INSERT INTO users (id, username, password_hash, nickname, role, status, topics) VALUES
('b1111111-1111-1111-1111-111111111111', 'healer_linh', crypt('123456', gen_salt('bf')), 'Linh (Peer Supporter)', 'healer', 'online', '["study"]'),
('b2222222-2222-2222-2222-222222222222', 'healer_minh', crypt('123456', gen_salt('bf')), 'Minh (Peer Supporter)', 'healer', 'online', '["relationship"]'),
('b3333333-3333-3333-3333-333333333333', 'healer_haan', crypt('123456', gen_salt('bf')), 'Hà An (Peer Supporter)', 'healer', 'offline', '["family"]'),
('b4444444-4444-4444-4444-444444444444', 'healer_thuhang', crypt('123456', gen_salt('bf')), 'Lê Thu Hằng (Peer Supporter)', 'healer', 'online', '["family"]'),
('b5555555-5555-5555-5555-555555555555', 'healer_baokhanh', crypt('123456', gen_salt('bf')), 'Phạm Bảo Khánh (Peer Supporter)', 'healer', 'offline', '["study", "daily"]')
ON CONFLICT (id) DO NOTHING;


