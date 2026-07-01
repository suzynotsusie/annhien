const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const posts = [
  { id: 'b4444444-4444-4444-4444-444444444444', author_id: 'a1111111-1111-1111-1111-111111111111', content: 'Chia tay mối tình 3 năm thật sự rất đau. Cứ ngỡ sẽ đi cùng nhau thật lâu, giờ mọi thứ đều trống rỗng.', topic: 'relationship', status: 'public', author_label: 'Ẩn danh', reactions: {"hug": 100, "empathy": 50, "peace": 25} },
  { id: 'b5555555-5555-5555-5555-555555555555', author_id: 'a2222222-2222-2222-2222-222222222222', content: 'Sắp tới kỳ bảo vệ khóa luận mà nhóm mình mỗi người một ý, chả ai chịu làm. Cảm thấy bất lực và mệt mỏi quá.', topic: 'study', status: 'public', author_label: 'Sinh viên năm cuối', reactions: {"hug": 30, "empathy": 15, "peace": 10} },
  { id: 'b6666666-6666-6666-6666-666666666666', author_id: 'a3333333-3333-3333-3333-333333333333', content: 'Dạo này vợ chồng mình cãi nhau suốt vì chuyện tài chính. Về nhà mà không khí ngột ngạt như muốn nổ tung, chẳng biết chia sẻ cùng ai.', topic: 'family', status: 'public', author_label: 'Người bố trẻ', reactions: {"hug": 45, "empathy": 60, "peace": 20} },
  { id: 'b7777777-7777-7777-7777-777777777777', author_id: 'a1111111-1111-1111-1111-111111111111', content: 'Mình luôn cảm thấy tự ti về ngoại hình. Mỗi lần ra ngoài đều phải trang điểm rất kỹ, nhìn các bạn khác tự tin mặt mộc mà thèm.', topic: 'daily', status: 'public', author_label: 'Ẩn danh', reactions: {"hug": 80, "empathy": 33, "peace": 41} },
  { id: 'b8888888-8888-8888-8888-888888888888', author_id: 'a2222222-2222-2222-2222-222222222222', content: 'Hôm nay trời mưa to, tự dưng nhớ lại những kỷ niệm cũ rồi khóc một mình. Đôi khi chỉ muốn một cái ôm thật chặt.', topic: 'daily', status: 'public', author_label: 'Cô đơn', reactions: {"hug": 120, "empathy": 50, "peace": 30} },
  { id: 'b9999999-9999-9999-9999-999999999999', author_id: 'a3333333-3333-3333-3333-333333333333', content: 'Crush của mình vừa công khai người yêu mới. Dù biết trước kết quả nhưng vẫn thấy chạnh lòng quá.', topic: 'relationship', status: 'public', author_label: 'Kẻ đơn phương', reactions: {"hug": 55, "empathy": 22, "peace": 15} },
  { id: 'baaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', author_id: 'a1111111-1111-1111-1111-111111111111', content: 'Làm sao để cân bằng giữa học tập và việc làm thêm nhỉ? Tuần vừa rồi mình ngủ chưa tới 20 tiếng, gục ngã mất.', topic: 'study', status: 'public', author_label: 'Sinh viên cày cuốc', reactions: {"hug": 88, "empathy": 60, "peace": 40} },
  { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', author_id: 'a2222222-2222-2222-2222-222222222222', content: 'Mẹ lại so sánh mình với "con nhà người ta". Mình đã cố gắng rất nhiều mà dường như mẹ không bao giờ thấy đủ.', topic: 'family', status: 'public', author_label: 'Đứa con vô hình', reactions: {"hug": 95, "empathy": 110, "peace": 35} },
  { id: 'bccccccc-cccc-cccc-cccc-cccccccccccc', author_id: 'a3333333-3333-3333-3333-333333333333', content: 'Dự án thất bại, công ty cắt giảm nhân sự và mình nằm trong danh sách đó. Tương lai sắp tới mù mịt quá mọi người ạ.', topic: 'daily', status: 'public', author_label: 'Người mất phương hướng', reactions: {"hug": 200, "empathy": 150, "peace": 60} },
  { id: 'bddddddd-dddd-dddd-dddd-dddddddddddd', author_id: 'a1111111-1111-1111-1111-111111111111', content: 'Phát hiện bạn thân nói xấu sau lưng mình. Chơi với nhau 5 năm trời, giờ thấy lòng tin vỡ vụn.', topic: 'relationship', status: 'public', author_label: 'Ẩn danh', reactions: {"hug": 75, "empathy": 85, "peace": 20} },
  { id: 'beeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', author_id: 'a2222222-2222-2222-2222-222222222222', content: 'Deadline dồn dập, bài tập nhóm thì các bạn ỷ lại. Mình ôm đồm hết mọi thứ và giờ thì quá tải. Khóc sưng cả mắt.', topic: 'study', status: 'public', author_label: 'Cánh chim lẻ loi', reactions: {"hug": 130, "empathy": 45, "peace": 25} },
  { id: 'bfffffff-ffff-ffff-ffff-ffffffffffff', author_id: 'a3333333-3333-3333-3333-333333333333', content: 'Mình muốn đi xa nhà một thời gian để trốn tránh thực tại nhưng không có can đảm bỏ lại gia đình. Cảm giác như chim trong lồng.', topic: 'family', status: 'public', author_label: 'Ẩn danh', reactions: {"hug": 40, "empathy": 55, "peace": 30} },
  { id: 'c1111111-1111-1111-1111-111111111111', author_id: 'a1111111-1111-1111-1111-111111111111', content: 'Yêu xa khó thật sự, múi giờ chênh lệch khiến cả hai dần ít nói chuyện hơn. Sợ một ngày nào đó khoảng cách sẽ chia cắt chúng mình.', topic: 'relationship', status: 'public', author_label: 'Người đợi chờ', reactions: {"hug": 66, "empathy": 44, "peace": 18} },
  { id: 'c2222222-2222-2222-2222-222222222222', author_id: 'a2222222-2222-2222-2222-222222222222', content: 'Vừa thi rớt môn chuyên ngành. Cảm thấy bản thân quá kém cỏi, không biết mình có hợp với ngành này không nữa.', topic: 'study', status: 'public', author_label: 'Ẩn danh', reactions: {"hug": 85, "empathy": 70, "peace": 30} },
  { id: 'c3333333-3333-3333-3333-333333333333', author_id: 'a3333333-3333-3333-3333-333333333333', content: 'Có những ngày thức dậy chỉ thấy vô định. Không buồn, không vui, chỉ là thấy trống rỗng và thiếu động lực sống.', topic: 'daily', status: 'public', author_label: 'Trống rỗng', reactions: {"hug": 150, "empathy": 120, "peace": 80} },
  { id: 'c4444444-4444-4444-4444-444444444444', author_id: 'a1111111-1111-1111-1111-111111111111', content: 'Anh trai mình vừa mất sau thời gian dài bạo bệnh. Cả nhà suy sụp, mình cố mạnh mẽ để làm chỗ dựa cho bố mẹ nhưng đêm về lại khóc nấc lên.', topic: 'family', status: 'public', author_label: 'Đứa em nhỏ', reactions: {"hug": 500, "empathy": 300, "peace": 150} },
  { id: 'c5555555-5555-5555-5555-555555555555', author_id: 'a2222222-2222-2222-2222-222222222222', content: 'Vượt qua được một đợt trầm cảm nhẹ. Cảm ơn ứng dụng và những người không quen biết đã luôn lắng nghe mình.', topic: 'daily', status: 'public', author_label: 'Ánh sáng', reactions: {"hug": 250, "empathy": 90, "peace": 200} }
];

async function run() {
  console.log("Upserting new posts to Supabase...");
  const { data, error } = await supabase.from('posts').upsert(posts);
  
  if (error) {
    console.error("Error upserting posts:", error);
  } else {
    console.log("Successfully added", posts.length, "posts!");
  }
}

run();
