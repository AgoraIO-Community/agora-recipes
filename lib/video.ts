export type VideoSource =
  | { kind: "file"; url: string }
  | { kind: "youtube"; videoId: string; start: number }

const youtubeHosts = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"])

// Keep provider recognition here. Catalog entries still submit one videoUrl;
// direct media on any HTTPS storage/CDN host needs no provider registration.
export function videoSource(value: string): VideoSource | undefined {
  let url: URL
  try { url = new URL(value) } catch { return }
  if (url.protocol !== "https:" || url.username || url.password) return
  const short = url.hostname === "youtu.be" || url.hostname === "www.youtu.be"
  if (!short && !youtubeHosts.has(url.hostname)) return { kind: "file", url: value }
  const path = url.pathname.split("/").filter(Boolean)
  const videoId = short ? path.length === 1 ? path[0] : undefined
    : url.pathname === "/watch" ? url.searchParams.get("v")
      : path.length === 2 && ["embed", "shorts", "live"].includes(path[0]) ? path[1] : undefined
  if (!videoId || !/^[\w-]{11}$/.test(videoId)) return
  const time = url.searchParams.get("start") ?? url.searchParams.get("t") ?? "0"
  const parts = time.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/)
  const seconds = /^\d+$/.test(time) ? Number(time) : parts ? Number(parts[1] ?? 0) * 3600 + Number(parts[2] ?? 0) * 60 + Number(parts[3] ?? 0) : 0
  return { kind: "youtube", videoId, start: Number.isSafeInteger(seconds) && seconds < 2 ** 31 ? seconds : 0 }
}

export function youtubeEmbedUrl(source: Extract<VideoSource, { kind: "youtube" }>, origin: string) {
  const url = new URL(`https://www.youtube-nocookie.com/embed/${source.videoId}`)
  url.search = new URLSearchParams({ enablejsapi: "1", playsinline: "1", origin, ...(source.start ? { start: String(source.start) } : {}) }).toString()
  return url.href
}
