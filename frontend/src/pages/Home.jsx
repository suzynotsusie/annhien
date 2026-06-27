import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  BookOpen,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  ChevronRight,
  Leaf,
  LockKeyhole,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Wind,
} from 'lucide-react'
import JournalEditor from '../components/features/JournalEditor'
import { apiFetch } from '../lib/api-client'
import { MOOD_OPTIONS } from '../lib/moods'
import { decryptClientSide } from '../lib/crypto'
import { fakeNotifications } from '../lib/mockData'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Chào buổi sáng'
  if (hour < 18) return 'Chào buổi chiều'
  return 'Chào buổi tối'
}

function formatDate(value) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

function formatTime(value) {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function moodMeta(value) {
  return MOOD_OPTIONS.find((item) => item.value === value) || MOOD_OPTIONS[2]
}

function MoodChart({ journals }) {
  const stats = useMemo(() => {
    return MOOD_OPTIONS.map((option) => {
      const count = journals.filter((journal) => journal.mood === option.value).length
      const percent = journals.length > 0 ? Math.round((count / journals.length) * 100) : 0
      return { ...option, count, percent }
    })
  }, [journals])

  return (
    <section className="rounded-[2rem] border border-white/75 bg-white/58 p-5 shadow-sm shadow-sage/5 backdrop-blur">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-sage-dark/70">Mood dashboard</p>
          <h2 className="text-lg font-bold tracking-tight text-bark">Biểu đồ cảm xúc</h2>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage-ghost text-sage">
          <ChartNoAxesColumnIncreasing size={20} />
        </div>
      </div>

      <div className="space-y-4">
        {stats.map((item) => (
          <div key={item.value}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-bark">
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </span>
              <span className="text-xs font-bold text-bark-light/45">{item.percent}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-bark-light/6">
              <div
                className={['h-full rounded-full transition-all duration-700', item.bar].join(' ')}
                style={{ width: item.percent + '%' }}
              />
            </div>
          </div>
        ))}
      </div>

      {journals.length === 0 && (
        <p className="mt-5 rounded-2xl bg-sage-ghost/55 px-4 py-3 text-sm leading-6 text-bark-light/58">
          Chưa có dữ liệu. Khi cậu lưu nhật ký đầu tiên, biểu đồ sẽ bắt đầu kể lại nhịp cảm xúc của cậu.
        </p>
      )}
    </section>
  )
}

function JournalHistory({ journals, selectedId, selectedContent, isLoadingDetail, onSelect }) {
  return (
    <section className="rounded-[2rem] border border-white/75 bg-white/58 p-5 shadow-sm shadow-sage/5 backdrop-blur">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-sage-dark/70">Timeline</p>
          <h2 className="text-lg font-bold tracking-tight text-bark">Lịch sử nhật ký</h2>
        </div>
        <CalendarDays className="text-sage" size={22} />
      </div>

      {journals.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-sage/25 bg-sage-ghost/35 p-6 text-center">
          <BookOpen className="mx-auto mb-3 text-sage" size={28} />
          <p className="text-sm font-semibold text-bark">Chưa có dòng nhật ký nào</p>
          <p className="mt-1 text-xs leading-5 text-bark-light/45">Hãy bắt đầu bằng một vài câu thật nhỏ ở khung bên trái.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {journals.map((journal) => {
            const meta = moodMeta(journal.mood)
            const isSelected = selectedId === journal.id

            return (
              <article key={journal.id} className="relative pl-5">
                <span className="absolute left-0 top-4 h-[calc(100%+0.75rem)] w-px bg-sage/15" />
                <span className="absolute left-[-5px] top-4 h-3 w-3 rounded-full border-2 border-white bg-sage" />

                <button
                  type="button"
                  onClick={() => onSelect(journal)}
                  className={[
                    'w-full rounded-3xl border p-4 text-left transition active:scale-[0.99]',
                    isSelected
                      ? 'border-sage/35 bg-sage-ghost/70 shadow-sm shadow-sage/8'
                      : 'border-bark-light/7 bg-white/55 hover:border-sage/25 hover:bg-white/80',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-bark">
                        <span className="mr-2">{meta.icon}</span>
                        {meta.label}
                      </p>
                      <p className="mt-1 text-xs text-bark-light/42">
                        {formatDate(journal.createdAt)} lúc {formatTime(journal.createdAt)}
                      </p>
                    </div>
                    <ChevronRight
                      size={17}
                      className={isSelected ? 'rotate-90 text-sage transition-transform' : 'text-bark-light/25 transition-transform'}
                    />
                  </div>

                  {isSelected && (
                    <div className="mt-4 rounded-2xl bg-white/75 p-4">
                      {isLoadingDetail ? (
                        <p className="text-sm text-bark-light/50">Đang giải mã nội dung...</p>
                      ) : selectedContent ? (
                        <p className="whitespace-pre-line text-sm leading-7 text-bark-light/78">{selectedContent}</p>
                      ) : (
                        <p className="text-sm text-red-600">Không thể giải mã nội dung nhật ký này.</p>
                      )}
                    </div>
                  )}
                </button>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default function Home() {
  const [journals, setJournals] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [selectedContent, setSelectedContent] = useState('')
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [savedNotice, setSavedNotice] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)

  const nickname = localStorage.getItem('annhien_nickname') || 'Gió Nhẹ'
  const latestJournal = journals[0]

  const loadJournals = async () => {
    setIsLoading(true)
    setError('')
    try {
      const payload = await apiFetch('/api/journals/me?limit=30&offset=0')
      setJournals(Array.isArray(payload?.journals) ? payload.journals : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải lịch sử nhật ký.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadJournals()
  }, [])

  const handleSaved = async () => {
    setSavedNotice('Nhật ký đã được mã hóa và lưu an toàn.')
    setSelectedId(null)
    setSelectedContent('')
    await loadJournals()
    window.setTimeout(() => setSavedNotice(''), 3500)
  }

  const handleSelectJournal = async (journal) => {
    if (selectedId === journal.id) {
      setSelectedId(null)
      setSelectedContent('')
      return
    }

    setSelectedId(journal.id)
    setSelectedContent('')
    setIsLoadingDetail(true)
    try {
      const detail = await apiFetch('/api/journals/' + journal.id)
      const cipherText = detail?.encryptedContent || detail?.encrypted_content || ''
      setSelectedContent(decryptClientSide(cipherText))
    } catch {
      setSelectedContent('')
    } finally {
      setIsLoadingDetail(false)
    }
  }

  return (
    <div className="min-h-dvh overflow-hidden bg-cream">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[8%] top-12 h-64 w-64 rounded-full bg-sage-ghost blur-3xl" />
        <div className="absolute right-[7%] top-1/3 h-72 w-72 rounded-full bg-sun-light/70 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-petal-light blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-[1480px] px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <header className="mb-5 rounded-[2rem] border border-white/75 bg-white/58 p-5 shadow-sm shadow-sage/5 backdrop-blur sm:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-4xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-sage-ghost px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-sage-dark">
                <Leaf size={14} />
                {getGreeting()}
              </div>
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-bark sm:text-4xl lg:text-5xl">
                Cậu thấy thế nào, <span className="text-sage-dark">{nickname}</span>?
              </h1>
              <p className="mt-3 max-w-[70ch] text-sm leading-6 text-bark-light/62">
                Một nơi riêng tư để viết xuống cảm xúc, theo dõi nhịp tâm trạng và gọi hỗ trợ ngay khi lòng mình quá nặng.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/tin-nhan"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-sage px-4 text-sm font-semibold text-white shadow-lg shadow-sage/20 transition-transform active:scale-[0.98]"
              >
                <MessageCircle size={17} />
                Tin nhắn
              </Link>
              <button
                type="button"
                onClick={loadJournals}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-bark-light/8 bg-white/70 px-4 text-sm font-semibold text-bark-light/60 transition hover:text-sage"
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                Làm mới
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifications((value) => !value)}
                  className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-bark-light/8 bg-white/70 text-bark-light/45 transition-colors hover:text-sage"
                  aria-label="Thông báo"
                >
                  <Bell size={17} />
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">
                    {fakeNotifications.length}
                  </span>
                </button>
                {showNotifications && (
                  <div className="absolute right-0 top-[3.25rem] z-40 w-[min(340px,calc(100vw-2rem))] rounded-3xl border border-white/70 bg-white/95 p-3 shadow-2xl shadow-sage/16 backdrop-blur">
                    <div className="mb-2 flex items-center justify-between px-2">
                      <h2 className="text-sm font-bold text-bark">Thông báo</h2>
                      <span className="rounded-full bg-sage-ghost px-2 py-1 text-[10px] font-bold text-sage-dark">Fake data</span>
                    </div>
                    <div className="grid gap-2">
                      {fakeNotifications.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="rounded-2xl bg-sage-ghost/55 p-3 text-left transition hover:bg-sage-ghost active:scale-[0.99]"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-bold text-bark">{item.title}</p>
                            <span className="shrink-0 text-[10px] font-semibold text-bark-light/42">{item.time}</span>
                          </div>
                          <p className="mt-1 text-xs leading-5 text-bark-light/60">{item.body}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="grid gap-5 xl:grid-cols-[minmax(0,1.28fr)_minmax(380px,0.72fr)]">
          <section className="grid gap-5">
            <section className="grid gap-4 rounded-[2rem] border border-white/75 bg-gradient-to-br from-sage-ghost/85 via-white/55 to-sun-light/55 p-5 shadow-sm shadow-sage/5 sm:p-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="flex flex-col justify-between gap-6">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-sage-dark">
                    <Wind size={14} />
                    Hít thở chánh niệm
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-bark">Một vòng thở trước khi viết</h2>
                  <p className="mt-3 text-sm leading-6 text-bark-light/62">
                    Hít vào 4 nhịp, giữ 7 nhịp, thở ra 8 nhịp. Khi vòng tròn co giãn, chỉ cần đi cùng nó một chút thôi.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-3xl bg-white/65 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-bark-light/38">Lần gần nhất</p>
                    <p className="mt-2 text-sm font-semibold text-bark">
                      {latestJournal ? formatDate(latestJournal.createdAt) : 'Chưa có'}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-white/65 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-bark-light/38">Số dòng</p>
                    <p className="mt-2 text-sm font-semibold text-bark">{journals.length} nhật ký</p>
                  </div>
                  <div className="rounded-3xl bg-white/65 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-bark-light/38">Riêng tư</p>
                    <p className="mt-2 text-sm font-semibold text-bark">Mã hóa client</p>
                  </div>
                </div>
              </div>

              <div className="flex min-h-72 items-center justify-center">
                <div className="relative flex h-56 w-56 items-center justify-center rounded-full bg-gradient-to-br from-sage-light via-sage to-sage-dark shadow-2xl shadow-sage/25 animate-breathe sm:h-64 sm:w-64">
                  <div className="absolute inset-8 rounded-full border border-white/35" />
                  <div className="absolute inset-16 rounded-full bg-white/18 blur-sm" />
                  <div className="relative text-center text-white">
                    <p className="text-xs font-bold uppercase tracking-[0.28em] opacity-80">Breathe</p>
                    <p className="mt-2 text-3xl font-bold">4-7-8</p>
                  </div>
                </div>
              </div>
            </section>

            {savedNotice && (
              <div className="flex items-center gap-2 rounded-3xl border border-sage/25 bg-sage-ghost px-4 py-3 text-sm font-semibold text-sage-dark">
                <ShieldCheck size={18} />
                {savedNotice}
              </div>
            )}

            <JournalEditor onSaved={handleSaved} />
          </section>

          <aside className="grid content-start gap-5">
            <section className="rounded-[2rem] border border-white/75 bg-white/58 p-5 shadow-sm shadow-sage/5 backdrop-blur">
              <div className="mb-4 flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage text-white">
                  <LockKeyhole size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-bark">Quy tắc an toàn</h2>
                  <p className="mt-1 text-sm leading-6 text-bark-light/58">
                    Nhật ký chỉ xử lý văn bản. Nội dung chi tiết chỉ được lấy khi cậu chọn mở từng dòng.
                  </p>
                </div>
              </div>
              <div className="grid gap-3">
                <div className="rounded-2xl bg-sage-ghost/60 p-4">
                  <p className="text-sm font-bold text-bark">AI triage trước khi lưu</p>
                  <p className="mt-1 text-xs leading-5 text-bark-light/52">Nếu có tín hiệu nguy cơ cao, hệ thống mở SOS thay vì lưu ngay.</p>
                </div>
                <div className="rounded-2xl bg-white/65 p-4">
                  <p className="text-sm font-bold text-bark">Mã hóa sau khi an toàn</p>
                  <p className="mt-1 text-xs leading-5 text-bark-light/52">Văn bản được chuyển sang Base64 ở trình duyệt theo yêu cầu MVP.</p>
                </div>
              </div>
            </section>

            <MoodChart journals={journals} />

            <JournalHistory
              journals={journals}
              selectedId={selectedId}
              selectedContent={selectedContent}
              isLoadingDetail={isLoadingDetail}
              onSelect={handleSelectJournal}
            />

            {error && (
              <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                {error}
              </div>
            )}

            {isLoading && (
              <div className="rounded-3xl border border-white/75 bg-white/58 px-4 py-3 text-sm text-bark-light/55">
                Đang tải lịch sử nhật ký...
              </div>
            )}

            <section className="rounded-[2rem] border border-sage-light/20 bg-sage-ghost/55 p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/65 text-sage">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold tracking-tight text-bark">Lời nhắc hôm nay</h2>
                  <p className="text-xs text-bark-light/45">Một câu nhỏ để giữ nhịp dịu lại.</p>
                </div>
              </div>
              <p className="text-xl font-light italic leading-8 text-bark">
                “Cậu không cần phải hoàn hảo. Chỉ cần cậu quay về chăm sóc mình thêm một chút, vậy đã là rất nhiều.”
              </p>
            </section>
          </aside>
        </main>
      </div>
    </div>
  )
}
