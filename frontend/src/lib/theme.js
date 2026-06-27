const THEME_KEY = 'annhien_theme'

export function getStoredTheme() {
  return localStorage.getItem(THEME_KEY) || 'light'
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
  localStorage.setItem(THEME_KEY, theme)
}

export function applyStoredTheme() {
  const theme = getStoredTheme()
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
  return theme
}
