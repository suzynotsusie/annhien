import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRight,
  faBriefcaseMedical,
  faCircleNodes,
  faLeaf,
  faLock,
  faPeopleArrows,
  faUser,
  faUserDoctor,
  faUserShield,
} from '@fortawesome/free-solid-svg-icons'
import { API_URL, roleHome, saveSession } from '../lib/auth'

const demoAccounts = [
  { role: 'user', label: 'User', username: 'user_gionhe', icon: faUser, hint: 'Vào onboarding rồi tới app user' },
  { role: 'doctor', label: 'Doctor', username: 'dr_lanhuong', icon: faUserDoctor, hint: 'Workspace bác sĩ' },
  { role: 'healer', label: 'Healer', username: 'healer_linh', icon: faPeopleArrows, hint: 'Nhận ca user' },
  { role: 'admin', label: 'Admin', username: 'admin', icon: faUserShield, hint: 'Duyệt bài cộng đồng' },
]

export default function Portal() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || 'Không thể đăng nhập')

      saveSession({
        token: data.token,
        role: data.role,
        userId: data.userId,
        nickname: data.nickname,
        onboarded: data.role !== 'user',
      })

      navigate(roleHome(data.role, data.role !== 'user'), { replace: true })
    } catch (err) {
      setError(err.message || 'Không thể đăng nhập')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-dvh bg-cream px-4 py-5">
      <div className="mx-auto grid min-h-[calc(100dvh-2.5rem)] w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/70 bg-white/55 shadow-xl shadow-sage/8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="hidden border-r border-bark-light/6 bg-sage-ghost/45 p-8 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="mb-10 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage text-white">
                <FontAwesomeIcon icon={faLeaf} />
              </div>
              <span className="text-base font-bold tracking-tight text-bark">An Nhiên Portal</span>
            </div>

            <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-sage">Role access</p>
            <h1 className="max-w-lg text-4xl font-bold leading-tight tracking-tight text-bark">
              Một cổng vào, bốn trải nghiệm riêng.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-bark-light/58">
              Đăng nhập xong hệ thống tự đọc role: user, bác sĩ, healer hoặc admin rồi điều hướng đúng giao diện.
            </p>
          </div>

          <div className="grid gap-3">
            {[
              { icon: faCircleNodes, title: 'Luồng role rõ ràng', text: 'User mới onboarding, staff đi thẳng workspace.' },
              { icon: faBriefcaseMedical, title: 'Không lẫn vai trò', text: 'Bác sĩ, healer và admin không phải chọn trạng thái user.' },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/70 bg-white/55 p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-sage/10 text-sage">
                  <FontAwesomeIcon icon={item.icon} />
                </div>
                <p className="text-sm font-bold text-bark">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-bark-light/50">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center p-5 sm:p-8">
          <div className="w-full max-w-sm">
            <div className="mb-8 lg:hidden">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-sage text-white">
                <FontAwesomeIcon icon={faLeaf} />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-bark">An Nhiên Portal</h1>
            </div>

            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-sage">Đăng nhập</p>
            <h2 className="text-3xl font-bold tracking-tight text-bark">Chọn đúng vai trò</h2>
            <p className="mt-2 text-sm leading-6 text-bark-light/55">
              User vào trải nghiệm ẩn danh. Bác sĩ, healer và admin vào workspace riêng.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2">
              {demoAccounts.map((account) => (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => {
                    setUsername(account.username)
                    setError('')
                  }}
                  className="rounded-2xl border border-bark-light/8 bg-white/58 p-3 text-left transition hover:-translate-y-0.5 hover:border-sage/30 hover:bg-white active:scale-[0.98]"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sage-ghost text-sage">
                      <FontAwesomeIcon icon={account.icon} className="text-xs" />
                    </span>
                    <span className="text-xs font-bold text-bark">{account.label}</span>
                  </div>
                  <p className="text-[11px] leading-4 text-bark-light/48">{account.username}</p>
                  <p className="mt-1 text-[10px] leading-4 text-bark-light/36">{account.hint}</p>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-bark">Tài khoản</span>
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  className="h-12 rounded-2xl border border-bark-light/10 bg-white/75 px-4 text-sm text-bark outline-none transition focus:border-sage/45 focus:bg-white"
                  placeholder="user_gionhe, dr_lanhuong, healer_linh, admin"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-bark">Mật khẩu</span>
                <div className="relative">
                  <FontAwesomeIcon icon={faLock} className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-bark-light/30" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    className="h-12 w-full rounded-2xl border border-bark-light/10 bg-white/75 pl-10 pr-4 text-sm text-bark outline-none transition focus:border-sage/45 focus:bg-white"
                    placeholder="••••••••"
                  />
                </div>
              </label>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 flex h-12 items-center justify-center gap-2 rounded-full bg-sage px-5 text-sm font-bold text-white shadow-lg shadow-sage/20 transition hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Đang kiểm tra...' : 'Đăng nhập'}
                {!isLoading && <FontAwesomeIcon icon={faArrowRight} className="text-xs" />}
              </button>
            </form>

            <p className="mt-5 text-xs leading-5 text-bark-light/38">
              Mật khẩu demo local là giá trị bạn đặt ở <span className="font-bold text-sage-dark">LOCAL_DEMO_PASSWORD</span>. Backend trả token có role để frontend phân quyền.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
