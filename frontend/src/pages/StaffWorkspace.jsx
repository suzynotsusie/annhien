import { useMemo, useState, useEffect } from 'react'
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
import { topicLabels } from '../lib/mockData'
import { apiFetch } from '../lib/api-client'
import MessagingPanel from '../components/messaging/MessagingPanel'

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
    queue: [],
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
    queue: [],
  },
}

export default function StaffWorkspace({ role }) {
  const navigate = useNavigate()
  const session = readSession()
  const config = workspaceCopy[role]
  const displayName = session.nickname || config.badge
  const [status, setStatus] = useState('online')
  const [queue, setQueue] = useState([])
  const [activeCaseId, setActiveCaseId] = useState(null)
  const [videoDraft, setVideoDraft] = useState({ title: '', topic: 'daily', videoUrl: '', description: '' })
  const [pendingVideos, setPendingVideos] = useState([])

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const payload = await apiFetch('/api/conversations/queue')
        setQueue(payload?.queue || [])
      } catch (err) {
        console.error(err)
      }
    }
    fetchQueue()
    const interval = setInterval(fetchQueue, 10000)
    return () => clearInterval(interval)
  }, [])

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

  const claimCase = async (id) => {
    if (!id) return
    try {
      await apiFetch(`/api/conversations/${id}/accept`, { method: 'PATCH' })
      setQueue((items) => items.filter(i => i.conversationId !== id))
      setActiveCaseId(id)
    } catch (err) {
      console.error(err)
    }
  }

  const claimNextCase = () => {
    if (queue.length > 0) claimCase(queue[0].conversationId)
  }

  const transferCase = async () => {
    if (!activeCaseId) return
    try {
      await apiFetch(`/api/conversations/${activeCaseId}/transfer`, { method: 'PATCH' })
      setActiveCaseId(null)
      alert('Đã chuyển ca này cho Bác sĩ (ca đã được đưa lại vào hàng chờ ưu tiên).')
    } catch (err) {
      console.error(err)
    }
  }

  const closeCase = async () => {
    if (!activeCaseId) return
    try {
      await apiFetch(`/api/conversations/${activeCaseId}/close`, { method: 'PATCH' })
      setActiveCaseId(null)
      alert('Đã đóng ca thành công.')
    } catch (err) {
      console.error(err)
    }
  }

  const addPendingVideo = async (event) => {
    event.preventDefault()
    if (!videoDraft.title.trim() || !videoDraft.videoUrl.trim()) return
    try {
      await apiFetch('/api/videos', {
        method: 'POST',
        body: JSON.stringify(videoDraft)
      })
      alert('Tải video thành công, đang chờ Admin duyệt.')
      setVideoDraft({ title: '', topic: 'daily', videoUrl: '', description: '' })
    } catch (err) {
      console.error(err)
    }
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
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-11 rounded-full border border-bark-light/8 bg-white/70 px-4 text-sm font-bold text-bark-light/70 outline-none"
            >
              <option value="online">Online</option>
              <option value="busy">Bận</option>
              <option value="offline">Offline</option>
            </select>
            <button
              onClick={claimNextCase}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-sage px-4 text-sm font-bold text-white shadow-lg shadow-sage/20"
            >
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
              {queue.map((item) => (
                <div 
                  key={item.conversationId} 
                  className="grid gap-3 rounded-2xl border border-bark-light/6 bg-white/55 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-sage/8 md:grid-cols-[150px_minmax(0,1fr)_210px] md:items-center group"
                >
                  <div>
                    <p className="font-bold text-bark">{item.userNickname || 'Ẩn danh'}</p>
                    <p className="mt-1 text-xs text-bark-light/42">
                      Đợi từ: {new Date(item.waitingSince).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-bark-light/70">Cần hỗ trợ</p>
                    {item.aiInsights && <p className="mt-1 text-xs leading-5 text-bark-light/45 truncate">{item.aiInsights}</p>}
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      claimCase(item.conversationId)
                    }}
                    className="rounded-full bg-sage-ghost px-4 py-2 text-xs font-bold text-sage-dark transition hover:bg-sage hover:text-white md:text-center"
                  >
                    Tiếp nhận ngay
                  </button>
                </div>
              ))}
              {queue.length === 0 && (
                <p className="rounded-2xl bg-sage-ghost/55 p-4 text-sm leading-6 text-bark-light/58">
                  Hàng chờ hiện trống. Bạn có thể thư giãn hoặc xem báo cáo.
                </p>
              )}
            </div>
          </div>

          <aside className="grid content-start gap-4">
            <section className="rounded-3xl border border-sage-light/20 bg-sage-ghost/60 p-5">
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
            </section>

            {role === 'doctor' ? (
              <section className="rounded-3xl border border-white/70 bg-white/58 p-5 shadow-sm shadow-sage/5">
                <h2 className="text-xl font-bold tracking-tight text-bark">Gửi video URL</h2>
                <p className="mt-1 text-sm leading-6 text-bark-light/50">Frontend mock, không upload file.</p>
                <form onSubmit={addPendingVideo} className="mt-4 grid gap-3">
                  <input
                    value={videoDraft.title}
                    onChange={(event) => setVideoDraft((draft) => ({ ...draft, title: event.target.value }))}
                    placeholder="Tiêu đề video"
                    className="h-11 rounded-2xl border border-bark-light/8 bg-white/70 px-4 text-sm outline-none focus:border-sage/40"
                  />
                  <select
                    value={videoDraft.topic}
                    onChange={(event) => setVideoDraft((draft) => ({ ...draft, topic: event.target.value }))}
                    className="h-11 rounded-2xl border border-bark-light/8 bg-white/70 px-4 text-sm outline-none focus:border-sage/40"
                  >
                    {Object.entries(topicLabels).filter(([key]) => key !== 'all').map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                  <input
                    value={videoDraft.videoUrl}
                    onChange={(event) => setVideoDraft((draft) => ({ ...draft, videoUrl: event.target.value }))}
                    placeholder="https://...mp4"
                    className="h-11 rounded-2xl border border-bark-light/8 bg-white/70 px-4 text-sm outline-none focus:border-sage/40"
                  />
                  <button className="h-11 rounded-full bg-sage text-sm font-bold text-white shadow-lg shadow-sage/18">
                    Đưa vào hàng chờ
                  </button>
                </form>
                <div className="mt-5 grid gap-2">
                  {pendingVideos.slice(0, 3).map((video) => (
                    <div key={video.id} className="rounded-2xl border border-bark-light/7 bg-white/58 p-3">
                      <p className="text-sm font-bold text-bark">{video.title}</p>
                      <p className="mt-1 text-xs text-bark-light/45">{topicLabels[video.topic]} · {video.status}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : (
              <section className="rounded-3xl border border-white/70 bg-white/58 p-5 shadow-sm shadow-sage/5">
                <h2 className="text-xl font-bold tracking-tight text-bark">Khung ca đang mở</h2>
                <p className="mt-2 text-sm leading-6 text-bark-light/58">
                  Healer có thể nhận ca kế tiếp, ghi nhận insight và chuyển bác sĩ khi cần.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button onClick={transferCase} className="h-11 rounded-full bg-sage text-sm font-bold text-white transition active:scale-95">Chuyển bác sĩ</button>
                  <button onClick={closeCase} className="h-11 rounded-full border border-bark-light/8 bg-white text-sm font-bold text-bark-light/58 transition active:scale-95">Đóng ca</button>
                </div>
              </section>
            )}
          </aside>
        </section>
      </div>
      
      {/* Messaging Panel for Staff */}
      <MessagingPanel isOpen={!!activeCaseId} onClose={() => setActiveCaseId(null)} activeId={activeCaseId} />
    </main>
  )
}
