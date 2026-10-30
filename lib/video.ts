export function youtubeEmbedUrl(value: string): string | null {
  try {
    const url = new URL(value)
    if (url.protocol !== "https:") return null
    const host = url.hostname.toLowerCase()
    const id = host === "youtu.be" ? url.pathname.slice(1)
      : ["youtube.com", "www.youtube.com"].includes(host) && url.pathname === "/watch" ? url.searchParams.get("v") : null
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null
  } catch { return null }
}
