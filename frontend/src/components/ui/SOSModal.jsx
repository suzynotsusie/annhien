import { useState } from 'react'
import { createPortal } from 'react-dom'
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

  const modalContent = (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-bark/35 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4">
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="sos-title"
          className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-red-200/80 bg-[#fff7f5] shadow-2xl shadow-red-950/15"
        >
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-red-200/35 blur-2xl" />
          <div className="absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-coral-light/70 blur-3xl" />

          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/75 text-bark-light/50 transition hover:bg-white hover:text-bark"
            aria-label="Đóng hộp thoại SOS"
          >
            <X size={18} />
          </button>

          <div className="relative p-5 sm:p-6">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 shadow-inner shadow-red-200/70">
                <AlertTriangle className="text-red-500" size={20} strokeWidth={2} />
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-red-100/80 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-red-700">
                <ShieldAlert size={14} />
                Hỗ trợ khẩn cấp
              </div>
            </div>

            <h2 id="sos-title" className="text-xl font-bold tracking-tight text-bark">
              Cậu không cần ở một mình lúc này.
            </h2>
            <p className="mt-1 text-sm leading-snug text-bark-light/75">
              {message || 'Hãy dừng lại một nhịp, đặt chân xuống sàn, hít thở chậm và kết nối với một người thật ngay bây giờ.'}
            </p>

            <div className="mt-4 grid gap-1.5">
              {HOTLINES.map((hotline) => (
                <a
                  key={hotline.phone}
                  href={hotline.href}
                  className="group flex items-center justify-between gap-3 rounded-xl bg-white/65 px-3 py-2.5 transition hover:bg-red-50"
                >
                  <div>
                    <div className="text-sm font-bold text-bark transition group-hover:text-red-700">{hotline.name}</div>
                    <div className="text-xs font-medium text-bark-light/60">{hotline.phone}</div>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100/50 text-red-500 transition group-hover:bg-red-200 group-hover:text-red-600">
                    <Phone size={14} />
                  </div>
                </a>
              ))}
            </div>

            <div className="mt-3 rounded-xl border border-red-100 bg-white/55 p-3 text-sm leading-snug text-bark-light/70">
              Di chuyển tới nơi có người và nói một câu ngắn: <span className="font-bold text-bark">"Mình cần giúp đỡ"</span>.
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleConnect}
                disabled={isConnecting}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-5 text-sm font-bold text-white shadow-md shadow-red-500/25 transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-75"
              >
                {isConnecting ? <LoaderCircle className="animate-spin" size={16} /> : <HeartHandshake size={16} />}
                Kết nối ngay với Người đồng hành
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex min-h-10 w-full items-center justify-center rounded-xl px-5 text-sm font-bold text-red-500/80 transition hover:bg-red-50 hover:text-red-600"
              >
                Mình sẽ ở lại trang này
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
