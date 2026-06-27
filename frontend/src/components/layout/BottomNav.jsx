import { NavLink } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCommentDots,
  faHouse,
  faUsers,
  faCompass,
  faUser,
} from '@fortawesome/free-solid-svg-icons'
import ThemeToggle from '../ui/ThemeToggle'

const tabs = [
  { icon: faHouse, label: 'Trang chủ', to: '/home' },
  { icon: faCommentDots, label: 'Tin nhắn', to: '/tin-nhan' },
  { icon: faUsers, label: 'Cộng đồng', to: '/cong-dong' },
  { icon: faCompass, label: 'Khám phá', to: '/tram-chua-lanh' },
  { icon: faUser, label: 'Hồ sơ', to: '/ho-so' },
]

export default function BottomNav() {
  return (
    <nav className="lg:hidden fixed z-30 bottom-0 left-0 right-0" id="bottom-nav">
      <div className="absolute -top-12 right-3">
        <ThemeToggle compact />
      </div>
      <div className="mx-2 mb-2 rounded-2xl bg-white/82 backdrop-blur-xl border border-bark-light/8 shadow-lg shadow-sage/5">
        <div className="flex items-center justify-around py-1.5">
          {tabs.map(({ icon, label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/home'}
              className={({ isActive }) => `
                flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1.5 py-2 rounded-xl
                transition-all duration-200
                ${isActive
                  ? 'text-sage'
                  : 'text-bark-light/35 hover:text-bark-light/55'
                }
              `}
              id={`tab-${to.replace('/', '') || 'home'}`}
              aria-label={label}
            >
              {({ isActive }) => (
                <>
                  <FontAwesomeIcon icon={icon} className="text-[14px]" />
                  <span className={`max-w-full truncate text-[9px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                    {label}
                  </span>
                  {isActive && <div className="w-1 h-1 rounded-full bg-sage mt-0.5" />}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
