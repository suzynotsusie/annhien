const TOKEN_KEY = 'annhien_token'
const ROLE_KEY = 'annhien_role'
const USER_ID_KEY = 'annhien_user_id'
const NICKNAME_KEY = 'annhien_nickname'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export function readSession() {
  const token = localStorage.getItem(TOKEN_KEY)
  const role = localStorage.getItem(ROLE_KEY) || readRoleFromToken(token)
  const userId = localStorage.getItem(USER_ID_KEY)
  const nickname = localStorage.getItem(NICKNAME_KEY)

  return { token, role, userId, nickname }
}

export function saveSession({ token, role = 'user', userId, nickname }) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(ROLE_KEY, role)
  if (userId) localStorage.setItem(USER_ID_KEY, userId)
  if (nickname) localStorage.setItem(NICKNAME_KEY, nickname)
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ROLE_KEY)
  localStorage.removeItem(USER_ID_KEY)
  localStorage.removeItem(NICKNAME_KEY)
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
