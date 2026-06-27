import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHeart,
  faMessage,
  faPlay,
  faVolumeHigh,
} from '@fortawesome/free-solid-svg-icons'
import { communityTopics, healingVideos, topicLabels } from '../lib/mockData'

export default function HealingStation() {
  const [activeTopic, setActiveTopic] = useState('all')
  const [likedIds, setLikedIds] = useState([])

  const videos = useMemo(() => (
    healingVideos.filter((video) => activeTopic === 'all' || video.topic === activeTopic)
  ), [activeTopic])

  const toggleLike = (id) => {
    setLikedIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id])
  }

  return (
    <div className="min-h-dvh bg-cream">
      <div className="mx-auto grid w-full max-w-[1480px] gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8 lg:py-6">
        <aside className="rounded-3xl border border-white/70 bg-white/58 p-4 shadow-sm shadow-sage/5 lg:sticky lg:top-6 lg:h-[calc(100dvh-3rem)]">
          <h1 className="text-2xl font-bold tracking-tight text-bark">Trạm chữa lành</h1>
          <p className="mt-2 text-sm leading-6 text-bark-light/58">
            Video dọc đã duyệt, xem nhanh như một luồng TikTok dịu hơn.
          </p>
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1 scrollbar-hide lg:grid lg:overflow-visible">
            {communityTopics.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTopic(item.id)}
                className={`h-10 shrink-0 rounded-full px-4 text-left text-sm font-bold transition active:scale-[0.98] ${
                  activeTopic === item.id
                    ? 'bg-sage text-white shadow-lg shadow-sage/18'
                    : 'border border-bark-light/8 bg-white/60 text-bark-light/60 hover:text-bark'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        <main className="max-h-none overflow-visible lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto lg:snap-y lg:snap-mandatory lg:scrollbar-hide">
          <div className="grid gap-5 pb-4">
            {videos.map((video) => {
              const liked = likedIds.includes(video.id)
              return (
                <article
                  key={video.id}
                  className="relative mx-auto grid min-h-[calc(100dvh-7rem)] w-full max-w-[620px] snap-start content-center"
                >
                  <div className="relative mx-auto aspect-[9/16] max-h-[78dvh] w-full max-w-[440px] overflow-hidden rounded-[30px] bg-bark shadow-2xl shadow-sage/16">
                    <video
                      className="h-full w-full object-cover"
                      controls
                      loop
                      playsInline
                      preload="metadata"
                    >
                      <source src={video.videoUrl} type="video/mp4" />
                    </video>

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-bark/82 via-bark/30 to-transparent px-5 pb-5 pt-28 text-white">
                      <div className="mb-3 flex items-center gap-3">
                        <img
                          src={video.doctorAvatar}
                          alt={video.doctorName}
                          className="h-11 w-11 rounded-2xl border border-white/40 object-cover"
                        />
                        <div>
                          <p className="text-sm font-bold">{video.doctorName}</p>
                          <p className="text-xs text-white/68">{topicLabels[video.topic]}</p>
                        </div>
                      </div>
                      <h2 className="text-2xl font-bold leading-tight tracking-tight">{video.title}</h2>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/72">{video.description}</p>
                    </div>

                    <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full bg-bark/32 px-3 py-2 text-xs font-bold text-white backdrop-blur">
                      <FontAwesomeIcon icon={faVolumeHigh} />
                      Video chữa lành
                    </div>

                    <div className="pointer-events-none absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-bark/28 text-white backdrop-blur">
                      <FontAwesomeIcon icon={faPlay} className="ml-1 text-lg" />
                    </div>
                  </div>

                  <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 flex-col gap-4 sm:flex lg:right-6">
                    <button
                      onClick={() => toggleLike(video.id)}
                      className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition active:scale-95 ${
                        liked ? 'bg-coral text-white shadow-coral/20' : 'bg-white/82 text-bark backdrop-blur hover:text-coral'
                      }`}
                      aria-label="Thả tim video"
                    >
                      <FontAwesomeIcon icon={faHeart} />
                    </button>
                    <p className="text-center text-xs font-bold text-bark-light/68">{video.likes + (liked ? 1 : 0)}</p>

                    <Link
                      to="/tin-nhan"
                      className="flex h-14 w-14 items-center justify-center rounded-full bg-white/82 text-bark shadow-lg backdrop-blur transition hover:text-sage active:scale-95"
                      aria-label="Chat về video này"
                    >
                      <FontAwesomeIcon icon={faMessage} />
                    </Link>
                    <p className="text-center text-xs font-bold text-bark-light/68">{video.comments}</p>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 sm:hidden">
                    <button
                      onClick={() => toggleLike(video.id)}
                      className={`h-11 rounded-full text-sm font-bold ${
                        liked ? 'bg-coral text-white' : 'border border-bark-light/8 bg-white/70 text-bark-light/65'
                      }`}
                    >
                      <FontAwesomeIcon icon={faHeart} className="mr-2" />
                      {video.likes + (liked ? 1 : 0)}
                    </button>
                    <Link
                      to="/tin-nhan"
                      className="inline-flex h-11 items-center justify-center rounded-full border border-bark-light/8 bg-white/70 text-sm font-bold text-bark-light/65"
                    >
                      <FontAwesomeIcon icon={faMessage} className="mr-2" />
                      Chat
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        </main>
      </div>
    </div>
  )
}
