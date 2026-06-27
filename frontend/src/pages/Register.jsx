import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRight,
  faSeedling,
} from '@fortawesome/free-solid-svg-icons'
import { API_URL, saveSession } from '../lib/auth'

export default function Register() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, nickname }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Không thể đăng ký')
      }

      saveSession({
        token: data.token,
        role: data.role || 'user',
        userId: data.userId,
        nickname: data.nickname,
        onboarded: true,
      })

      navigate('/home')
    } catch (err) {
      setError(err.message || 'Lỗi hệ thống')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-cream font-sans selection:bg-sage/20 selection:text-sage-dark">
      <main className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-sm rounded-3xl border border-white/70 bg-white/55 p-8 shadow-sm shadow-sage/5">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sage text-white shadow-lg shadow-sage/30">
              <FontAwesomeIcon icon={faSeedling} className="text-2xl" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-bark">Đăng ký An Nhiên</h2>
            <p className="mt-2 text-sm text-bark-light/60">
              Tạo không gian riêng tư của bạn
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-bark">Tên đăng nhập</span>
              <input
                type="text"
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="h-12 rounded-2xl border border-bark-light/10 bg-white/75 px-4 text-sm text-bark outline-none transition focus:border-sage/45 focus:bg-white"
                placeholder="VD: nguoibenh123"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-bark">Mật khẩu</span>
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 rounded-2xl border border-bark-light/10 bg-white/75 px-4 text-sm text-bark outline-none transition focus:border-sage/45 focus:bg-white"
                placeholder="Ít nhất 6 ký tự"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-bark">Biệt danh hiển thị</span>
              <input
                type="text"
                required
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                className="h-12 rounded-2xl border border-bark-light/10 bg-white/75 px-4 text-sm text-bark outline-none transition focus:border-sage/45 focus:bg-white"
                placeholder="VD: Đám mây nhỏ"
              />
            </label>

            {error && (
              <div className="rounded-xl bg-coral/10 p-3 text-sm text-coral">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex h-12 items-center justify-center gap-2 rounded-2xl bg-bark font-bold text-white transition hover:bg-bark-dark active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? 'Đang tạo...' : 'Tạo tài khoản'}
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
            
            <p className="mt-4 text-center text-sm text-bark-light/60">
              Đã có tài khoản?{' '}
              <Link to="/login" className="font-bold text-sage hover:underline">
                Đăng nhập ngay
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  )
}
