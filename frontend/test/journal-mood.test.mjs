import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const frontendRoot = fileURLToPath(new URL('..', import.meta.url))

if (!globalThis.btoa) {
  globalThis.btoa = (value) => Buffer.from(value, 'binary').toString('base64')
}

if (!globalThis.atob) {
  globalThis.atob = (value) => Buffer.from(value, 'base64').toString('binary')
}

async function readSource(relativePath) {
  return readFile(path.join(frontendRoot, relativePath), 'utf8')
}

async function importSource(relativePath) {
  return import(pathToFileURL(path.join(frontendRoot, relativePath)).href)
}

test('client crypto round-trips Vietnamese text and emoji safely', async () => {
  const { encryptClientSide, decryptClientSide } = await importSource('src/lib/crypto.js')
  const samples = [
    '',
    'Hôm nay mình thấy ổn hơn một chút.',
    'Mình lo lắng về kỳ thi, nhưng vẫn muốn thử thở chậm lại.',
    'Một dòng có emoji 🌿🫶 và dấu tiếng Việt đầy đủ.',
  ]

  for (const sample of samples) {
    assert.equal(decryptClientSide(encryptClientSide(sample)), sample)
  }
})

test('client crypto does not crash on corrupted ciphertext', async () => {
  const { decryptClientSide } = await importSource('src/lib/crypto.js')
  assert.equal(decryptClientSide('%%%not-valid-base64%%%'), '')
})

test('mood options match backend journal enum exactly', async () => {
  const { MOOD_OPTIONS } = await importSource('src/lib/moods.js')
  const values = MOOD_OPTIONS.map((item) => item.value)

  assert.deepEqual(values, ['great', 'good', 'okay', 'tired', 'anxious'])
  assert.equal(new Set(values).size, 5)

  for (const item of MOOD_OPTIONS) {
    assert.equal(typeof item.label, 'string')
    assert.equal(typeof item.icon, 'string')
    assert.match(item.bar, /^bg-/)
  }
})

test('api client attaches bearer token and JSON headers', async () => {
  const source = await readSource('src/lib/api-client.js')

  assert.match(source, /readSession\(\)/)
  assert.match(source, /'Content-Type': 'application\/json'/)
  assert.match(source, /Authorization: 'Bearer ' \+ token/)
  assert.match(source, /fetch\(API_URL \+ path/)
  assert.match(source, /throw new Error/)
})

test('journal editor follows triage before encrypted save flow', async () => {
  const source = await readSource('src/components/features/JournalEditor.jsx')

  assert.match(source, /apiFetch\('\/api\/ai\/triage'/)
  assert.match(source, /JSON\.stringify\(\{ plainText \}\)/)
  assert.match(source, /triage\?\.triggerSOS === true \|\| triage\?\.riskLevel === 'high'/)
  assert.match(source, /setSosOpen\(true\)/)
  assert.match(source, /encryptClientSide\(plainText\)/)
  assert.match(source, /apiFetch\('\/api\/journals'/)
  assert.match(source, /JSON\.stringify\(\{ encryptedContent, mood \}\)/)
  assert.doesNotMatch(source, /type=["']file["']|accept=["'][^"']*image|FormData|multipart|image_url|imageUrl|upload/i)
})

test('SOS modal exposes hotlines and creates a healer conversation before navigating', async () => {
  const source = await readSource('src/components/ui/SOSModal.jsx')

  assert.match(source, /096 306 1414/)
  assert.match(source, /tel:0963061414/)
  assert.match(source, /1900 5999 30/)
  assert.match(source, /tel:1900599930/)
  assert.match(source, /apiFetch\('\/api\/conversations'/)
  assert.match(source, /method: 'POST'/)
  assert.match(source, /navigate\('\/tin-nhan'/)
})

test('home page loads journal metadata, fetches detail, decrypts client-side, and renders mood dashboard', async () => {
  const source = await readSource('src/pages/Home.jsx')

  assert.match(source, /apiFetch\('\/api\/journals\/me\?limit=30&offset=0'\)/)
  assert.match(source, /apiFetch\('\/api\/journals\/' \+ journal\.id\)/)
  assert.match(source, /decryptClientSide\(cipherText\)/)
  assert.match(source, /<MoodChart journals=\{journals\}/)
  assert.match(source, /<JournalHistory/)
})

test('router supports requested journal and message aliases', async () => {
  const source = await readSource('src/App.jsx')

  assert.match(source, /path="\/trang-chu"/)
  assert.match(source, /path="\/tin-nhan"/)
  assert.match(source, /path="\/nhan-tin"/)
})
