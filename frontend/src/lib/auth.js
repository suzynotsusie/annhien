const TOKEN_KEY = 'annhien_token'
const ROLE_KEY = 'annhien_role'
const USER_ID_KEY = 'annhien_user_id'
const NICKNAME_KEY = 'annhien_nickname'
const ONBOARDED_KEY = 'annhien_user_onboarded'

export const STAFF_ROLES = ['doctor', 'healer', 'admin']

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export function readSession() {
  const token = localStorage.getItem(TOKEN_KEY)
  const role = localStorage.getItem(ROLE_KEY) || readRoleFromToken(token)
  const userId = localStorage.getItem(USER_ID_KEY)
  const nickname = localStorage.getItem(NICKNAME_KEY)
  const onboarded = localStorage.getItem(ONBOARDED_KEY) === 'true'

  return { token, role, userId, nickname, onboarded }
}

export function saveSession({ token, role = 'user', userId, nickname, onboarded }) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(ROLE_KEY, role)
  if (userId) localStorage.setItem(USER_ID_KEY, userId)
  if (nickname) localStorage.setItem(NICKNAME_KEY, nickname)
  if (typeof onboarded === 'boolean') localStorage.setItem(ONBOARDED_KEY, onboarded ? 'true' : 'false')
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ROLE_KEY)
  localStorage.removeItem(USER_ID_KEY)
  localStorage.removeItem(NICKNAME_KEY)
  localStorage.removeItem(ONBOARDED_KEY)
}

export function isStaffRole(role) {
  return STAFF_ROLES.includes(role)
}

export function markUserOnboarded() {
  localStorage.setItem(ONBOARDED_KEY, 'true')
}

export function roleHome(role, onboarded = false) {
  if (role === 'doctor') return '/doctor'
  if (role === 'healer') return '/healer'
  if (role === 'admin') return '/admin'
  if (role === 'user') return onboarded ? '/home' : '/onboarding'
  return '/login'
}

function readRoleFromToken(token) {
  if (!token || token.startsWith('demo_token_')) return null

  try {
    const [, payload] = token.split('.')
    if (!payload) return null
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = JSON.parse(atob(normalized))
    return json.role || null
  } catch {
    return null
  }
}
