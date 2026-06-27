import { useMemo, useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRightFromBracket,
  faBookOpen,
  faChartSimple,
  faPenNib,
  faUserDoctor,
  faUserGroup,
  faWandMagicSparkles,
} from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import { clearSession, readSession } from '../lib/auth'
import { decryptClientSide } from '../lib/crypto'
import { apiFetch } from '../lib/api-client'
import { moodOptions, staffProfiles } from '../lib/mockData'

export default function Profile() {
  const navigate = useNavigate()
  const session = readSession()
  const [report, setReport] = useState('')
  const [journals, setJournals] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const profileAsset = staffProfiles.users[0]

  useEffect(() => {
    const loadJournals = async () => {
      try {
        const payload = await apiFetch('/api/journals/me?limit=30')
        setJournals(Array.isArray(payload?.journals) ? payload.journals : [])
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    loadJournals()
  }, [])

  const moodStats = useMemo(() => {
    const total = Math.max(1, journals.length)
    return moodOptions.map((mood) => {
      const count = journals.filter((journal) => journal.mood === mood.id).length
      return { ...mood, count, percent: Math.round((count / total) * 100) }
    })
  }, [journals])

  const createReport = async () => {
    if (journals.length < 3) {
      setReport('Cậu cần thêm ít nhất 3 dòng nhật ký để báo cáo có ý nghĩa hơn. Hôm nay chỉ cần viết một đoạn ngắn cũng được.')
      return
    }

    setReport('Đang kết nối AI để phân tích dữ liệu cảm xúc...')
    try {
      const top3 = journals.slice(0, 3)
      const details = await Promise.all(top3.map(j => apiFetch('/api/journals/' + j.id).catch(() => null)))
      
      const latest = details.map(d => d ? decryptClientSide(d.encryptedContent || d.encrypted_content || '') : '').filter(Boolean)
      const anxious = journals.filter((journal) => journal.mood === 'anxious' || journal.mood === 'tired').length
      setReport(
        `Trong ${journals.length} lần check-in gần đây, cậu đã quay lại với bản thân khá đều. Có ${anxious} lần cảm xúc nặng hơn, nhưng việc cậu vẫn viết xuống cho thấy cậu đang tìm cách chăm sóc mình. Tuần này, thử giữ một thói quen nhỏ: viết 3 dòng trước khi ngủ và chọn một bài thở ở Trạm chữa lành. Điều cậu viết gần đây nhất: "${latest[0] || 'một điều riêng tư'}".`,
      )
    } catch {
      setReport('Đã có lỗi xảy ra khi tạo báo cáo. Vui lòng thử lại sau.')
    }
  }

  const logout = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-dvh bg-cream">
      <div className="mx-auto grid w-full max-w-[1480px] gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8 lg:py-6">
        <main className="grid gap-4">
          <header className="rounded-3xl border border-white/70 bg-white/58 p-5 shadow-sm shadow-sage/5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <img src={profileAsset.avatar} alt="Avatar ẩn danh" className="h-16 w-16 rounded-3xl object-cover shadow-sm shadow-sage/10" />
                <div>
                  <p className="text-sm font-bold text-sage-dark">Ẩn danh</p>
                  <h1 className="text-3xl font-bold tracking-tight text-bark">{session.nickname || 'Gió Nhẹ'}</h1>
                </div>
              </div>
              <button
                onClick={logout}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-bark-light/8 bg-white/70 px-4 text-sm font-bold text-bark-light/58 transition hover:text-sage active:scale-[0.98]"
              >
                <FontAwesomeIcon icon={faArrowRightFromBracket} className="text-xs" />
                Đăng xuất
              </button>
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/70 bg-white/58 p-5 shadow-sm shadow-sage/5">
              <FontAwesomeIcon icon={faPenNib} className="mb-5 text-sage" />
              <p className="text-5xl font-bold leading-none text-sage-dark">{journals.length}</p>
              <p className="mt-2 text-sm font-semibold text-bark">Dòng nhật ký</p>
            </div>
            <div className="rounded-3xl border border-white/70 bg-white/58 p-5 shadow-sm shadow-sage/5">
              <FontAwesomeIcon icon={faBookOpen} className="mb-5 text-sage" />
              <p className="text-5xl font-bold leading-none text-sage-dark">7</p>
              <p className="mt-2 text-sm font-semibold text-bark">Ngày duy trì</p>
            </div>
            <div className="rounded-3xl border border-white/70 bg-white/58 p-5 shadow-sm shadow-sage/5">
              <FontAwesomeIcon icon={faChartSimple} className="mb-5 text-sage" />
              <p className="text-5xl font-bold leading-none text-sage-dark">{moodStats.find((mood) => mood.count > 0)?.emoji || '🙂'}</p>
              <p className="mt-2 text-sm font-semibold text-bark">Mood gần đây</p>
            </div>
          </section>

          <section className="rounded-3xl border border-white/70 bg-white/58 p-5 shadow-sm shadow-sage/5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sage-ghost text-sage">
                <FontAwesomeIcon icon={faChartSimple} />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-bark">Xu hướng cảm xúc</h2>
                <p className="text-sm text-bark-light/45">Tính từ nhật ký lưu trên trình duyệt này.</p>
              </div>
            </div>
            <div className="grid gap-3">
              {moodStats.map((mood) => (
                <div key={mood.id} className="grid gap-2 sm:grid-cols-[150px_minmax(0,1fr)_56px] sm:items-center">
                  <div className="flex items-center gap-2 text-sm font-bold text-bark">
                    <span>{mood.emoji}</span>
                    <span>{mood.label}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-bark-light/7">
                    <div className="h-full rounded-full bg-sage" style={{ width: `${mood.percent}%` }} />
                  </div>
                  <p className="text-sm font-bold text-sage-dark sm:text-right">{mood.percent}%</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-sage-light/20 bg-sage-ghost/60 p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-bark">Báo cáo tiến trình</h2>
                <p className="mt-1 text-sm text-bark-light/50">Mô phỏng AI report từ dữ liệu frontend local.</p>
              </div>
              <button
                onClick={createReport}
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-sage px-4 text-sm font-bold text-white shadow-lg shadow-sage/18 transition active:scale-[0.98]"
              >
                <FontAwesomeIcon icon={faWandMagicSparkles} className="text-xs" />
                Tạo báo cáo
              </button>
            </div>
            <p className="whitespace-pre-line rounded-2xl border border-white/70 bg-white/52 p-4 text-sm leading-7 text-bark-light/72">
              {report || 'Khi có ít nhất 3 nhật ký, An Nhiên sẽ viết một đoạn nhìn lại thật dịu cho cậu.'}
            </p>
          </section>
        </main>

        <aside className="grid content-start gap-4">
          <section className="rounded-3xl border border-white/70 bg-white/58 p-5 shadow-sm shadow-sage/5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sage-ghost text-sage">
                <FontAwesomeIcon icon={faUserGroup} />
              </div>
              <h2 className="text-lg font-bold tracking-tight text-bark">Người đồng hành</h2>
            </div>
            <div className="mt-4 grid gap-3">
              {staffProfiles.healers.map((person) => (
                <div key={person.name} className="flex items-center gap-3 rounded-2xl border border-bark-light/7 bg-white/62 p-3">
                  <img src={person.avatar} alt={person.name} className="h-12 w-12 rounded-2xl object-cover" />
                  <div>
                    <p className="text-sm font-bold text-bark">{person.name}</p>
                    <p className="mt-1 text-xs leading-5 text-bark-light/50">{person.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/70 bg-white/58 p-5 shadow-sm shadow-sage/5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sage-ghost text-sage">
                <FontAwesomeIcon icon={faUserDoctor} />
              </div>
              <h2 className="text-lg font-bold tracking-tight text-bark">Bác sĩ tham vấn</h2>
            </div>
            <div className="grid gap-3">
              {staffProfiles.doctors.map((person) => (
                <div key={person.name} className="flex items-center gap-3 rounded-2xl border border-bark-light/7 bg-white/62 p-3">
                  <img src={person.avatar} alt={person.name} className="h-12 w-12 rounded-2xl object-cover" />
                  <div>
                    <p className="text-sm font-bold text-bark">{person.name}</p>
                    <p className="mt-1 text-xs leading-5 text-bark-light/50">{person.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/70 bg-white/58 p-5 shadow-sm shadow-sage/5">
            <h2 className="text-lg font-bold tracking-tight text-bark">Nhật ký gần đây</h2>
            <div className="mt-4 grid gap-3">
              {journals.slice(0, 4).map((journal) => (
                <div key={journal.id} className="rounded-2xl border border-bark-light/7 bg-white/62 p-4">
                  <p className="line-clamp-2 text-sm leading-6 text-bark">{decryptClientSide(journal.encryptedContent) || 'Nhật ký đã mã hóa'}</p>
                  <p className="mt-2 text-xs font-semibold text-sage-dark">
                    {moodOptions.find((mood) => mood.id === journal.mood)?.label || journal.mood}
                  </p>
                </div>
              ))}
              {journals.length === 0 && (
                <p className="rounded-2xl bg-sage-ghost/55 p-4 text-sm leading-6 text-bark-light/58">
                  Chưa có nhật ký nào trên trình duyệt này.
                </p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
