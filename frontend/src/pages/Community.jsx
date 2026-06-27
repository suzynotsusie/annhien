import { useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHeart,
  faLeaf,
  faPaperPlane,
  faShieldHalved,
  faUserDoctor,
  faUserGroup,
} from '@fortawesome/free-solid-svg-icons'
import SOSModal from '../components/ui/SOSModal'
import { communitySeed, communityTopics, topicLabels } from '../lib/mockData'
import {
  detectBlockedContent,
  detectRisk,
  readCommunityPosts,
  readFlaggedPosts,
  saveCommunityPosts,
  saveFlaggedPosts,
} from '../lib/clientSafety'

const reactionConfig = [
  { id: 'hug', label: 'Ôm chặt', icon: faHeart },
  { id: 'empathy', label: 'Đồng cảm', icon: faUserGroup },
  { id: 'peace', label: 'Bình yên', icon: faLeaf },
]

export default function Community() {
  const [activeTopic, setActiveTopic] = useState('all')
  const [content, setContent] = useState('')
  const [topic, setTopic] = useState('study')
  const [posts, setPosts] = useState(() => readCommunityPosts(communitySeed))
  const [notice, setNotice] = useState('')
  const [sos, setSos] = useState({ open: false, message: '' })

  const visiblePosts = useMemo(() => {
    return posts.filter((post) => post.status === 'public' && (activeTopic === 'all' || post.topic === activeTopic))
  }, [activeTopic, posts])

  const submitPost = (event) => {
    event.preventDefault()
    const trimmed = content.trim()
    if (!trimmed) return

    if (detectBlockedContent(trimmed)) {
      setNotice('Bài viết có nội dung gây tổn thương người khác nên chưa thể đăng.')
      return
    }

    const risk = detectRisk(trimmed)
    const nextPost = {
      id: `post-${Date.now()}`,
      content: trimmed,
      topic,
      authorLabel: 'Ẩn danh',
      roleBadge: null,
      reactions: { hug: 0, empathy: 0, peace: 0 },
      userReaction: null,
      createdAt: new Date().toISOString(),
      status: risk.triggerSOS ? 'flagged' : 'public',
    }

    if (risk.triggerSOS) {
      const flagged = [nextPost, ...readFlaggedPosts([])]
      saveFlaggedPosts(flagged)
      setSos({ open: true, message: risk.suggestedResponse })
      setNotice('Bài viết đã được giữ riêng để admin xem xét. SOS đã mở để cậu có hỗ trợ ngay.')
    } else {
      const nextPosts = [nextPost, ...posts]
      setPosts(nextPosts)
      saveCommunityPosts(nextPosts)
      setNotice('Đã đăng ẩn danh lên cộng đồng.')
    }

    setContent('')
  }

  const reactToPost = (postId, reactionId) => {
    const nextPosts = posts.map((post) => {
      if (post.id !== postId) return post

      const previous = post.userReaction
      const reactions = { ...post.reactions }
      if (previous) reactions[previous] = Math.max(0, reactions[previous] - 1)
      const nextReaction = previous === reactionId ? null : reactionId
      if (nextReaction) reactions[nextReaction] += 1

      return { ...post, reactions, userReaction: nextReaction }
    })

    setPosts(nextPosts)
    saveCommunityPosts(nextPosts)
  }

  return (
    <div className="min-h-dvh bg-cream">
      <div className="mx-auto grid w-full max-w-[1480px] gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8 lg:py-6">
        <main className="min-w-0">
          <header className="mb-4 rounded-3xl border border-white/70 bg-white/58 p-5 shadow-sm shadow-sage/5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-bark sm:text-4xl">Cộng đồng ẩn danh</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-bark-light/58">
                  Chia sẻ bằng chữ, không ảnh, không danh tính. Mọi tương tác ở đây ưu tiên sự dịu dàng và an toàn.
                </p>
              </div>
              <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sage text-white sm:flex">
                <FontAwesomeIcon icon={faShieldHalved} />
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {communityTopics.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTopic(item.id)}
                  className={`h-10 shrink-0 rounded-full px-4 text-sm font-bold transition active:scale-[0.98] ${
                    activeTopic === item.id
                      ? 'bg-sage text-white shadow-lg shadow-sage/18'
                      : 'border border-bark-light/8 bg-white/60 text-bark-light/60 hover:text-bark'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </header>

          <section className="grid gap-3">
            {visiblePosts.map((post) => (
              <article key={post.id} className="rounded-3xl border border-white/70 bg-white/58 p-5 shadow-sm shadow-sage/5">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-sage-ghost px-3 py-1 text-xs font-bold text-sage-dark">{post.authorLabel}</span>
                  {post.roleBadge && (
                    <span className="rounded-full bg-lavender-light/70 px-3 py-1 text-xs font-bold text-bark">
                      <FontAwesomeIcon icon={post.roleBadge === 'Bác sĩ' ? faUserDoctor : faUserGroup} className="mr-1 text-[10px]" />
                      {post.roleBadge}
                    </span>
                  )}
                  <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-bark-light/48">
                    {topicLabels[post.topic] || 'Khác'}
                  </span>
                </div>
                <p className="whitespace-pre-line text-base leading-8 text-bark">{post.content}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {reactionConfig.map((reaction) => {
                    const isActive = post.userReaction === reaction.id
                    return (
                      <button
                        key={reaction.id}
                        onClick={() => reactToPost(post.id, reaction.id)}
                        className={`inline-flex h-10 items-center gap-2 rounded-full px-3 text-xs font-bold transition active:scale-[0.98] ${
                          isActive
                            ? 'bg-sage text-white shadow-md shadow-sage/15'
                            : 'border border-bark-light/8 bg-white/60 text-bark-light/58 hover:text-sage'
                        }`}
                      >
                        <FontAwesomeIcon icon={reaction.icon} className="text-[11px]" />
                        {reaction.label}
                        <span>{post.reactions[reaction.id]}</span>
                      </button>
                    )
                  })}
                </div>
              </article>
            ))}
          </section>
        </main>

        <aside className="grid content-start gap-4">
          <form onSubmit={submitPost} className="rounded-3xl border border-white/70 bg-white/58 p-5 shadow-sm shadow-sage/5">
            <div className="mb-4">
              <h2 className="text-lg font-bold tracking-tight text-bark">Viết ẩn danh</h2>
              <p className="mt-1 text-sm leading-6 text-bark-light/50">Chỉ văn bản thuần túy, tối đa 500 ký tự.</p>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-bark">Chủ đề</span>
              <select
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                className="h-11 rounded-2xl border border-bark-light/8 bg-white/70 px-3 text-sm text-bark outline-none focus:border-sage/40"
              >
                {communityTopics.filter((item) => item.id !== 'all').map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </label>

            <label className="mt-4 grid gap-2">
              <span className="text-sm font-semibold text-bark">Nội dung</span>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value.slice(0, 500))}
                rows={7}
                placeholder="Viết điều đang nặng trong lòng..."
                className="resize-none rounded-2xl border border-bark-light/8 bg-white/70 p-4 text-sm leading-6 text-bark outline-none placeholder:text-bark-light/28 focus:border-sage/40"
              />
            </label>

            <div className="mt-2 flex justify-between text-[11px] text-bark-light/40">
              <span>Không có nút ảnh hoặc file</span>
              <span>{content.length}/500</span>
            </div>

            {notice && (
              <div className="mt-4 rounded-2xl border border-sage-light/20 bg-sage-ghost/55 px-4 py-3 text-sm leading-6 text-bark-light/72">
                {notice}
              </div>
            )}

            <button
              type="submit"
              disabled={!content.trim()}
              className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-sage px-4 text-sm font-bold text-white shadow-lg shadow-sage/18 transition hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55"
            >
              <FontAwesomeIcon icon={faPaperPlane} className="text-xs" />
              Đăng ẩn danh
            </button>
          </form>

          <section className="rounded-3xl border border-sage-light/20 bg-sage-ghost/60 p-5">
            <h2 className="text-lg font-bold tracking-tight text-bark">Cam kết cộng đồng</h2>
            <div className="mt-4 grid gap-3">
              {[
                'Không yêu cầu tên thật, ảnh cá nhân hoặc thông tin liên lạc.',
                'Bài có tín hiệu tự hại sẽ được giữ riêng và mở hỗ trợ SOS.',
                'Bác sĩ và Người đồng hành có huy hiệu rõ ràng khi tham gia.',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/70 bg-white/52 p-4 text-sm leading-6 text-bark-light/65">
                  {item}
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <SOSModal open={sos.open} message={sos.message} onClose={() => setSos({ open: false, message: '' })} />
    </div>
  )
}
