const JOURNAL_KEY = 'annhien_journals'
const COMMUNITY_KEY = 'annhien_community_posts'
const FLAGGED_KEY = 'annhien_flagged_posts'
const PENDING_VIDEO_KEY = 'annhien_pending_videos'
const SAVED_VIDEO_KEY = 'annhien_saved_videos'

export function encryptClientSide(plainText) {
  const bytes = new TextEncoder().encode(plainText)
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

export function decryptClientSide(cipherText) {
  try {
    const binary = atob(cipherText)
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  } catch {
    return ''
  }
}

export function detectRisk(text) {
  const value = normalizeText(text)
  const highRiskTerms = [
    'tu tu',
    'tu sat',
    'khong muon song',
    'khong can ton tai',
    'muon bien mat',
    'reset game',
    'dang xuat khoi doi',
    'ket thuc het',
    'lam dau ban than',
  ]
  const matched = highRiskTerms.find((term) => value.includes(term))

  return {
    triggerSOS: Boolean(matched),
    riskLevel: matched ? 'high' : 'low',
    suggestedResponse: matched
      ? 'Cảm ơn cậu đã nói ra điều này. Hãy ở lại với hiện tại một chút, gọi cho người lớn tin cậy hoặc kết nối ngay với Người đồng hành.'
      : 'Nội dung đang an toàn để lưu lại.',
  }
}

export function detectBlockedContent(text) {
  const value = normalizeText(text)
  const blockedTerms = ['chui the', 'xuc pham', 'de doa nguoi khac']
  return blockedTerms.some((term) => value.includes(term))
}

export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function readJournals() {
  return readJSON(JOURNAL_KEY, [])
}

export function saveJournals(journals) {
  writeJSON(JOURNAL_KEY, journals)
}

export function readCommunityPosts(seed = []) {
  return readJSON(COMMUNITY_KEY, seed)
}

export function saveCommunityPosts(posts) {
  writeJSON(COMMUNITY_KEY, posts)
}

export function readFlaggedPosts(seed = []) {
  return readJSON(FLAGGED_KEY, seed)
}

export function saveFlaggedPosts(posts) {
  writeJSON(FLAGGED_KEY, posts)
}

export function readPendingVideos(seed = []) {
  return readJSON(PENDING_VIDEO_KEY, seed)
}

export function savePendingVideos(videos) {
  writeJSON(PENDING_VIDEO_KEY, videos)
}

export function readSavedVideos() {
  return readJSON(SAVED_VIDEO_KEY, [])
}

export function saveSavedVideos(videoIds) {
  writeJSON(SAVED_VIDEO_KEY, videoIds)
}

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}
