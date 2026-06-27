import { useState } from 'react'
import { AlertTriangle, HeartPulse, LoaderCircle, LockKeyhole, PenLine, Save, Sparkles } from 'lucide-react'
import { apiFetch } from '../../lib/api-client'
import { encryptClientSide } from '../../lib/crypto'
import { MOOD_OPTIONS } from '../../lib/moods'
import SOSModal from '../ui/SOSModal'

const HIGH_RISK_MESSAGE = 'Cảm ơn cậu đã nói ra điều này. Cậu không cần xử lý nó một mình. Hãy kết nối ngay với một người có thể ở cạnh cậu lúc này nhé.'

export default function JournalEditor({ onSaved }) {
  const [mood, setMood] = useState('okay')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [sosOpen, setSosOpen] = useState(false)
  const [sosMessage, setSosMessage] = useState('')

  const isBusy = status === 'triage' || status === 'saving'
  const selectedMood = MOOD_OPTIONS.find((item) => item.value === mood) || MOOD_OPTIONS[2]

  const handleSubmit = async (event) => {
    event.preventDefault()
    const plainText = content.trim()

    if (!plainText) {
      setError('Hãy viết ít nhất một dòng trước khi lưu nhé.')
      return
    }

    setError('')
    setStatus('triage')

    try {
      const triage = await apiFetch('/api/ai/triage', {
        method: 'POST',
        body: JSON.stringify({ plainText }),
      })

      if (triage?.triggerSOS === true || triage?.riskLevel === 'high') {
        setSosMessage(triage?.suggestedResponse || HIGH_RISK_MESSAGE)
        setSosOpen(true)
        setStatus('idle')
        return
      }

      const encryptedContent = encryptClientSide(plainText)
      setStatus('saving')

      const saved = await apiFetch('/api/journals', {
        method: 'POST',
        body: JSON.stringify({ encryptedContent, mood }),
      })

      setContent('')
      setMood('okay')
      setStatus('idle')
      onSaved?.(saved)
    } catch (err) {
      setStatus('idle')
      setError(err instanceof Error ? err.message : 'Không thể lưu nhật ký lúc này.')
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-[2rem] border border-white/75 bg-white/65 shadow-sm shadow-sage/5 backdrop-blur"
      >
        <div className="border-b border-bark-light/6 bg-gradient-to-r from-sage-ghost/80 to-white/40 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-sage-dark">
                <LockKeyhole size={14} />
                Nhật ký bảo mật
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-bark">Viết vài dòng cho lòng mình</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-bark-light/58">
                Nội dung sẽ được AI kiểm tra an toàn trước, sau đó mã hóa ở trình duyệt trước khi lưu vào cơ sở dữ liệu.
              </p>
            </div>
            <div className="rounded-2xl bg-white/75 px-4 py-3 text-sm text-bark-light/60">
              <span className="mr-2 text-xl">{selectedMood.icon}</span>
              {selectedMood.label}
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="mb-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-bark">
              <HeartPulse size={18} className="text-sage" />
              Hôm nay cậu đang ở đâu trên bản đồ cảm xúc?
            </div>
            <div className="grid gap-2 sm:grid-cols-5">
              {MOOD_OPTIONS.map((option) => {
                const isSelected = option.value === mood
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMood(option.value)}
                    className={[
                      'mood-btn rounded-2xl border px-3 py-3 text-left transition',
                      isSelected
                        ? 'border-sage/45 bg-sage-ghost shadow-sm shadow-sage/10'
                        : 'border-bark-light/8 bg-white/55 hover:border-sage/25 hover:bg-white/80',
                    ].join(' ')}
                  >
                    <span className="block text-2xl leading-none">{option.icon}</span>
                    <span className="mt-2 block text-sm font-bold text-bark">{option.label}</span>
                    <span className="mt-1 block text-[11px] leading-4 text-bark-light/42">{option.hint}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <label className="mb-3 flex items-center gap-2 text-sm font-bold text-bark" htmlFor="journal-content">
            <PenLine size={18} className="text-sage" />
            Điều gì đang ở trong lòng cậu?
          </label>
          <textarea
            id="journal-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            disabled={isBusy}
            rows={8}
            placeholder="Cứ viết ra như đang thì thầm với một người bạn an toàn..."
            className="glass-input min-h-52 w-full resize-y rounded-3xl px-4 py-4 text-sm leading-7 text-bark placeholder:text-bark-light/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
          />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2 text-xs leading-5 text-bark-light/50">
              {error ? (
                <>
                  <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-500" />
                  <span className="text-red-600">{error}</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} className="mt-0.5 shrink-0 text-sage" />
                  <span>Không gửi ảnh hoặc tệp kèm theo nhật ký. Không gian này chỉ lưu văn bản.</span>
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={isBusy}
              className="btn-primary inline-flex min-h-12 items-center justify-center gap-2 px-5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-75"
            >
              {isBusy ? <LoaderCircle className="animate-spin" size={18} /> : <Save size={18} />}
              {status === 'triage' ? 'Đang phân tích an toàn...' : status === 'saving' ? 'Đang mã hóa và lưu...' : 'Lưu nhật ký'}
            </button>
          </div>
        </div>
      </form>

      <SOSModal open={sosOpen} message={sosMessage} onClose={() => setSosOpen(false)} />
    </>
  )
}
