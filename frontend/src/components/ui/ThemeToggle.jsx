import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons'
import { applyTheme, getStoredTheme } from '../../lib/theme'

export default function ThemeToggle({ compact = false }) {
  const [theme, setTheme] = useState(() => getStoredTheme())
  const isDark = theme === 'dark'

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark'
    setTheme(next)
    applyTheme(next)
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center justify-center gap-2 rounded-full border border-bark-light/8 bg-white/72 font-bold text-bark-light/70 shadow-sm shadow-sage/5 transition hover:text-sage active:scale-[0.98] ${
        compact ? 'h-10 w-10' : 'h-11 px-4 text-sm'
      }`}
      aria-label={isDark ? 'Bật giao diện sáng' : 'Bật giao diện tối'}
      title={isDark ? 'Bật sáng' : 'Bật tối'}
    >
      <FontAwesomeIcon icon={isDark ? faSun : faMoon} className="text-sm" />
      {!compact && <span>{isDark ? 'Sáng' : 'Tối'}</span>}
    </button>
  )
}
