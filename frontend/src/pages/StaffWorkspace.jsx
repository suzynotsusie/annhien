import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRightFromBracket,
  faChartLine,
  faComments,
  faLeaf,
  faPlay,
  faShieldHalved,
  faUpload,
  faUserDoctor,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'
import { clearSession, readSession } from '../lib/auth'

const workspaceCopy = {
  doctor: {
    eyebrow: 'Doctor workspace',
    title: 'Quản lý nội dung chữa lành và hội thoại chuyên sâu.',
    intro: 'Tải video ngắn, xem tín hiệu cần can thiệp và theo dõi các ca được healer chuyển tiếp.',
    badge: 'Bác sĩ',
    primaryAction: 'Tải video mới',
    icon: faUserDoctor,
    cards: [
      { label: 'Video đã duyệt', value: '12', note: '3 video chờ kiểm tra', icon: faPlay },
      { label: 'Ca cần xem', value: '4', note: 'Ưu tiên trong hôm nay', icon: faShieldHalved },
      { label: 'Tương tác tuần này', value: '1.8k', note: 'Lượt xem và lưu video', icon: faChartLine },
    ],
    queueTitle: 'Ca chuyên sâu',
    queue: [
      { name: 'Gió Nhẹ', topic: 'Áp lực thi cử kéo dài', status: 'Healer đề xuất chuyển tuyến' },
      { name: 'Mây Nhỏ', topic: 'Mất ngủ 2 tuần', status: 'Cần đánh giá rủi ro' },
      { name: 'Sao Đêm', topic: 'Lo âu xã hội', status: 'Theo dõi sau phiên chat' },
    ],
  },
  healer: {
    eyebrow: 'Healer workspace',
    title: 'Bảng điều khiển nhận ca và đồng hành ẩn danh.',
    intro: 'Theo dõi hàng chờ, mở hội thoại đang active và ghi chú tín hiệu cảm xúc cho bác sĩ khi cần.',
    badge: 'Healer',
    primaryAction: 'Nhận ca tiếp theo',
    icon: faUsers,
    cards: [
      { label: 'Ca đang chờ', value: '8', note: '2 ca ưu tiên cao', icon: faComments },
      { label: 'Đang đồng hành', value: '5', note: '3 cuộc trò chuyện còn mở', icon: faUsers },
      { label: 'Tín hiệu ổn định', value: '76%', note: 'Dựa trên mood check-in', icon: faChartLine },
    ],
    queueTitle: 'Hàng chờ hôm nay',
    queue: [
      { name: 'Lá Non', topic: 'Cô đơn sau chuyển trường', status: 'Đang chờ kết nối' },
      { name: 'Nắng Mai', topic: 'Kỳ vọng gia đình', status: 'Cần phản hồi trong 10 phút' },
      { name: 'Gió Nhẹ', topic: 'Áp lực học tập', status: 'Đã có AI insight' },
    ],
  },
}

export default function StaffWorkspace({ role }) {
  const navigate = useNavigate()
  const session = readSession()
  const config = workspaceCopy[role]
  const displayName = session.nickname || config.badge

  const now = useMemo(() => (
    new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
    }).format(new Date())
  ), [])

  const handleLogout = () => {
    clearSession()
    navigate('/portal', { replace: true })
  }

  return (
    <main className="min-h-dvh bg-cream">
      <div className="mx-auto w-full max-w-[1480px] px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <header className="mb-4 flex flex-col gap-4 rounded-3xl border border-white/70 bg-white/58 p-5 shadow-sm shadow-sage/5 md:flex-row md:items-center md:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage text-white">
                <FontAwesomeIcon icon={config.icon} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-sage">{config.eyebrow}</p>
                <p className="text-xs text-bark-light/45">{now}</p>
              </div>
            </div>
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-bark md:text-5xl">{config.title}</h1>
            <p className="mt-3 max-w-[68ch] text-sm leading-6 text-bark-light/58">{config.intro}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-sage-ghost px-4 py-2 text-sm font-bold text-sage-dark">{displayName}</span>
            <button className="inline-flex h-11 items-center gap-2 rounded-full bg-sage px-4 text-sm font-bold text-white shadow-lg shadow-sage/20">
              <FontAwesomeIcon icon={role === 'doctor' ? faUpload : faComments} className="text-xs" />
              {config.primaryAction}
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-bark-light/8 bg-white/70 text-bark-light/45 transition hover:text-sage"
              aria-label="Đăng xuất"
            >
              <FontAwesomeIcon icon={faArrowRightFromBracket} />
            </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {config.cards.map((card) => (
            <div key={card.label} className="rounded-3xl border border-white/70 bg-white/55 p-5 shadow-sm shadow-sage/5">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-sm font-bold text-bark">{card.label}</p>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sage-ghost text-sage">
                  <FontAwesomeIcon icon={card.icon} />
                </div>
              </div>
              <p className="text-5xl font-bold leading-none text-sage-dark">{card.value}</p>
              <p className="mt-3 text-sm text-bark-light/50">{card.note}</p>
            </div>
          ))}
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="rounded-3xl border border-white/70 bg-white/55 p-5 shadow-sm shadow-sage/5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-bark">{config.queueTitle}</h2>
                <p className="mt-1 text-sm text-bark-light/48">Danh sách ưu tiên theo tín hiệu gần nhất.</p>
              </div>
              <FontAwesomeIcon icon={faLeaf} className="text-sage" />
            </div>

            <div className="grid gap-3">
              {config.queue.map((item) => (
                <button key={`${item.name}-${item.topic}`} className="grid gap-3 rounded-2xl border border-bark-light/6 bg-white/55 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-sage/8 md:grid-cols-[160px_minmax(0,1fr)_220px] md:items-center">
                  <div>
                    <p className="font-bold text-bark">{item.name}</p>
                    <p className="mt-1 text-xs text-bark-light/42">Ẩn danh</p>
                  </div>
                  <p className="text-sm font-medium text-bark-light/70">{item.topic}</p>
                  <span className="rounded-full bg-sage-ghost px-3 py-1 text-xs font-bold text-sage-dark md:text-center">
                    {item.status}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <aside className="rounded-3xl border border-sage-light/20 bg-sage-ghost/60 p-5">
            <h2 className="text-xl font-bold tracking-tight text-bark">Nguyên tắc vận hành</h2>
            <div className="mt-5 grid gap-3">
              {[
                'Không yêu cầu user lộ danh tính trong hội thoại.',
                'Chuyển bác sĩ khi có tín hiệu nguy cơ hoặc cần đánh giá chuyên môn.',
                'Ghi chú ngắn, rõ ngữ cảnh, tránh diễn giải quá mức.',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/70 bg-white/50 p-4 text-sm leading-6 text-bark-light/65">
                  {item}
                </div>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}
