import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHeartPulse,
  faPhone,
  faShieldHalved,
  faUserGroup,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'

const hotlines = [
  { name: 'Tổng đài quốc gia bảo vệ trẻ em', number: '111', href: 'tel:111' },
  { name: 'Đường dây nóng Ngày Mai', number: '096 306 1414', href: 'tel:0963061414' },
  { name: 'MindCare', number: '1900 5999 30', href: 'tel:1900599930' },
]

export default function SOSModal({ open, message, onClose }) {
  const navigate = useNavigate()

  if (!open) return null

  const connectNow = () => {
    onClose?.()
    navigate('/tin-nhan')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bark/35 px-4 py-6 backdrop-blur-sm">
      <section className="w-full max-w-xl overflow-hidden rounded-[28px] border border-red-100 bg-white shadow-2xl shadow-red-950/12">
        <div className="flex items-start justify-between gap-4 border-b border-red-100 bg-red-50 px-5 py-5">
          <div className="flex gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <FontAwesomeIcon icon={faHeartPulse} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-red-950">Cậu không cần ở một mình lúc này</h2>
              <p className="mt-2 text-sm leading-6 text-red-900/72">
                {message || 'Hãy dừng lại một nhịp, đặt điện thoại xuống nếu cần, và gọi cho người lớn tin cậy ở gần cậu.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/75 text-red-900/45 transition hover:text-red-700 active:scale-95"
            aria-label="Đóng SOS"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="grid gap-3 px-5 py-5">
          {hotlines.map((hotline) => (
            <a
              key={hotline.number}
              href={hotline.href}
              className="flex items-center justify-between gap-4 rounded-2xl border border-red-100 bg-red-50/45 px-4 py-3 text-left transition hover:bg-red-50 active:scale-[0.99]"
            >
              <span>
                <span className="block text-sm font-bold text-red-950">{hotline.name}</span>
                <span className="mt-1 block text-sm text-red-900/65">{hotline.number}</span>
              </span>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
                <FontAwesomeIcon icon={faPhone} className="text-sm" />
              </span>
            </a>
          ))}
        </div>

        <div className="grid gap-3 border-t border-red-100 bg-white px-5 py-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="flex items-start gap-3">
            <FontAwesomeIcon icon={faShieldHalved} className="mt-1 text-red-500" />
            <p className="text-sm leading-6 text-bark-light/70">
              Nếu cậu có thể, hãy di chuyển ra nơi có người khác ở gần và nói một câu rất ngắn: "Mình cần giúp đỡ ngay".
            </p>
          </div>
          <button
            onClick={connectNow}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-red-600 px-5 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <FontAwesomeIcon icon={faUserGroup} className="text-xs" />
            Kết nối Người đồng hành
          </button>
        </div>
      </section>
    </div>
  )
}
