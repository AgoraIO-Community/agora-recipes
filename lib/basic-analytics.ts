import { analyticsText, eventActions, type AnalyticsEvent } from "./analytics-events"

export const basicEventActions = {
  material_open: ["demo"],
  video_play: ["play"],
  content_copy: eventActions.content_copy,
  contribution_open: eventActions.contribution_open,
} as const

export const basicCampaignValues: Record<string, readonly string[]> = {
  utm_source: ["github", "agora_blog", "agora_website", "agora_email", "discord", "reddit", "x", "youtube", "google", "bing", "linkedin", "facebook", "wechat", "bilibili", "zhihu", "email", "newsletter", "other"],
  utm_medium: ["referral", "social", "paid_social", "email", "video", "cpc", "organic", "community", "display", "affiliate", "other"],
  utm_campaign: ["recipes_top10", "other"],
}
export const basicCampaignKeys = ["utm_source", "utm_medium", "utm_campaign"] as const
type BasicCampaign = Partial<Record<typeof basicCampaignKeys[number], string>>

// Classify only this page's explicit source. Unknown values never leave the
// browser; there is no retained source, visitor ID, keyword or creative text.
export function basicCampaignProperties(search: string): BasicCampaign {
  const params = new URLSearchParams(search)
  if (params.getAll("utm_source").length !== 1 || !params.get("utm_source")?.trim()) return {}
  const result: BasicCampaign = {}
  for (const key of basicCampaignKeys) {
    const values = params.getAll(key)
    if (values.length !== 1 || !values[0].trim()) continue
    const value = values[0].trim().toLowerCase()
    result[key] = basicCampaignValues[key].includes(value) ? value : "other"
  }
  return result
}

export function isBasicUsage(metric: string, action: unknown) {
  const actions: readonly string[] | undefined = Object.hasOwn(basicEventActions, metric)
    ? basicEventActions[metric as keyof typeof basicEventActions] : undefined
  return typeof action === "string" && Boolean(actions?.includes(action))
}

export type BasicCount = BasicCampaign & {
  metric: "page_view" | "search" | keyof typeof basicEventActions
  page_type: "catalog" | "recipe" | "topic_directory" | "topic" | "contribute"
  content_slug?: string
  topic_slug?: string
  search_term?: string
  zero_results?: boolean
  action?: string
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

export function basicUsageCount(pathname: string, metric: AnalyticsEvent, properties: Record<string, string | number | boolean>): BasicCount | undefined {
  if (!isBasicUsage(metric, properties.action)) return
  const page = basicPageCount(pathname)
  if (!page) return
  const count: BasicCount = { ...page, metric: metric as keyof typeof basicEventActions, action: String(properties.action) }
  if (typeof properties.content_slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(properties.content_slug) && properties.content_slug.length <= 100) count.content_slug = properties.content_slug
  return count
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
