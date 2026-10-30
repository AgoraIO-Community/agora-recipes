"use client"

import { useEffect, useEffectEvent, useRef, useState } from "react"
import { useI18n } from "@/components/locale-provider"
import { videoSource, youtubeEmbedUrl } from "@/lib/video"
import type { YouTubePlayer } from "@/lib/youtube-player"

function YouTubeVideo({ videoId, start, title, onPlay, onError }: { videoId: string; start: number; title: string; onPlay: () => void; onError: () => void }) {
  const { t } = useI18n()
  const container = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const reportPlay = useEffectEvent(onPlay)
  const reportError = useEffectEvent(onError)
  useEffect(() => {
    const host = container.current!
    let cancelled = false
    let player: YouTubePlayer | undefined
    let timeout: ReturnType<typeof setTimeout> | undefined
    void import("@/lib/youtube-player").then(module => cancelled ? undefined : module.loadYouTubePlayer()).then(api => {
      if (cancelled || !api) return
      const frame = document.createElement("iframe")
      frame.src = youtubeEmbedUrl({ kind: "youtube", videoId, start }, window.location.origin)
      frame.title = title
      frame.allow = "accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      frame.allowFullscreen = true
      frame.referrerPolicy = "strict-origin-when-cross-origin"
      host.appendChild(frame)
      timeout = setTimeout(() => { if (!cancelled) reportError() }, 15000)
      player = new api.Player(frame, { events: {
        onReady: () => { clearTimeout(timeout); if (!cancelled) setReady(true) },
        onStateChange: event => { if (!cancelled && event.data === 1) reportPlay() },
        onError: () => { if (!cancelled) reportError() },
      } })
    }).catch(() => { if (!cancelled) reportError() })
    return () => {
      cancelled = true
      clearTimeout(timeout)
      player?.destroy()
      host.replaceChildren()
    }
  }, [videoId, start, title])
  return <div className="recipe-video-player recipe-video-player--embedded">
    <div ref={container} className="recipe-video-player__frame" />
    {!ready && <p role="status" className="recipe-video-player__loading">{t("Loading video…")}</p>}
  </div>
}

export function RecipeVideoPlayer({ url, title, poster, onPlay, onError }: { url: string; title: string; poster?: string; onPlay: () => void; onError: () => void }) {
  const { t } = useI18n()
  const source = videoSource(url)
  const invalid = !source
  // Invalid provider links retain the dialog's original-video recovery action.
  useEffect(() => { if (invalid) onError() }, [invalid, onError])
  if (!source) return null
  if (source.kind === "youtube") return <YouTubeVideo videoId={source.videoId} start={source.start} title={title} onPlay={onPlay} onError={onError} />
  return <video src={source.url} controls playsInline preload="metadata" poster={poster} aria-label={title} className="aspect-video w-full rounded-md bg-black" onPlay={onPlay} onError={onError}>
    {t("Your browser does not support video playback. Open the original video below.")}
  </video>
}
