import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { API_URL, saveSession } from '../lib/auth'
import {
  faLeaf,
  faShieldHalved,
  faArrowRight,
  faArrowLeft,
  faCheck,
  faSpinner,
  faBookOpen,
  faHouseChimney,
  faHandHoldingHeart,
  faFire,
  faCloud,
  faHeart,
} from '@fortawesome/free-solid-svg-icons'

/* ─── Stress Topics ─── */
const stressTopics = [
  { id: 'study', icon: faBookOpen, label: 'Áp lực học tập', desc: 'Thi cử, điểm số, kỳ vọng' },
  { id: 'family', icon: faHouseChimney, label: 'Kỳ vọng gia đình', desc: 'Cha mẹ, áp lực gia đình' },
  { id: 'lonely', icon: faHandHoldingHeart, label: 'Cô đơn, bạn bè', desc: 'Tình bạn, mối quan hệ' },
  { id: 'burnout', icon: faFire, label: 'Burnout hàng ngày', desc: 'Kiệt sức, mất động lực' },
  { id: 'other', icon: faCloud, label: 'Nỗi sợ khác', desc: 'Điều gì đó khác...' },
]

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 160 : -160,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction < 0 ? 160 : -160,
    opacity: 0,
  }),
}

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(0)
  const [selectedTopics, setSelectedTopics] = useState([])
  const [nickname, setNickname] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const goNext = () => {
    setDirection(1)
    setStep(prev => prev + 1)
  }

  const goBack = () => {
    setDirection(-1)
    setStep(prev => prev - 1)
  }

  const toggleTopic = (id) => {
    setSelectedTopics(prev =>
      prev.includes(id)
        ? prev.filter(t => t !== id)
        : [...prev, id]
    )
  }

  const handleFinish = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/auth/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: nickname.trim() || 'Người bạn ẩn danh',
          topics: selectedTopics,
          role: 'user',
        }),
      })

      if (!response.ok) throw new Error('Không thể kết nối')

      const data = await response.json()
      saveSession({
        token: data.token,
        role: data.role || 'user',
        userId: data.userId,
        nickname: data.nickname,
      })
      navigate('/')
    } catch {
      saveSession({
        token: 'demo_token_' + Date.now(),
        role: 'user',
        userId: 'demo_user_' + Date.now(),
        nickname: nickname.trim() || 'Người bạn ẩn danh',
      })
      navigate('/')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-cream flex flex-col items-center justify-center p-4 md:p-8">
      {/* Decorative blobs */}
      <div className="fixed -top-32 -right-32 w-96 h-96 rounded-full bg-sage-muted/30 blur-3xl pointer-events-none" />
      <div className="fixed -bottom-32 -left-32 w-96 h-96 rounded-full bg-lavender-light/30 blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg">
        {/* ─── Thin progress bar across top ─── */}
        <div className="w-full h-1 bg-bark-light/8 rounded-full mb-8 overflow-hidden">
          <motion.div 
            className="h-full bg-sage rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${((step + 1) / 3) * 100}%` }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        {/* ─── Steps Container ─── */}
        <div className="relative overflow-hidden min-h-[460px]">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            {/* ═══ STEP 1: Welcome (Asymmetric Split Layout) ═══ */}
            {step === 0 && (
              <motion.div
                key="step-0"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 380, damping: 35 }}
                className="w-full"
              >
                <div className="glass-card rounded-[24px] p-6 md:p-8 flex flex-col md:flex-row gap-8 items-stretch">
                  
                  {/* Left 40% - Logo/Brand statement */}
                  <div className="md:w-[40%] flex flex-col justify-between items-start md:border-r border-bark-light/8 md:pr-6">
                    <div>
                      <div className="w-12 h-12 mb-4 rounded-xl bg-sage flex items-center justify-center shadow-lg shadow-sage/15">
                        <FontAwesomeIcon icon={faLeaf} className="text-xl text-white" />
                      </div>
                      <h1 className="text-2xl font-bold text-bark tracking-tighter leading-none mb-2">
                        An Nhiên
                      </h1>
                      <p className="text-[13px] text-bark-light/65 leading-relaxed font-light">
                        Không gian lắng nghe và thấu cảm hoàn toàn ẩn danh cho riêng cậu.
                      </p>
                    </div>
                    <div className="hidden md:block">
                      <p className="text-[10px] text-bark-light/35 font-light">
                        Phiên bản MVP 1.0
                      </p>
                    </div>
                  </div>

                  {/* Right 60% - Content & Features */}
                  <div className="md:w-[60%] flex flex-col justify-between">
                    <div className="space-y-3.5 mb-6">
                      {[
                        { icon: faShieldHalved, title: 'Ẩn danh bảo mật', desc: 'Không cần email hay số điện thoại' },
                        { icon: faHeart, title: 'An toàn & Lắng nghe', desc: 'Mã hóa E2EE bảo vệ mọi chia sẻ' },
                        { icon: faLeaf, title: 'Kết nối thấu cảm', desc: 'Gặp chuyên gia và AI hỗ trợ 24/7' },
                      ].map(({ icon, title, desc }, i) => (
                        <div key={i} className="flex gap-3 items-start">
                          <div className="w-8 h-8 rounded-lg bg-sage-ghost flex items-center justify-center flex-shrink-0 mt-0.5">
                            <FontAwesomeIcon icon={icon} className="text-xs text-sage" />
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-bark leading-none mb-1">{title}</p>
                            <p className="text-xs text-bark-light/50 font-light leading-relaxed">{desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button onClick={goNext}
                      className="btn-primary w-full py-3 rounded-full text-xs font-semibold
                        flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-transform"
                      id="onboarding-next-1">
                      Bắt đầu ngay
                      <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                    </button>
                  </div>

                </div>
              </motion.div>
            )}

            {/* ═══ STEP 2: Stress Topics ═══ */}
            {step === 1 && (
              <motion.div
                key="step-1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 380, damping: 35 }}
                className="w-full"
              >
                <div className="glass-card rounded-[24px] p-6 md:p-8">
                  <div className="mb-6 text-left">
                    <h2 className="text-xl font-bold text-bark tracking-tighter mb-1.5">Áp lực cậu đang đối mặt?</h2>
                    <p className="text-xs text-bark-light/50 font-light leading-relaxed">
                      Để An Nhiên gợi ý người đồng hành và phương pháp xoa dịu thích hợp.
                    </p>
                  </div>

                  <div className="space-y-2 mb-6">
                    {stressTopics.map(topic => {
                      const isSelected = selectedTopics.includes(topic.id)
                      return (
                        <button key={topic.id} onClick={() => toggleTopic(topic.id)}
                          className={`
                            w-full flex items-center gap-3 p-3 rounded-xl text-left relative
                            transition-all duration-200 cursor-pointer border active:scale-[0.99]
                            ${isSelected
                              ? 'bg-sage-ghost/60 border-sage-light/35 shadow-sm'
                              : 'bg-white/40 border-bark-light/6 hover:bg-white/60 hover:border-sage-muted/30'
                            }
                          `}
                          id={`topic-${topic.id}`}>
                          {/* Selected state left-border indicator */}
                          {isSelected && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-sage" />
                          )}
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                            ${isSelected ? 'bg-sage/10 text-sage-dark' : 'bg-bark-light/5 text-bark-light/50'}`}>
                            <FontAwesomeIcon icon={topic.icon} className="text-sm" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs leading-none mb-1 ${isSelected ? 'font-bold text-sage-dark' : 'font-semibold text-bark'}`}>
                              {topic.label}
                            </p>
                            <p className="text-[11px] text-bark-light/40 font-light truncate">{topic.desc}</p>
                          </div>
                          <div className={`
                            w-5 h-5 rounded flex items-center justify-center transition-all duration-200
                            ${isSelected ? 'bg-sage text-white' : 'bg-white/60 border border-bark-light/15'}`}>
                            {isSelected && <FontAwesomeIcon icon={faCheck} className="text-[9px]" />}
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  <div className="flex gap-2.5">
                    <button onClick={goBack}
                      className="btn-secondary flex-shrink-0 w-11 h-11 rounded-full
                        flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                      id="onboarding-back-2">
                      <FontAwesomeIcon icon={faArrowLeft} className="text-xs text-bark-light/45" />
                    </button>
                    <button onClick={goNext}
                      className="btn-primary flex-1 py-3 rounded-full text-xs font-semibold
                        flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-transform"
                      id="onboarding-next-2">
                      Tiếp tục
                      <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ═══ STEP 3: Nickname ═══ */}
            {step === 2 && (
              <motion.div
                key="step-2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 380, damping: 35 }}
                className="w-full"
              >
                <div className="glass-card rounded-[24px] p-6 md:p-8">
                  <div className="mb-6 text-left">
                    <h2 className="text-xl font-bold text-bark tracking-tighter mb-1.5">Biệt danh ẩn danh</h2>
                    <p className="text-xs text-bark-light/50 font-light leading-relaxed">
                      Để mọi người và AI biết cách xưng hô với cậu.
                    </p>
                  </div>

                  {/* Nickname suggestions scroll bar */}
                  <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide py-1">
                    {['Mây Nhỏ', 'Lá Non', 'Gió Nhẹ', 'Sao Đêm', 'Nắng Mai'].map(name => (
                      <button key={name} onClick={() => setNickname(name)}
                        className={`
                          px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-200 cursor-pointer border flex-shrink-0 active:scale-95
                          ${nickname === name
                            ? 'bg-sage/10 border-sage/20 text-sage-dark'
                            : 'bg-white/40 border-bark-light/6 text-bark-light/50 hover:bg-white/60'
                          }
                        `}>
                        {name}
                      </button>
                    ))}
                  </div>

                  {/* Input container */}
                  <div className="mb-6">
                    <input
                      type="text"
                      value={nickname}
                      onChange={e => setNickname(e.target.value)}
                      placeholder="Nhập biệt danh của cậu..."
                      maxLength={20}
                      className="glass-input w-full px-4 py-3 rounded-xl text-xs text-bark
                        placeholder:text-bark-light/20 font-light
                        focus:outline-none transition-all"
                      id="nickname-input"
                    />
                    <div className="flex justify-between mt-1.5 px-1">
                      <span className="text-[10px] text-bark-light/30 font-light">Không dùng tên thật</span>
                      <span className="text-[10px] text-bark-light/35 font-light">{nickname.length}/20</span>
                    </div>
                  </div>

                  {/* Privacy shield info */}
                  <div className="rounded-xl bg-sage-ghost/40 border border-sage-light/10 p-3 mb-6">
                    <div className="flex gap-2.5 items-start">
                      <div className="w-7 h-7 rounded bg-sage/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FontAwesomeIcon icon={faShieldHalved} className="text-xs text-sage" />
                      </div>
                      <p className="text-[11px] text-bark-light/50 font-light leading-relaxed">
                        Mọi dữ liệu cá nhân hoàn toàn không được thu thập. Các tin nhắn và sổ tay được mã hóa E2EE đầu-cuối.
                      </p>
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs text-red-500 mb-3 font-medium text-center">{error}</p>
                  )}

                  <div className="flex gap-2.5">
                    <button onClick={goBack}
                      className="btn-secondary flex-shrink-0 w-11 h-11 rounded-full
                        flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                      id="onboarding-back-3"
                      disabled={isLoading}>
                      <FontAwesomeIcon icon={faArrowLeft} className="text-xs text-bark-light/45" />
                    </button>
                    <button onClick={handleFinish}
                      disabled={isLoading}
                      className="btn-primary flex-1 py-3 rounded-full text-xs font-semibold
                        flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-transform
                        disabled:opacity-60 disabled:cursor-not-allowed"
                      id="onboarding-finish">
                      {isLoading ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} className="text-xs animate-spin" />
                          Đang khởi tạo...
                        </>
                      ) : (
                        <>
                          Bắt đầu ngay
                          <FontAwesomeIcon icon={faLeaf} className="text-xs" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
