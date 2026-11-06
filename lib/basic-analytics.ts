import { analyticsText } from "./analytics-events"

export type BasicCount = {
  metric: "page_view" | "search"
  page_type: "catalog" | "recipe" | "topic_directory" | "topic" | "contribute"
  content_slug?: string
  topic_slug?: string
  search_term?: string
  zero_results?: boolean
}

type PublicEntry = { slug: string; title: string; platforms: readonly string[]; useCases: readonly string[]; capabilities: readonly string[] }
const technicalTerms = ["agora", "voice ai", "voice agent", "voice agents", "rtc", "video calling", "live streaming", "transcription", "translation", "speech to text", "text to speech", "llm", "rag", "tool calling", "mcp", "python", "typescript", "javascript", "react", "next.js", "flutter", "ios", "android", "web", "go", "esp32", "m5stack"]

// Both ends derive the same finite vocabulary from public catalog metadata.
// Arbitrary search input never enters the basic collection request.
export function basicSearchVocabulary(entries: readonly PublicEntry[]) {
  const terms = new Map(technicalTerms.map(term => [term, term]))
  for (const entry of entries) {
    const title = analyticsText(entry.title, true)
    terms.set(entry.slug, entry.slug)
    if (title) {
      terms.set(title, entry.slug)
    }
    for (const label of [...entry.platforms, ...entry.useCases, ...entry.capabilities]) {
      const term = analyticsText(label, true)
      if (term) terms.set(term, term)
    }
  }
  return terms
}

export function basicSearchTerm(value: string, vocabulary: ReadonlyMap<string, string>) {
  const term = analyticsText(value, true)
  return term ? vocabulary.get(term) ?? "other" : "other"
}

export function basicPageCount(pathname: string): BasicCount | undefined {
  const path = pathname.replace(/^\/(en|zh-Hans|zh-Hant|ja|hi|es|pt-BR)(?=\/|$)/, "").replace(/\/$/, "") || "/"
  if (path === "/") return { metric: "page_view", page_type: "catalog" }
  if (path === "/topics") return { metric: "page_view", page_type: "topic_directory" }
  if (path === "/contribute") return { metric: "page_view", page_type: "contribute" }
  const recipe = path.match(/^\/recipes\/([a-z0-9]+(?:-[a-z0-9]+)*)(?:\/guide\/(?:original|en|zh-Hans|zh-Hant|ja|hi|es|pt-BR))?$/)?.[1]
  if (recipe) return { metric: "page_view", page_type: "recipe", content_slug: recipe }
  const topic = path.match(/^\/topics\/([a-z0-9]+(?:-[a-z0-9]+)*)$/)?.[1]
  if (topic) return { metric: "page_view", page_type: "topic", topic_slug: topic }
}

export function sendBasicCount(count: BasicCount, send: typeof fetch = fetch) {
  // Do not attach cookies, referrers, a timestamp, a consent value, or any ID.
  // Best-effort delivery has no retry or per-visitor deduplication token.
  void send("/api/analytics/basic", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(count), credentials: "omit", referrerPolicy: "no-referrer",
    cache: "no-store", redirect: "error", keepalive: true,
  }).catch(() => {})
}
