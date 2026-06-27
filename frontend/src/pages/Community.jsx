import { useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faComment,
  faPaperPlane,
  faShieldHalved,
  faThumbsUp,
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
  { id: 'like', label: 'Thích', emoji: '👍' },
  { id: 'love', label: 'Thương', emoji: '💚' },
  { id: 'care', label: 'Ôm', emoji: '🤗' },
  { id: 'peace', label: 'Bình an', emoji: '🌿' },
]

function normalizePost(post) {
  return {
    ...post,
    reactions: {
      like: post.reactions?.like ?? post.reactions?.empathy ?? 0,
      love: post.reactions?.love ?? 0,
      care: post.reactions?.care ?? post.reactions?.hug ?? 0,
      peace: post.reactions?.peace ?? 0,
    },
    comments: post.comments || [],
    userReaction: ['like', 'love', 'care', 'peace'].includes(post.userReaction) ? post.userReaction : null,
  }
}

export default function Community() {
  const [activeTopic, setActiveTopic] = useState('all')
  const [content, setContent] = useState('')
  const [topic, setTopic] = useState('study')
  const [posts, setPosts] = useState(() => readCommunityPosts(communitySeed).map(normalizePost))
  const [notice, setNotice] = useState('')
  const [sos, setSos] = useState({ open: false, message: '' })
  const [openComments, setOpenComments] = useState({})
  const [commentDrafts, setCommentDrafts] = useState({})

  const visiblePosts = useMemo(() => {
    return posts.filter((post) => post.status === 'public' && (activeTopic === 'all' || post.topic === activeTopic))
  }, [activeTopic, posts])

  const persistPosts = (nextPosts) => {
    setPosts(nextPosts)
    saveCommunityPosts(nextPosts)
  }

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
      reactions: { like: 0, love: 0, care: 0, peace: 0 },
      userReaction: null,
      comments: [],
      createdAt: new Date().toISOString(),
      status: risk.triggerSOS ? 'flagged' : 'public',
    }

    if (risk.triggerSOS) {
      const flagged = [nextPost, ...readFlaggedPosts([])]
      saveFlaggedPosts(flagged)
      setSos({ open: true, message: risk.suggestedResponse })
      setNotice('Bài viết đã được giữ riêng để admin xem xét. SOS đã mở để cậu có hỗ trợ ngay.')
    } else {
      persistPosts([nextPost, ...posts])
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

    persistPosts(nextPosts)
  }

  const submitComment = (postId) => {
    const draft = (commentDrafts[postId] || '').trim()
    if (!draft) return

    const nextPosts = posts.map((post) => {
      if (post.id !== postId) return post
      return {
        ...post,
        comments: [
          ...(post.comments || []),
          { id: `comment-${Date.now()}`, author: 'Gió Nhẹ', text: draft },
        ],
      }
    })
    persistPosts(nextPosts)
    setCommentDrafts((prev) => ({ ...prev, [postId]: '' }))
    setOpenComments((prev) => ({ ...prev, [postId]: true }))
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
                  Chia sẻ bằng chữ, không ảnh, không danh tính. Có reaction và bình luận nhẹ nhàng như một bản tin xã hội.
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
            {visiblePosts.map((post) => {
              const selectedReaction = reactionConfig.find((reaction) => reaction.id === post.userReaction)
              const totalReactions = Object.values(post.reactions || {}).reduce((sum, count) => sum + count, 0)
              const commentsOpen = openComments[post.id]

              return (
                <article key={post.id} className="rounded-3xl border border-white/70 bg-white/58 p-5 shadow-sm shadow-sage/5">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    {post.avatar && <img src={post.avatar} alt={post.authorLabel} className="h-10 w-10 rounded-2xl object-cover" />}
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

                  <div className="mt-5 flex items-center justify-between border-y border-bark-light/7 py-2 text-sm text-bark-light/55">
                    <div className="flex items-center gap-1">
                      {reactionConfig.filter((reaction) => post.reactions?.[reaction.id] > 0).slice(0, 3).map((reaction) => (
                        <span key={reaction.id} className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm shadow-sage/8">
                          {reaction.emoji}
                        </span>
                      ))}
                      <span className="ml-1 text-xs font-semibold">{totalReactions}</span>
                    </div>
                    <button
                      onClick={() => setOpenComments((prev) => ({ ...prev, [post.id]: !prev[post.id] }))}
                      className="text-xs font-semibold hover:text-sage"
                    >
                      {(post.comments || []).length} bình luận
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="group relative">
                      <button
                        onClick={() => reactToPost(post.id, post.userReaction || 'like')}
                        className={`flex h-11 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold transition active:scale-[0.98] ${
                          post.userReaction
                            ? 'bg-sage-ghost text-sage-dark'
                            : 'text-bark-light/58 hover:bg-bark-light/5 hover:text-sage'
                        }`}
                      >
                        <span>{selectedReaction?.emoji || <FontAwesomeIcon icon={faThumbsUp} />}</span>
                        {selectedReaction?.label || 'Thích'}
                      </button>

                      <div className="invisible absolute bottom-[calc(100%+8px)] left-0 z-20 flex translate-y-2 gap-1 rounded-full border border-white/70 bg-white/95 p-2 opacity-0 shadow-xl shadow-sage/12 backdrop-blur transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                        {reactionConfig.map((reaction) => (
                          <button
                            key={reaction.id}
                            onClick={() => reactToPost(post.id, reaction.id)}
                            className="flex h-10 w-10 items-center justify-center rounded-full text-xl transition hover:-translate-y-1 hover:bg-sage-ghost active:scale-95"
                            aria-label={reaction.label}
                            title={reaction.label}
                          >
                            {reaction.emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setOpenComments((prev) => ({ ...prev, [post.id]: !prev[post.id] }))}
                      className="flex h-11 items-center justify-center gap-2 rounded-2xl text-sm font-bold text-bark-light/58 transition hover:bg-bark-light/5 hover:text-sage active:scale-[0.98]"
                    >
                      <FontAwesomeIcon icon={faComment} />
                      Bình luận
                    </button>
                  </div>

                  {commentsOpen && (
                    <div className="mt-4 grid gap-3">
                      {(post.comments || []).map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          {comment.avatar ? (
                            <img src={comment.avatar} alt={comment.author} className="h-9 w-9 rounded-xl object-cover" />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sage-ghost text-xs font-bold text-sage-dark">
                              {comment.author.slice(0, 1)}
                            </div>
                          )}
                          <div className="rounded-2xl bg-sage-ghost/65 px-4 py-3">
                            <p className="text-xs font-bold text-bark">{comment.author}</p>
                            <p className="mt-1 text-sm leading-6 text-bark-light/72">{comment.text}</p>
                          </div>
                        </div>
                      ))}

                      <div className="flex gap-2">
                        <input
                          value={commentDrafts[post.id] || ''}
                          onChange={(event) => setCommentDrafts((prev) => ({ ...prev, [post.id]: event.target.value }))}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault()
                              submitComment(post.id)
                            }
                          }}
                          placeholder="Viết bình luận..."
                          className="h-11 min-w-0 flex-1 rounded-2xl border border-bark-light/8 bg-white/70 px-4 text-sm text-bark outline-none placeholder:text-bark-light/28 focus:border-sage/40"
                        />
                        <button
                          onClick={() => submitComment(post.id)}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sage text-white active:scale-95"
                          aria-label="Gửi bình luận"
                        >
                          <FontAwesomeIcon icon={faPaperPlane} className="text-xs" />
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
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
                'Không có nút chia sẻ để giữ không gian kín và nhẹ.',
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
