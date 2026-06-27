import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBell,
  faBookOpen,
  faChevronRight,
  faCommentDots,
  faLeaf,
  faPenNib,
  faShieldHalved,
  faWandMagicSparkles,
} from '@fortawesome/free-solid-svg-icons'
import { conversations } from '../components/messaging/MessagingPanel'

const moods = [
  { emoji: '😊', label: 'Tuyệt vời', bg: 'bg-sun-light/70', border: 'border-sun/50' },
  { emoji: '🙂', label: 'Ổn', bg: 'bg-sage-ghost', border: 'border-sage-light/30' },
  { emoji: '😐', label: 'Bình thường', bg: 'bg-mist-light/70', border: 'border-mist/45' },
  { emoji: '😮‍💨', label: 'Mệt mỏi', bg: 'bg-petal-light/70', border: 'border-petal/50' },
  { emoji: '😟', label: 'Lo lắng', bg: 'bg-lavender-light/70', border: 'border-lavender/50' },
]

const listeners = [
  { name: 'Chị Linh', tag: 'Áp lực học tập', initials: 'L', bg: 'bg-sage/10 text-sage-dark' },
  { name: 'Anh Minh', tag: 'Mối quan hệ', initials: 'M', bg: 'bg-lavender/15 text-lavender-dark' },
  { name: 'Chị Hà', tag: 'Trầm cảm nhẹ', initials: 'H', bg: 'bg-petal/15 text-coral-dark' },
  { name: 'Anh Khoa', tag: 'Lo âu xã hội', initials: 'K', bg: 'bg-mist/20 text-bark-light' },
]

const practices = [
  { title: 'Thở 4-7-8', desc: 'Một vòng thở ngắn để hạ nhịp tim trước khi học tiếp.' },
  { title: 'Ghi 3 dòng', desc: 'Viết điều đang nặng lòng, điều mình cần, và điều có thể làm ngay.' },
  { title: 'Nhắn người đồng hành', desc: 'Mở cuộc trò chuyện khi cảm xúc cần được lắng nghe.' },
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Chào buổi sáng'
  if (h < 18) return 'Chào buổi chiều'
  return 'Chào buổi tối'
}

export default function Home() {
  const nickname = localStorage.getItem('annhien_nickname') || 'Gió Nhẹ'
  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0)
  const latestConversation = conversations[0]

  return (
    <div className="min-h-dvh bg-cream">
      <div className="mx-auto w-full max-w-[1480px] px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <header className="mb-5 flex flex-col gap-4 rounded-3xl border border-white/70 bg-white/55 px-5 py-5 shadow-sm shadow-sage/5 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="max-w-3xl">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-sage">{getGreeting()}</p>
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-bark sm:text-4xl lg:text-5xl">
              Cậu thấy thế nào, <span className="text-sage-dark">{nickname}</span>?
            </h1>
            <p className="mt-2 max-w-[62ch] text-sm leading-6 text-bark-light/60">
              Chọn cảm xúc, viết vài dòng, hoặc mở một cuộc trò chuyện an toàn khi cần được lắng nghe.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/tin-nhan"
              className="relative inline-flex h-11 items-center gap-2 rounded-full bg-sage px-4 text-sm font-semibold text-white shadow-lg shadow-sage/20 transition-transform active:scale-[0.98]"
            >
              <FontAwesomeIcon icon={faCommentDots} className="text-sm" />
              Tin nhắn
              {totalUnread > 0 && (
                <span className="ml-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-sage-dark">
                  {totalUnread}
                </span>
              )}
            </Link>
            <button
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-bark-light/8 bg-white/70 text-bark-light/45 transition-colors hover:text-sage"
              aria-label="Thông báo"
            >
              <FontAwesomeIcon icon={faBell} />
            </button>
          </div>
        </header>

        <main className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.55fr)]">
          <section className="grid gap-4">
            <div className="rounded-3xl border border-white/70 bg-white/50 p-4 shadow-sm shadow-sage/5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold tracking-tight text-bark">Cảm xúc lúc này</h2>
                  <p className="text-xs text-bark-light/45">Chọn nhanh để An Nhiên gợi ý bước tiếp theo.</p>
                </div>
                <FontAwesomeIcon icon={faLeaf} className="text-sage" />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {moods.map((mood) => (
                  <button
                    key={mood.label}
                    className={`flex min-h-20 items-center gap-3 rounded-2xl border px-4 text-left transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-sage/8 active:scale-[0.98] ${mood.bg} ${mood.border}`}
                  >
                    <span className="text-2xl leading-none">{mood.emoji}</span>
                    <span className="text-sm font-semibold text-bark">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <Link
                to="/"
                className="group rounded-3xl border border-white/70 bg-white/60 p-5 shadow-sm shadow-sage/5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-sage/8"
              >
                <div className="flex h-full min-h-52 flex-col justify-between gap-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-ghost text-sage">
                      <FontAwesomeIcon icon={faBookOpen} />
                    </div>
                    <span className="rounded-full bg-sage-ghost px-3 py-1 text-xs font-bold text-sage-dark">Mở nhật ký</span>
                  </div>
                  <div>
                    <h2 className="mb-2 text-2xl font-bold tracking-tight text-bark">Nhật ký hôm nay</h2>
                    <p className="max-w-[56ch] text-sm leading-6 text-bark-light/58">
                      Trút bỏ suy nghĩ trong một không gian riêng tư, không phán xét.
                    </p>
                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-sage">
                      Viết dòng đầu tiên
                      <FontAwesomeIcon icon={faChevronRight} className="text-xs transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-3xl border border-white/70 bg-white/50 p-5">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-bark-light/38">Chuỗi nhật ký</p>
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-bold leading-none text-sage-dark">7</span>
                    <span className="pb-1 text-sm font-medium text-bark-light/55">ngày liên tiếp</span>
                  </div>
                </div>
                <div className="rounded-3xl border border-white/70 bg-sage-ghost/65 p-5">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-sage-dark/70">AI hỗ trợ</p>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sage text-white">
                      <FontAwesomeIcon icon={faWandMagicSparkles} />
                    </div>
                    <p className="text-sm leading-6 text-bark-light/70">
                      Gợi ý người đồng hành và bài tập nhẹ dựa trên cảm xúc hiện tại.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              <section className="rounded-3xl border border-white/70 bg-white/50 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-bold tracking-tight text-bark">Người đồng hành</h2>
                  <button className="text-sm font-bold text-sage">Xem tất cả</button>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
                  {listeners.map((person) => (
                    <button
                      key={person.name}
                      className="rounded-2xl border border-white/70 bg-white/55 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-sage/8 active:scale-[0.98]"
                    >
                      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${person.bg}`}>
                        <span className="text-sm font-bold">{person.initials}</span>
                      </div>
                      <p className="text-sm font-bold text-bark">{person.name}</p>
                      <p className="mt-1 truncate text-xs text-bark-light/45">{person.tag}</p>
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl border border-sage-light/20 bg-sage-ghost/55 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/65 text-sage">
                    <FontAwesomeIcon icon={faPenNib} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold tracking-tight text-bark">Lời nhắn hôm nay</h2>
                    <p className="text-xs text-bark-light/45">Một câu nhỏ để giữ nhịp dịu lại.</p>
                  </div>
                </div>
                <p className="text-xl font-light italic leading-8 text-bark">
                  "Cậu không cần phải hoàn hảo. Chỉ cần cậu là chính mình, thế đã là quá đủ rồi."
                </p>
              </section>
            </div>
          </section>

          <aside className="grid content-start gap-4">
            <Link
              to="/tin-nhan"
              className="rounded-3xl border border-white/70 bg-white/60 p-5 shadow-sm shadow-sage/5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-sage/8"
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold tracking-tight text-bark">Tin nhắn gần đây</h2>
                  <p className="text-xs text-bark-light/45">{totalUnread} tin chưa đọc</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage text-white">
                  <FontAwesomeIcon icon={faCommentDots} />
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-sage-ghost/55 p-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${latestConversation.color}`}>
                  <span className="text-sm font-bold text-white">{latestConversation.initials}</span>
                </div>
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <p className="truncate text-sm font-bold text-bark">{latestConversation.name}</p>
                    <span className="rounded-full bg-sage px-2 py-0.5 text-[10px] font-bold text-white">
                      {latestConversation.unread}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm leading-6 text-bark-light/60">{latestConversation.lastMsg}</p>
                </div>
              </div>
            </Link>

            <section className="rounded-3xl border border-white/70 bg-white/50 p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sage-ghost text-sage">
                  <FontAwesomeIcon icon={faShieldHalved} />
                </div>
                <div>
                  <h2 className="text-base font-bold tracking-tight text-bark">Kế hoạch dịu lại</h2>
                  <p className="text-xs text-bark-light/45">3 bước gọn cho hôm nay.</p>
                </div>
              </div>
              <div className="space-y-3">
                {practices.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-bark-light/6 bg-white/45 p-4">
                    <p className="text-sm font-bold text-bark">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-bark-light/52">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </main>
      </div>
    </div>
  )
}
