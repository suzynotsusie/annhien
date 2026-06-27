export interface Doctor {
  id: string;
  name: string;
  role: 'doctor';
  avatar: string;
  title: string;
  credentials: string;
  specialties: string[];
  quote: string;
  approvedVideosCount: number;
}

export interface Healer {
  id: string;
  name: string;
  role: 'healer';
  avatar: string;
  specialties: string[];
  online: boolean;
  bio: string;
}

export interface Video {
  id: string;
  title: string;
  doctorId: string;
  doctorName: string;
  topic: string;
  videoUrl: string;
  description: string;
  likes: number;
  saved: number;
}

export const doctors: Doctor[] = [
  {
    id: "doc_1",
    name: "ThS. Bác sĩ Nguyễn Lân Hương",
    role: "doctor",
    avatar: "/assets/doctors/dr_lan_huong.png",
    title: "Chuyên gia Tâm lý Lâm sàng",
    credentials: "Thạc sĩ Tâm lý học lâm sàng - ĐH KHXH&NV Hà Nội. 8 năm kinh nghiệm tham vấn stress học đường và lo âu xã hội.",
    specialties: ["Áp lực đồng trang lứa", "Lo âu xã hội", "Khủng hoảng tuổi trẻ"],
    quote: "Cậu không cần phải hoàn hảo để được lắng nghe và yêu thương. Hãy cho phép bản thân được thở một nhịp chậm lại.",
    approvedVideosCount: 5
  },
  {
    id: "doc_2",
    name: "TS. Bác sĩ Trần Hoàng Nam",
    role: "doctor",
    avatar: "/assets/doctors/dr_hoang_nam.png",
    title: "Chuyên gia Trị liệu Gia đình & Trầm cảm",
    credentials: "Tiến sĩ Tâm lý học lâm sàng - Đại học Sư Phạm Hà Nội. Thành viên Hiệp hội Tâm lý học Việt Nam. 12 năm trị liệu chuyên sâu.",
    specialties: ["Áp lực gia đình", "Trầm cảm nhẹ", "Rối loạn giấc ngủ"],
    quote: "Đằng sau mỗi vết thương tinh thần là một câu chuyện cần được tôn trọng. Tớ ở đây để cùng cậu đi qua những ngày giông bão.",
    approvedVideosCount: 8
  },
  {
    id: "doc_3",
    name: "ThS. Bác sĩ Mai Khánh Chi",
    role: "doctor",
    avatar: "/assets/doctors/dr_mai_khanh_chi.png",
    title: "Chuyên gia Chữa lành Cảm xúc & Mối quan hệ",
    credentials: "Thạc sĩ Tâm lý học - ĐH Hoa Sen. Chuyên gia đào tạo kỹ năng tự thấu cảm và vượt qua tổn thương tâm lý.",
    specialties: ["Tổn thương mối quan hệ", "Tự chữa lành", "Cân bằng cuộc sống"],
    quote: "Yêu thương bản thân là hành trình dũng cảm nhất. Hãy bắt đầu bằng việc lắng nghe tiếng lòng của chính mình.",
    approvedVideosCount: 4
  },
  {
    id: "doc_4",
    name: "TS. Bác sĩ Lê Đức Minh",
    role: "doctor",
    avatar: "/assets/doctors/dr_duc_minh.png",
    title: "Chuyên gia Tâm lý Thanh thiếu niên",
    credentials: "Tiến sĩ Tâm lý học - ĐH Quốc gia Hà Nội. Cố vấn tâm lý học đường 15 năm. Chuyên về khủng hoảng bản sắc.",
    specialties: ["Khủng hoảng bản sắc", "ADHD & học đường", "Mối quan hệ cha mẹ – con cái"],
    quote: "Tuổi trẻ là hành trình tìm kiếm, không phải cuộc thi cần phải thắng. Bạn đang đi đúng hướng.",
    approvedVideosCount: 6
  },
  {
    id: "doc_5",
    name: "ThS. Bác sĩ Phạm Thị Mai Anh",
    role: "doctor",
    avatar: "/assets/doctors/dr_mai_anh.png",
    title: "Chuyên gia Lo âu Xã hội & Phát triển Cá nhân",
    credentials: "Thạc sĩ Tâm lý học - ĐH Hoa Sen TP.HCM. Chứng chỉ CBT quốc tế. 6 năm hỗ trợ thanh niên lo âu xã hội.",
    specialties: ["Lo âu xã hội", "Phát triển bản thân", "Vượt qua nỗi sợ hãi"],
    quote: "Sợ hãi không phải kẻ thù — đó là dấu hiệu bạn đang cố gắng lớn lên. Hãy để tôi đồng hành cùng bạn.",
    approvedVideosCount: 3
  }
];

export const healers: Healer[] = [
  {
    id: "heal_1",
    name: "Linh (Peer Supporter)",
    role: "healer",
    avatar: "/assets/healers/healer_linh.png",
    specialties: ["Áp lực thi cử", "Mất định hướng học tập"],
    online: true,
    bio: "Đã từng vượt qua giai đoạn kiệt sức (burnout) thời đại học. Rất sẵn sàng lắng nghe và chia sẻ cùng cậu những lúc mệt mỏi nhất."
  },
  {
    id: "heal_2",
    name: "Minh (Peer Supporter)",
    role: "healer",
    avatar: "/assets/healers/healer_minh.png",
    specialties: ["Mối quan hệ bạn bè", "Cô đơn học đường"],
    online: true,
    bio: "Tớ tin rằng ai cũng cần một người ngồi cạnh lặng im lắng nghe mà không phán xét. Hãy để tớ làm người bạn đồng hành của cậu nhé."
  },
  {
    id: "heal_3",
    name: "Hà An (Peer Supporter)",
    role: "healer",
    avatar: "/assets/healers/healer_ha_an.png",
    specialties: ["Kỳ vọng gia đình", "Rối loạn cảm xúc tuổi dậy thì"],
    online: false,
    bio: "Từng trải qua những mâu thuẫn thế hệ gay gắt với gia đình. Tớ ở đây để ôm lấy những suy nghĩ chất chứa trong lòng cậu."
  },
  {
    id: "heal_4",
    name: "Lê Thu Hằng (Peer Supporter)",
    role: "healer",
    avatar: "/assets/healers/healer_thu_hang.png",
    specialties: ["Kỳ vọng gia đình", "Mâu thuẫn thế hệ"],
    online: true,
    bio: "Từng trải qua những mâu thuẫn gay gắt với gia đình về chuyện chọn ngành, chọn nghề. Tớ ở đây để ôm lấy những suy nghĩ chất chứa trong lòng cậu."
  },
  {
    id: "heal_5",
    name: "Phạm Bảo Khánh (Peer Supporter)",
    role: "healer",
    avatar: "/assets/healers/healer_bao_khanh.png",
    specialties: ["Stress công việc", "Burnout & kiệt sức"],
    online: false,
    bio: "Đã trải qua burnout nặng khi đi làm năm đầu. Tớ hiểu cảm giác muốn bỏ tất cả và nghỉ ngơi — và tớ đã tìm lại được bản thân. Cậu cũng làm được."
  }
];

export const videos: Video[] = [
  {
    id: "vid_1",
    title: "Bài tập thở hạ hỏa tức thì 4-7-8 🌿",
    doctorId: "doc_1",
    doctorName: "ThS. BS Nguyễn Lân Hương",
    topic: "daily",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-meditating-woman-by-the-sea-43093-large.mp4",
    description: "Kỹ thuật thở 4-7-8 giúp hạ nhịp tim và giảm lo âu cấp tốc trong 60 giây.",
    likes: 1240,
    saved: 890
  },
  {
    id: "vid_2",
    title: "Chữa lành tâm hồn cùng tiếng suối rừng 🍃",
    doctorId: "doc_2",
    doctorName: "TS. BS Trần Hoàng Nam",
    topic: "daily",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4",
    description: "Âm thanh suối rừng giúp kích hoạt hệ thần kinh phó giao cảm, giảm cortisol.",
    likes: 948,
    saved: 712
  },
  {
    id: "vid_3",
    title: "Âm thanh tiếng mưa giúp ngủ ngon và giảm lo âu 🌧️",
    doctorId: "doc_3",
    doctorName: "ThS. BS Mai Khánh Chi",
    topic: "study",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-rain-drops-on-a-window-1521-large.mp4",
    description: "Tiếng mưa tự nhiên giúp mask tiếng ồn xung quanh và đưa tâm trí về trạng thái nghỉ ngơi.",
    likes: 2310,
    saved: 1850
  },
  {
    id: "vid_4",
    title: "Chánh niệm: Đi bộ thư giãn trong rừng nắng ☀️",
    doctorId: "doc_2",
    doctorName: "TS. BS Trần Hoàng Nam",
    topic: "daily",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-walking-in-a-sunny-forest-44917-large.mp4",
    description: "Bài tập đi bộ chánh niệm 10 phút giúp kéo sự chú ý về hiện tại và giảm vòng lặp suy nghĩ tiêu cực.",
    likes: 560,
    saved: 420
  },
  {
    id: "vid_5",
    title: "Bình minh mới — Tìm lại hy vọng mỗi sáng 🌅",
    doctorId: "doc_4",
    doctorName: "TS. BS Lê Đức Minh",
    topic: "daily",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-sunrise-nature-placeholder-large.mp4",
    description: "Mỗi buổi sáng là một cơ hội mới. Cùng TS. Lê Đức Minh bắt đầu ngày với tâm thế tích cực.",
    likes: 780,
    saved: 540
  },
  {
    id: "vid_6",
    title: "Sóng biển — Buông bỏ và thở 🌊",
    doctorId: "doc_5",
    doctorName: "ThS. BS Phạm Thị Mai Anh",
    topic: "relationship",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-waves-beach-placeholder-large.mp4",
    description: "Để tiếng sóng biển cuốn trôi lo lắng. Bài thiền hướng dẫn buông bỏ những điều ngoài tầm kiểm soát.",
    likes: 1560,
    saved: 1120
  }
];
