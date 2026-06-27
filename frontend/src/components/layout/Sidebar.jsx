import { NavLink } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCommentDots,
  faHouse,
  faUsers,
  faSpa,
  faUser,
  faLeaf,
} from '@fortawesome/free-solid-svg-icons'
import ThemeToggle from '../ui/ThemeToggle'

const navItems = [
  { icon: faHouse, label: 'Trang chủ', to: '/home' },
  { icon: faCommentDots, label: 'Tin nhắn', to: '/tin-nhan' },
  { icon: faUsers, label: 'Cộng đồng', to: '/cong-dong' },
  { icon: faSpa, label: 'Chữa lành', to: '/tram-chua-lanh' },
  { icon: faUser, label: 'Hồ sơ', to: '/ho-so' },
]

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 z-40
      flex-col bg-cream/92 border-r border-bark-light/6 backdrop-blur">

      {/* ─── Logo ─── */}
      <div className="px-5 pt-6 pb-5 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-sage
          flex items-center justify-center">
          <FontAwesomeIcon icon={faLeaf} className="text-white text-sm" />
        </div>
        <span className="text-sm font-bold text-bark tracking-tight">An Nhiên</span>
      </div>

      {/* ─── Navigation ─── */}
      <nav className="flex-1 px-3 py-1 space-y-1">
        {navItems.map(({ icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/home'}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-3 rounded-2xl relative
              transition-all duration-200 group
              ${isActive
                ? 'text-sage-dark bg-sage/8'
                : 'text-bark-light/45 hover:text-bark-light/70 hover:bg-bark-light/4'
              }
            `}
          >
            {({ isActive }) => (
              <>
                {/* Active indicator — thin left accent */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-sage" />
                )}
                <FontAwesomeIcon icon={icon} className={`text-sm w-4 ${isActive ? 'text-sage' : ''}`} />
                <span className={`text-[13px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ─── User info compact ─── */}
      <div className="grid gap-3 px-4 pb-5">
        <ThemeToggle />
        <div className="flex items-center gap-2.5 px-2 py-2.5">
          <div className="w-8 h-8 rounded-lg bg-sage/10 flex items-center justify-center">
            <FontAwesomeIcon icon={faUser} className="text-xs text-sage" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-bark truncate">
              {localStorage.getItem('annhien_nickname') || 'Người dùng'}
            </p>
            <p className="text-[10px] text-bark-light/35 font-light">Ẩn danh</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
