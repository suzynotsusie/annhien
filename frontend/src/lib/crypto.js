export function encryptClientSide(plainText) {
  return btoa(encodeURIComponent(plainText || ''))
}

export function decryptClientSide(cipherText) {
  try {
    if (!cipherText || typeof cipherText !== 'string') return ''
    return decodeURIComponent(atob(cipherText))
  } catch {
    return ''
  }
}

export function looksLikeBase64(value) {
  if (!value || typeof value !== 'string') return false
  return /^[A-Za-z0-9+/]+={0,2}$/.test(value)
}
