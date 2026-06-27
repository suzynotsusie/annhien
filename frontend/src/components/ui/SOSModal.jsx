import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, HeartHandshake, LoaderCircle, Phone, ShieldAlert, X } from 'lucide-react'
import { apiFetch } from '../../lib/api-client'

const HOTLINES = [
  {
    name: 'Tổng đài quốc gia bảo vệ trẻ em',
    phone: '111',
    href: 'tel:111',
  },
  {
    name: 'Đường dây nóng Ngày Mai',
    phone: '096 306 1414',
    href: 'tel:0963061414',
  },
  {
    name: 'Tổng đài MindCare',
    phone: '1900 5999 30',
    href: 'tel:1900599930',
  },
]

export default function SOSModal({ open, message, onClose }) {
  const navigate = useNavigate()
  const [isConnecting, setIsConnecting] = useState(false)

  if (!open) return null

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      const conversation = await apiFetch('/api/conversations', {
        method: 'POST',
        body: JSON.stringify({}),
      })
      if (conversation?.conversationId) {
        sessionStorage.setItem('annhien_sos_conversation_id', conversation.conversationId)
      }
    } catch {
      sessionStorage.setItem('annhien_sos_pending', 'true')
    } finally {
      setIsConnecting(false)
      onClose?.()
      navigate('/tin-nhan', { state: { fromSOS: true } })
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-bark/35 px-4 py-6 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="sos-title"
        className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-red-200/80 bg-[#fff7f5] shadow-2xl shadow-red-950/15"
      >
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-red-200/35 blur-2xl" />
        <div className="absolute -bottom-20 -left-12 h-52 w-52 rounded-full bg-coral-light/70 blur-3xl" />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/75 text-bark-light/50 transition hover:bg-white hover:text-bark"
          aria-label="Đóng hộp thoại SOS"
        >
          <X size={18} />
        </button>

        <div className="relative p-6 sm:p-8">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-sm font-bold text-red-700">
            <ShieldAlert size={18} />
            Tín hiệu cần được hỗ trợ ngay
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex items-center justify-center">
              <div className="relative flex h-44 w-44 items-center justify-center rounded-full bg-gradient-to-br from-red-100 via-white to-coral-light shadow-inner shadow-red-200/70">
                <div className="absolute inset-5 rounded-full border border-red-200/70" />
                <AlertTriangle className="text-red-500" size={56} strokeWidth={1.8} />
              </div>
            </div>

            <div>
              <h2 id="sos-title" className="text-2xl font-bold tracking-tight text-bark sm:text-3xl">
                Cậu không cần ở một mình lúc này.
              </h2>
              <p className="mt-3 text-sm leading-6 text-bark-light/70">
                {message || 'Mình đang ở đây với cậu. Hãy dừng lại một nhịp, đặt chân xuống sàn, hít thở chậm và kết nối với một người thật ngay bây giờ.'}
              </p>

              <div className="mt-5 rounded-3xl border border-red-200/70 bg-white/65 p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-red-500">
                  Gọi hỗ trợ ngay
                </p>
                <div className="grid gap-2">
                  {HOTLINES.map((hotline) => (
                    <a
                      key={hotline.phone}
                      href={hotline.href}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-red-50 px-4 py-3 text-left transition hover:bg-red-100"
                    >
                      <span>
                        <span className="block text-sm font-bold text-bark">{hotline.name}</span>
                        <span className="text-xs text-bark-light/55">{hotline.phone}</span>
                      </span>
                      <Phone className="shrink-0 text-red-500" size={18} />
                    </a>
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-3xl border border-red-100 bg-white/55 p-4">
                <p className="text-sm leading-6 text-bark-light/70">
                  Nếu có thể, hãy di chuyển tới nơi có người khác ở gần và nói một câu rất ngắn: "Mình cần giúp đỡ ngay".
                </p>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-red-500 px-5 text-sm font-bold text-white shadow-lg shadow-red-500/25 transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-75"
                >
                  {isConnecting ? <LoaderCircle className="animate-spin" size={18} /> : <HeartHandshake size={18} />}
                  Kết nối ngay với Người đồng hành
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-12 rounded-2xl border border-red-200 bg-white/80 px-5 text-sm font-bold text-red-600 transition hover:bg-white"
                >
                  Mình sẽ ở lại trang này
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
