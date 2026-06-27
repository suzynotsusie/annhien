import drDucMinh from '../assets/doctors/dr_duc_minh.png'
import drLanHuong from '../assets/doctors/dr_lan_huong.png'
import drMaiAnh from '../assets/doctors/dr_mai_anh.png'
import drMaiKhanhChi from '../assets/doctors/dr_mai_khanh_chi.png'
import healerHaAn from '../assets/healers/healer_ha_an.png'
import healerLinh from '../assets/healers/healer_linh.png'
import healerMinh from '../assets/healers/healer_minh.png'
import userGioNhe from '../assets/users/user_gio_nhe.svg'
import userLaNon from '../assets/users/user_la_non.svg'
import userMayNho from '../assets/users/user_may_nho.svg'
import video1 from '../assets/videos/video1.mp4'
import video2 from '../assets/videos/video2.mp4'
import video3 from '../assets/videos/video3.mp4'
import video4 from '../assets/videos/video4.mp4'
import video5 from '../assets/videos/video5.mp4'
import video6 from '../assets/videos/video6.mp4'

export const moodOptions = [
  { id: 'great', label: 'Tuyệt vời', emoji: '😊', tone: 'bg-sun-light/75 border-sun/45' },
  { id: 'good', label: 'Ổn', emoji: '🙂', tone: 'bg-sage-ghost border-sage-light/35' },
  { id: 'okay', label: 'Bình thường', emoji: '😐', tone: 'bg-mist-light/75 border-mist/45' },
  { id: 'tired', label: 'Mệt mỏi', emoji: '😮‍💨', tone: 'bg-petal-light/75 border-petal/50' },
  { id: 'anxious', label: 'Lo lắng', emoji: '😟', tone: 'bg-lavender-light/75 border-lavender/50' },
]

export const communityTopics = [
  { id: 'all', label: 'Tất cả' },
  { id: 'study', label: 'Học tập' },
  { id: 'family', label: 'Gia đình' },
  { id: 'relationship', label: 'Bạn bè' },
  { id: 'daily', label: 'Hàng ngày' },
  { id: 'other', label: 'Khác' },
]

export const topicLabels = communityTopics.reduce((map, topic) => {
  map[topic.id] = topic.label
  return map
}, {})

export const communitySeed = [
  {
    id: 'post-1',
    content: 'Mình đang ôn thi mà cứ thấy hụt hơi. Đọc một trang là đầu óc chạy đi đâu mất. Có ai cũng từng vậy không?',
    topic: 'study',
    authorLabel: 'Ẩn danh',
    avatar: userGioNhe,
    roleBadge: null,
    reactions: { like: 14, love: 7, care: 18, peace: 9 },
    userReaction: 'care',
    comments: [
      { id: 'cmt-1', author: 'Lá Non', avatar: userLaNon, text: 'Mình cũng từng bị vậy. Cậu thử chia nhỏ 15 phút một lần xem sao.' },
    ],
    createdAt: '2026-06-27T08:20:00.000Z',
    status: 'public',
  },
  {
    id: 'post-2',
    content: 'Tối nay mình thử tắt điện thoại sớm 30 phút. Không hoàn hảo, nhưng đầu nhẹ hơn một chút.',
    topic: 'daily',
    authorLabel: 'Lá Non',
    avatar: userLaNon,
    roleBadge: null,
    reactions: { like: 9, love: 13, care: 8, peace: 31 },
    userReaction: 'peace',
    comments: [
      { id: 'cmt-2', author: 'Mây Nhỏ', avatar: userMayNho, text: 'Nghe nhẹ thật. Tối nay mình thử theo.' },
    ],
    createdAt: '2026-06-26T21:10:00.000Z',
    status: 'public',
  },
  {
    id: 'post-3',
    content: 'Khi cơ thể báo mệt, cậu không cần thắng thêm một trận nữa trong ngày. Dừng lại cũng là một kỹ năng.',
    topic: 'daily',
    authorLabel: 'Chị Linh',
    avatar: healerLinh,
    roleBadge: 'Người đồng hành',
    reactions: { like: 42, love: 37, care: 29, peace: 28 },
    userReaction: null,
    comments: [
      { id: 'cmt-3', author: 'Ẩn danh', avatar: userGioNhe, text: 'Câu này đúng lúc quá, cảm ơn chị.' },
    ],
    createdAt: '2026-06-26T17:40:00.000Z',
    status: 'public',
  },
  {
    id: 'post-4',
    content: 'Nếu khó ngủ vì lo, hãy viết ra 3 điều đang xoay trong đầu rồi chọn 1 điều nhỏ có thể làm vào sáng mai.',
    topic: 'family',
    authorLabel: 'BS Lan Hương',
    avatar: drLanHuong,
    roleBadge: 'Bác sĩ',
    reactions: { like: 15, love: 19, care: 11, peace: 22 },
    userReaction: null,
    comments: [],
    createdAt: '2026-06-25T22:35:00.000Z',
    status: 'public',
  },
]

export const flaggedPostSeed = [
  {
    id: 'flag-1',
    content: 'Mình viết một bài có tín hiệu nguy cơ và hệ thống đã giữ lại để admin xem kỹ hơn.',
    topic: 'daily',
    authorLabel: 'Ẩn danh',
    reason: 'Từ khóa rủi ro cao, cần kiểm duyệt thủ công',
    createdAt: '2026-06-27T09:05:00.000Z',
    status: 'flagged',
  },
]

export const healingVideos = [
  {
    id: 'vid-1',
    title: 'Thở 4-7-8 khi tim đập nhanh',
    topic: 'daily',
    doctorName: 'BS Lan Hương',
    doctorAvatar: drLanHuong,
    description: 'Một bài thở ngắn để hạ nhịp cơ thể trước khi học hoặc ngủ.',
    videoUrl: video1,
    likes: 1240,
    comments: 89,
  },
  {
    id: 'vid-2',
    title: 'Gỡ áp lực kỳ vọng gia đình',
    topic: 'family',
    doctorName: 'ThS. Tâm lý Mai Anh',
    doctorAvatar: drMaiAnh,
    description: 'Cách gọi tên cảm xúc mà không tự trách mình.',
    videoUrl: video2,
    likes: 876,
    comments: 46,
  },
  {
    id: 'vid-3',
    title: 'Ba phút trở về hiện tại',
    topic: 'study',
    doctorName: 'BS Minh Khôi',
    doctorAvatar: drDucMinh,
    description: 'Một chuỗi grounding nhanh khi đầu óc quá tải.',
    videoUrl: video3,
    likes: 642,
    comments: 31,
  },
  {
    id: 'vid-4',
    title: 'Khi một buổi khám kéo dài bao lâu',
    topic: 'other',
    doctorName: 'BS Mai Khánh Chi',
    doctorAvatar: drMaiKhanhChi,
    description: 'Một giải thích ngắn để giảm lo trước buổi gặp chuyên môn.',
    videoUrl: video4,
    likes: 540,
    comments: 28,
  },
  {
    id: 'vid-5',
    title: 'Tự nói với mình nhẹ hơn',
    topic: 'relationship',
    doctorName: 'Healer Hà An',
    doctorAvatar: healerHaAn,
    description: 'Một cách đổi giọng tự trách sang giọng nâng đỡ.',
    videoUrl: video5,
    likes: 410,
    comments: 22,
  },
  {
    id: 'vid-6',
    title: 'Dừng lại trước khi quá tải',
    topic: 'study',
    doctorName: 'Healer Minh',
    doctorAvatar: healerMinh,
    description: 'Bài tập kiểm tra cơ thể trong 60 giây.',
    videoUrl: video6,
    likes: 372,
    comments: 19,
  },
]

export const staffProfiles = {
  doctors: [
    { name: 'BS Lan Hương', role: 'Tâm lý học đường', avatar: drLanHuong },
    { name: 'BS Đức Minh', role: 'Lo âu và giấc ngủ', avatar: drDucMinh },
    { name: 'ThS. Mai Anh', role: 'Gia đình và kỳ vọng', avatar: drMaiAnh },
  ],
  healers: [
    { name: 'Chị Linh', role: 'Áp lực học tập', avatar: healerLinh },
    { name: 'Chị Hà An', role: 'Lắng nghe khủng hoảng', avatar: healerHaAn },
    { name: 'Anh Minh', role: 'Bạn bè và kết nối', avatar: healerMinh },
  ],
  users: [
    { name: 'Gió Nhẹ', role: 'Ẩn danh', avatar: userGioNhe },
    { name: 'Lá Non', role: 'Ẩn danh', avatar: userLaNon },
    { name: 'Mây Nhỏ', role: 'Ẩn danh', avatar: userMayNho },
  ],
}

export const fakeNotifications = [
  {
    id: 'noti-1',
    title: 'Chị Linh vừa phản hồi',
    body: 'Cậu có thể quay lại cuộc trò chuyện khi sẵn sàng.',
    time: '2 phút',
  },
  {
    id: 'noti-2',
    title: 'Nhắc viết nhật ký',
    body: 'Một dòng ngắn hôm nay cũng được tính là quay về với mình.',
    time: '18 phút',
  },
  {
    id: 'noti-3',
    title: 'Video mới ở Trạm chữa lành',
    body: 'BS Mai Anh vừa có bài 3 phút về áp lực kỳ vọng.',
    time: '1 giờ',
  },
]

export const staffQueues = {
  healer: [
    {
      id: 'conv-1',
      name: 'Lá Non',
      topic: 'Cô đơn sau khi chuyển trường',
      wait: '8 phút',
      risk: 'Vừa',
      insight: 'Nên mở bằng câu hỏi nhẹ, tránh ép kể chi tiết ngay.',
    },
    {
      id: 'conv-2',
      name: 'Nắng Mai',
      topic: 'Kỳ vọng gia đình',
      wait: '12 phút',
      risk: 'Cao',
      insight: 'Có cụm từ tuyệt vọng, cần hỏi về an toàn hiện tại.',
    },
    {
      id: 'conv-3',
      name: 'Gió Nhẹ',
      topic: 'Áp lực học tập',
      wait: '20 phút',
      risk: 'Thấp',
      insight: 'Người dùng đã thử viết nhật ký 2 ngày liên tiếp.',
    },
  ],
  doctor: [
    {
      id: 'case-1',
      name: 'Gió Nhẹ',
      topic: 'Mất ngủ và lo âu kéo dài',
      wait: 'Healer chuyển tuyến',
      risk: 'Cao',
      insight: 'Cần đánh giá chuyên môn, hỏi về thời lượng mất ngủ và hỗ trợ ngoài đời.',
    },
    {
      id: 'case-2',
      name: 'Mây Nhỏ',
      topic: 'Hoảng sợ trước kỳ thi',
      wait: 'Theo dõi hôm nay',
      risk: 'Vừa',
      insight: 'Có biểu hiện né tránh lớp học, nên gợi ý bài tập grounding.',
    },
  ],
}

export const pendingVideoSeed = [
  {
    id: 'pending-1',
    title: 'Nhận biết burnout học đường',
    topic: 'study',
    doctorName: 'BS Lan Hương',
    status: 'pending',
    reason: 'Chờ admin kiểm tra nội dung trước khi công khai',
  },
]

export const conversations = [
  {
    id: 1,
    name: 'Chị Linh',
    initials: 'L',
    color: 'from-sage to-sage-dark',
    online: true,
    lastMsg: 'Cậu cảm thấy thế nào sau buổi nói chuyện hôm qua?',
    time: '10 phút',
    unread: 2,
    messages: [
      { id: 1, sender: 'them', text: 'Chào Dương! Hôm nay cậu thế nào?', time: '14:20' },
      { id: 2, sender: 'me', text: 'Em chào chị! Em hơi mệt vì kỳ thi sắp tới ạ', time: '14:22' },
      { id: 3, sender: 'them', text: 'Chị hiểu. Áp lực học tập nhiều lúc khiến mình kiệt sức nhỉ. Cậu có muốn chia sẻ thêm không?', time: '14:23' },
      { id: 4, sender: 'me', text: 'Dạ em cảm thấy như mình không đủ giỏi, luôn phải cố gắng hơn nữa...', time: '14:25' },
      { id: 5, sender: 'them', text: 'Cảm giác đó rất bình thường. Nhưng cậu biết không, chỉ cần cậu đã cố gắng là đáng tự hào rồi', time: '14:26' },
      { id: 6, sender: 'them', text: 'Cậu cảm thấy thế nào sau buổi nói chuyện hôm qua?', time: '15:40' },
    ],
  },
  {
    id: 2,
    name: 'Anh Minh',
    initials: 'M',
    color: 'from-lavender to-lavender-light',
    online: false,
    lastMsg: 'Nhớ viết nhật ký trước khi ngủ nha!',
    time: '2 giờ',
    unread: 0,
    messages: [
      { id: 1, sender: 'them', text: 'Chào Dương! Tuần này cậu có gì muốn chia sẻ không?', time: '10:00' },
      { id: 2, sender: 'me', text: 'Em có chuyện buồn về bạn bè ạ', time: '10:05' },
      { id: 3, sender: 'them', text: 'Anh nghe đây. Cậu kể cho anh nghe nhé, không vội gì cả', time: '10:06' },
      { id: 4, sender: 'me', text: 'Em cảm giác mấy đứa bạn thân ngày càng xa cách, không ai hiểu em', time: '10:10' },
      { id: 5, sender: 'them', text: 'Đó là một cảm giác rất khó chịu. Cậu có muốn thử nói chuyện trực tiếp với bạn mình không?', time: '10:12' },
      { id: 6, sender: 'them', text: 'Nhớ viết nhật ký trước khi ngủ nha!', time: '21:30' },
    ],
  },
  {
    id: 3,
    name: 'Chị Hà',
    initials: 'H',
    color: 'from-petal to-coral',
    online: true,
    lastMsg: 'Bài tập thở hôm nay cậu làm chưa?',
    time: '5 giờ',
    unread: 1,
    messages: [
      { id: 1, sender: 'them', text: 'Dương ơi, hôm nay chị gửi cậu một bài tập mới nhé', time: '09:00' },
      { id: 2, sender: 'me', text: 'Dạ vâng ạ, em sẵn sàng rồi!', time: '09:15' },
      { id: 3, sender: 'them', text: 'Mỗi sáng khi thức dậy, cậu hít thở sâu 5 lần, rồi nghĩ về 3 điều mình biết ơn', time: '09:16' },
      { id: 4, sender: 'them', text: 'Bài tập thở hôm nay cậu làm chưa?', time: '11:00' },
    ],
  },
  {
    id: 4,
    name: 'An Nhiên Bot',
    initials: 'AN',
    color: 'from-sage-muted to-sage-ghost',
    online: true,
    lastMsg: 'Mình ở đây bất cứ khi nào cậu cần',
    time: 'Hôm qua',
    unread: 0,
    isBot: true,
    messages: [
      { id: 1, sender: 'them', text: 'Xin chào Dương! Mình là An Nhiên, trợ lý AI của cậu', time: '08:00' },
      { id: 2, sender: 'them', text: 'Cậu có thể chia sẻ với mình bất cứ điều gì. Mình luôn ở đây lắng nghe, không phán xét', time: '08:00' },
      { id: 3, sender: 'me', text: 'Cảm ơn bạn! Mình muốn hiểu thêm về cách quản lý stress', time: '08:30' },
      { id: 4, sender: 'them', text: 'Tuyệt vời! Có vài phương pháp mình gợi ý:\n\nThở sâu 4-7-8\nViết nhật ký cảm xúc\nĐi bộ trong thiên nhiên\nNghe nhạc thư giãn\n\nCậu muốn thử cái nào trước?', time: '08:31' },
      { id: 5, sender: 'them', text: 'Mình ở đây bất cứ khi nào cậu cần', time: '22:00' },
    ],
  },
]
