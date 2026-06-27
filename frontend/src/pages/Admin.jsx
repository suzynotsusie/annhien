import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheck,
  faEyeSlash,
  faShieldHalved,
  faVideo,
} from '@fortawesome/free-solid-svg-icons'
import { readSession } from '../lib/auth'
import { topicLabels } from '../lib/mockData'
import { apiFetch } from '../lib/api-client'

export default function Admin() {
  const session = readSession()
  const [flagged, setFlagged] = useState([])
  const [pendingVideos, setPendingVideos] = useState([])

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [postsRes, videosRes] = await Promise.all([
          apiFetch('/api/posts/flagged'),
          apiFetch('/api/videos/pending')
        ])
        if (postsRes?.posts) setFlagged(postsRes.posts)
        if (videosRes?.videos) setPendingVideos(videosRes.videos)
      } catch (e) {
        console.error('Lỗi khi tải dữ liệu admin:', e)
      }
    }
    fetchAdminData()
  }, [])

  if (session.role !== 'admin') {
    return <Navigate to="/portal" replace />
  }

  const approvePost = async (post) => {
    try {
      await apiFetch(`/api/posts/${post.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'public' })
      })
      setFlagged((prev) => prev.filter((item) => item.id !== post.id))
    } catch (e) {
      console.error(e)
    }
  }

  const deletePost = async (postId) => {
    try {
      await apiFetch(`/api/posts/${postId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'blocked' })
      })
      setFlagged((prev) => prev.filter((item) => item.id !== postId))
    } catch (e) {
      console.error(e)
    }
  }

  const resolveVideo = async (videoId) => {
    try {
      await apiFetch(`/api/videos/${videoId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'public' })
      })
      setPendingVideos((prev) => prev.filter((video) => video.id !== videoId))
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <main className="min-h-dvh bg-cream">
      <div className="mx-auto w-full max-w-[1480px] px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <header className="mb-4 rounded-3xl border border-white/70 bg-white/58 p-5 shadow-sm shadow-sage/5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sage text-white">
              <FontAwesomeIcon icon={faShieldHalved} />
            </div>
            <div>
              <p className="text-sm font-bold text-sage-dark">Admin</p>
              <h1 className="text-3xl font-bold tracking-tight text-bark">Kiểm duyệt an toàn</h1>
            </div>
          </div>
        </header>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="rounded-3xl border border-white/70 bg-white/58 p-5 shadow-sm shadow-sage/5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-bark">Bài viết bị giữ lại</h2>
                <p className="mt-1 text-sm text-bark-light/48">Duyệt thủ công trước khi xuất hiện trong cộng đồng.</p>
              </div>
              <span className="rounded-full bg-sage-ghost px-3 py-1 text-sm font-bold text-sage-dark">{flagged.length}</span>
            </div>

            <div className="grid gap-3">
              {flagged.map((post) => (
                <article key={post.id} className="rounded-2xl border border-bark-light/7 bg-white/62 p-4">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">Flagged</span>
                    <span className="rounded-full bg-sage-ghost px-3 py-1 text-xs font-bold text-sage-dark">
                      {topicLabels[post.topic] || 'Khác'}
                    </span>
                  </div>
                  <p className="whitespace-pre-line text-sm leading-7 text-bark">{post.content}</p>
                  <p className="mt-3 text-xs leading-5 text-bark-light/45">{post.reason || 'Chờ admin quyết định.'}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => approvePost(post)}
                      className="inline-flex h-10 items-center gap-2 rounded-full bg-sage px-4 text-xs font-bold text-white transition active:scale-[0.98]"
                    >
                      <FontAwesomeIcon icon={faCheck} />
                      Duyệt bài
                    </button>
                    <button
                      onClick={() => deletePost(post.id)}
                      className="inline-flex h-10 items-center gap-2 rounded-full border border-bark-light/8 bg-white px-4 text-xs font-bold text-bark-light/58 transition hover:text-red-600 active:scale-[0.98]"
                    >
                      <FontAwesomeIcon icon={faEyeSlash} />
                      Xóa bài
                    </button>
                  </div>
                </article>
              ))}
              {flagged.length === 0 && (
                <p className="rounded-2xl bg-sage-ghost/55 p-4 text-sm leading-6 text-bark-light/58">
                  Không còn bài nào trong hàng đợi.
                </p>
              )}
            </div>
          </section>

          <aside className="rounded-3xl border border-white/70 bg-white/58 p-5 shadow-sm shadow-sage/5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sage-ghost text-sage">
                <FontAwesomeIcon icon={faVideo} />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-bark">Video chờ duyệt</h2>
                <p className="text-sm text-bark-light/45">Frontend mock queue.</p>
              </div>
            </div>

            <div className="grid gap-3">
              {pendingVideos.map((video) => (
                <div key={video.id} className="rounded-2xl border border-bark-light/7 bg-white/62 p-4">
                  <p className="text-sm font-bold text-bark">{video.title}</p>
                  <p className="mt-1 text-xs leading-5 text-bark-light/50">{video.doctorName} · {topicLabels[video.topic]}</p>
                  <p className="mt-2 text-xs leading-5 text-bark-light/45">{video.reason}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button onClick={() => resolveVideo(video.id)} className="h-10 rounded-full bg-sage text-xs font-bold text-white">
                      Duyệt
                    </button>
                    <button onClick={() => resolveVideo(video.id)} className="h-10 rounded-full border border-bark-light/8 bg-white text-xs font-bold text-bark-light/58">
                      Từ chối
                    </button>
                  </div>
                </div>
              ))}
              {pendingVideos.length === 0 && (
                <p className="rounded-2xl bg-sage-ghost/55 p-4 text-sm leading-6 text-bark-light/58">
                  Không còn video chờ duyệt.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
