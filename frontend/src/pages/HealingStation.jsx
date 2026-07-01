import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHeart,
  faMessage,
  faPlay,
} from '@fortawesome/free-solid-svg-icons'
import { communityTopics, topicLabels } from '../lib/mockData'
import { API_URL } from '../lib/auth'

function VideoPost({ video, liked, toggleLike }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {})
        } else {
          videoRef.current?.pause()
        }
      },
      { threshold: 0.6 }
    )

    if (videoRef.current) {
      observer.observe(videoRef.current)
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current)
      }
    }
  }, [])

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play()
      } else {
        videoRef.current.pause()
      }
    }
  }

  return (
    <article className="relative mx-auto grid min-h-[calc(100dvh-7rem)] w-full max-w-[620px] snap-start content-center">
      <div 
        className="relative mx-auto aspect-[9/16] max-h-[78dvh] w-full max-w-[440px] overflow-hidden rounded-[30px] bg-bark shadow-2xl shadow-sage/20 cursor-pointer group"
        onClick={handleVideoClick}
      >
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          loop
          playsInline
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          <source src={video.videoUrl} type="video/mp4" />
        </video>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-5 pb-6 pt-32 text-white">
          <div className="mb-3 flex items-center gap-3">
            <img
              src={video.doctorAvatar || '/assets/doctors/dr_lanhuong.png'}
              alt={video.doctorName}
              className="h-11 w-11 rounded-2xl border-2 border-white/40 object-cover shadow-sm"
            />
            <div>
              <p className="text-sm font-bold drop-shadow-md">{video.doctorName}</p>
              <p className="text-xs font-medium text-white/90 drop-shadow-md">{topicLabels[video.topic]}</p>
            </div>
          </div>
          <h2 className="text-2xl font-bold leading-tight tracking-tight drop-shadow-md">{video.title}</h2>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/90 drop-shadow-md">{video.description}</p>
        </div>

        {!isPlaying && (
          <div className="pointer-events-none absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-opacity duration-300">
            <FontAwesomeIcon icon={faPlay} className="ml-2 text-3xl opacity-90" />
          </div>
        )}
      </div>

      <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 flex-col gap-4 sm:flex lg:right-6">
        <button
          onClick={() => toggleLike(video.id)}
          className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all active:scale-90 ${
            liked ? 'bg-coral text-white shadow-coral/30' : 'bg-white/90 text-bark backdrop-blur hover:text-coral hover:bg-white'
          }`}
          aria-label="Thả tim video"
        >
          <FontAwesomeIcon icon={faHeart} className={liked ? 'scale-110' : ''} />
        </button>
        <p className="text-center text-xs font-bold text-bark-light/80">{video.likes + (liked ? 1 : 0)}</p>

        <Link
          to="/tin-nhan"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-bark shadow-lg backdrop-blur transition-all hover:text-sage hover:bg-white active:scale-90"
          aria-label="Chat về video này"
        >
          <FontAwesomeIcon icon={faMessage} />
        </Link>
        <p className="text-center text-xs font-bold text-bark-light/80">{video.comments}</p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:hidden">
        <button
          onClick={() => toggleLike(video.id)}
          className={`flex h-12 items-center justify-center rounded-2xl text-sm font-bold transition-colors active:scale-95 ${
            liked ? 'bg-coral text-white shadow-md shadow-coral/20' : 'border border-bark-light/10 bg-white/80 text-bark-light/80 backdrop-blur'
          }`}
        >
          <FontAwesomeIcon icon={faHeart} className={`mr-2 ${liked ? 'scale-110' : ''}`} />
          {video.likes + (liked ? 1 : 0)}
        </button>
        <Link
          to="/tin-nhan"
          className="flex h-12 items-center justify-center rounded-2xl border border-bark-light/10 bg-white/80 text-sm font-bold text-bark-light/80 backdrop-blur transition-colors active:scale-95"
        >
          <FontAwesomeIcon icon={faMessage} className="mr-2" />
          Chat
        </Link>
      </div>
    </article>
  )
}

export default function HealingStation() {
  const [activeTopic, setActiveTopic] = useState('all')
  const [likedIds, setLikedIds] = useState([])
  const [videos, setVideos] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true)
        const query = activeTopic === 'all' ? '' : `?topic=${activeTopic}`
        const res = await fetch(`${API_URL}/api/videos${query}`)
        const data = await res.json()
        if (data.videos) {
          setVideos(data.videos)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchVideos()
  }, [activeTopic])

  const toggleLike = (id) => {
    setLikedIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id])
  }

  return (
    <div className="min-h-dvh bg-cream">
      <div className="mx-auto grid w-full max-w-[1480px] gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8 lg:py-6">
        <aside className="rounded-3xl border border-white/70 bg-white/58 p-4 shadow-sm shadow-sage/5 lg:sticky lg:top-6 lg:h-[calc(100dvh-3rem)]">
          <h1 className="text-2xl font-bold tracking-tight text-bark">Trạm chữa lành</h1>
          <p className="mt-2 text-sm leading-6 text-bark-light/60">
            Video dọc đã duyệt, xem nhanh như một luồng TikTok dịu hơn.
          </p>
          <div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide lg:grid lg:overflow-visible">
            {communityTopics.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTopic(item.id)}
                className={`h-11 shrink-0 rounded-2xl px-5 text-left text-sm font-bold transition-all active:scale-[0.97] ${
                  activeTopic === item.id
                    ? 'bg-sage text-white shadow-lg shadow-sage/20 scale-105 lg:scale-100'
                    : 'border border-bark-light/10 bg-white/60 text-bark-light/70 hover:bg-white hover:text-bark'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        <main className="max-h-none overflow-visible lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto lg:snap-y lg:snap-mandatory lg:scrollbar-hide">
          <div className="grid gap-6 pb-6">
            {videos.map((video) => (
              <VideoPost 
                key={video.id} 
                video={video} 
                liked={likedIds.includes(video.id)} 
                toggleLike={toggleLike} 
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
