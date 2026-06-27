import { useMemo, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBookmark,
  faHeart,
  faLeaf,
  faMessage,
  faPlay,
} from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import { communityTopics, healingVideos, topicLabels } from '../lib/mockData'
import { readSavedVideos, saveSavedVideos } from '../lib/clientSafety'

export default function HealingStation() {
  const [activeTopic, setActiveTopic] = useState('all')
  const [savedIds, setSavedIds] = useState(() => readSavedVideos())
  const [likedIds, setLikedIds] = useState([])

  const videos = useMemo(() => (
    healingVideos.filter((video) => activeTopic === 'all' || video.topic === activeTopic)
  ), [activeTopic])

  const toggleSave = (id) => {
    const next = savedIds.includes(id) ? savedIds.filter((item) => item !== id) : [...savedIds, id]
    setSavedIds(next)
    saveSavedVideos(next)
  }

  const toggleLike = (id) => {
    setLikedIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id])
  }

  return (
    <div className="min-h-dvh bg-cream">
      <div className="mx-auto w-full max-w-[1480px] px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <header className="mb-4 rounded-3xl border border-white/70 bg-white/58 p-5 shadow-sm shadow-sage/5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-bark sm:text-4xl">Trạm chữa lành</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-bark-light/58">
                Video ngắn đã được duyệt, tập trung vào thở, grounding và kiến thức tâm lý ứng dụng.
              </p>
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
          </div>
        </header>

        <main className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {videos.map((video) => {
              const liked = likedIds.includes(video.id)
              const saved = savedIds.includes(video.id)
              return (
                <article key={video.id} className="overflow-hidden rounded-3xl border border-white/70 bg-white/58 shadow-sm shadow-sage/5">
                  <div className="relative aspect-[9/16] bg-sage-ghost">
                    <video
                      className="h-full w-full object-cover"
                      controls
                      preload="none"
                      poster={video.poster}
                    >
                      <source src={video.videoUrl} type="video/mp4" />
                    </video>
                    <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-white/82 px-3 py-1 text-xs font-bold text-sage-dark backdrop-blur">
                      {topicLabels[video.topic]}
                    </div>
                    <div className="pointer-events-none absolute bottom-4 left-4 flex h-11 w-11 items-center justify-center rounded-full bg-bark/35 text-white backdrop-blur">
                      <FontAwesomeIcon icon={faPlay} className="ml-0.5 text-sm" />
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="mb-2 text-xs font-bold text-sage-dark">{video.doctorName}</p>
                    <h2 className="text-xl font-bold leading-tight tracking-tight text-bark">{video.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-bark-light/58">{video.description}</p>
                    <div className="mt-5 grid grid-cols-3 gap-2">
                      <button
                        onClick={() => toggleLike(video.id)}
                        className={`inline-flex h-11 items-center justify-center gap-2 rounded-2xl text-sm font-bold transition active:scale-[0.98] ${
                          liked ? 'bg-coral text-white' : 'border border-bark-light/8 bg-white/70 text-bark-light/55'
                        }`}
                      >
                        <FontAwesomeIcon icon={faHeart} className="text-xs" />
                        {video.likes + (liked ? 1 : 0)}
                      </button>
                      <button
                        onClick={() => toggleSave(video.id)}
                        className={`inline-flex h-11 items-center justify-center gap-2 rounded-2xl text-sm font-bold transition active:scale-[0.98] ${
                          saved ? 'bg-sage text-white' : 'border border-bark-light/8 bg-white/70 text-bark-light/55'
                        }`}
                      >
                        <FontAwesomeIcon icon={faBookmark} className="text-xs" />
                        Lưu
                      </button>
                      <Link
                        to="/tin-nhan"
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-bark-light/8 bg-white/70 text-sm font-bold text-bark-light/55 transition hover:text-sage active:scale-[0.98]"
                      >
                        <FontAwesomeIcon icon={faMessage} className="text-xs" />
                        Chat
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </section>

          <aside className="grid content-start gap-4">
            <section className="rounded-3xl border border-white/70 bg-white/58 p-5 shadow-sm shadow-sage/5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-sage text-white">
                <FontAwesomeIcon icon={faLeaf} />
              </div>
              <h2 className="text-lg font-bold tracking-tight text-bark">Cách dùng trạm</h2>
              <p className="mt-2 text-sm leading-6 text-bark-light/58">
                Chọn một video ngắn, xem hết một lần, rồi lưu lại nếu bài tập đó hợp với cơ thể cậu.
              </p>
            </section>

            <section className="rounded-3xl border border-sage-light/20 bg-sage-ghost/60 p-5">
              <h2 className="text-lg font-bold tracking-tight text-bark">Đã lưu</h2>
              <p className="mt-2 text-5xl font-bold text-sage-dark">{savedIds.length}</p>
              <p className="mt-2 text-sm leading-6 text-bark-light/58">Video nằm trong Hồ sơ để cậu xem lại khi cần.</p>
            </section>
          </aside>
        </main>
      </div>
    </div>
  )
}
