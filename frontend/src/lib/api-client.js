import { API_URL, readSession } from './auth'

export async function apiFetch(path, options = {}) {
  const { token } = readSession()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: 'Bearer ' + token } : {}),
    ...(options.headers || {}),
  }

  const response = await fetch(API_URL + path, {
    ...options,
    headers,
  })

  const text = await response.text()
  const payload = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new Error(payload?.message || 'HTTP ' + response.status)
  }

  return payload
}
