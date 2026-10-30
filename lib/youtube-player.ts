export type YouTubePlayer = { destroy: () => void }
type YouTubeAPI = {
  Player: new (element: HTMLIFrameElement, options: { events: {
    onReady: () => void
    onStateChange: (event: { data: number }) => void
    onError: () => void
  } }) => YouTubePlayer
}
declare global {
  interface Window { YT?: YouTubeAPI; onYouTubeIframeAPIReady?: () => void }
}

let pending: Promise<YouTubeAPI> | undefined

// Requested only by an opened player, shared by all dialogs, retryable on error.
export function loadYouTubePlayer(): Promise<YouTubeAPI> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (pending) return pending
  pending = new Promise<YouTubeAPI>((resolve, reject) => {
    const script = document.createElement("script")
    const previous = window.onYouTubeIframeAPIReady
    const ready = () => {
      if (!window.YT?.Player) { fail(); return }
      cleanup()
      resolve(window.YT)
      previous?.()
    }
    const cleanup = () => {
      clearTimeout(timeout)
      script.onerror = null
      if (window.onYouTubeIframeAPIReady === ready) window.onYouTubeIframeAPIReady = previous
    }
    const fail = () => {
      cleanup()
      script.remove()
      reject(new Error("YouTube player could not load"))
    }
    const timeout = setTimeout(fail, 15000)
    window.onYouTubeIframeAPIReady = ready
    script.src = "https://www.youtube.com/iframe_api"
    script.async = true
    script.onerror = fail
    document.head.appendChild(script)
  }).catch(error => { pending = undefined; throw error })
  return pending
}
