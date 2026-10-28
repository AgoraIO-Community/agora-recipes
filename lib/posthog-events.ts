import { analyticsUrl, eventActions, type AnalyticsEvent } from "./analytics-events"

export type PageContext = {
  locale: string
  page_type: "catalog" | "recipe" | "topic_directory" | "topic" | "contribute" | "other"
  content_slug?: string
  topic_slug?: string
  source_topic_slug?: string
}

/** Route context contains public catalog identities, never arbitrary URL parameters. */
export function pageContext(pathname: string, search: string, topics: readonly string[]): PageContext {
  const locale = pathname.match(/^\/(zh-Hans|zh-Hant|ja)(?:\/|$)/)?.[1] ?? "en"
  const path = pathname.replace(/^\/(en|zh-Hans|zh-Hant|ja)(?=\/|$)/, "") || "/"
  const params = new URLSearchParams(search)
  const topicAt = (path: string) => {
    const slug = path.replace(/^\/(en|zh-Hans|zh-Hant|ja)(?=\/|$)/, "").match(/^\/topics\/([a-z0-9-]+)\/?$/)?.[1]
    return slug && topics.includes(slug) ? slug : undefined
  }
  let source: string | undefined
  const returnTo = params.get("returnTo")
  if ((path.startsWith("/recipes/") || path === "/contribute") && returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    try {
      const url = new URL(returnTo, "https://catalog.invalid")
      if (url.origin === "https://catalog.invalid") source = topicAt(url.pathname)
    } catch { /* Invalid list context is not attribution. */ }
  }
  const candidate = path.match(/^\/recipes\/([a-z0-9]+(?:-[a-z0-9]+)*)(?:\/|$)/)?.[1]
  const content_slug = candidate && candidate.length <= 100 ? candidate : undefined
  const routeTopic = topicAt(path)
  const page_type = content_slug ? "recipe" : routeTopic ? "topic" : path === "/topics" ? "topic_directory" : path === "/contribute" ? "contribute" : path === "/" ? "catalog" : "other"
  const selected = params.get("topic")
  const topic_slug = page_type === "contribute" ? selected && topics.includes(selected) ? selected : undefined : routeTopic ?? (content_slug ? source : undefined)
  return { locale, page_type, ...(content_slug && { content_slug }), ...(topic_slug && { topic_slug }), ...((routeTopic ?? source) && { source_topic_slug: routeTopic ?? source }) }
}

const useKinds: Record<string, string> = {
  "material_open:demo": "demo_open", "material_open:source": "source_open", "material_open:video_original": "video_open",
  "video_play:play": "video_play", "content_copy:prompt": "prompt_copy", "content_copy:guide": "guide_copy",
  "content_copy:cli_command": "cli_copy", "content_copy:code": "code_copy",
}

export function posthogProperties(context: PageContext, name: AnalyticsEvent | "$pageview", properties: Record<string, string | number> = {}) {
  const combined = { ...context, ...properties }
  const use = combined.content_slug && useKinds[`${name}:${properties.action}`]
  const engagement = Boolean(combined.source_topic_slug && (use || name === "topic_action_open" || name === "contribution_open" || (name === "content_copy" && context.page_type === "contribute" && properties.action === "prompt")))
  return { ...combined, site: "agora-recipes", measurement_version: 1, is_recipe_use: Boolean(use), is_topic_engagement: engagement, ...(use && { recipe_use_kind: use }) }
}

// Keep anonymous transport/session identity and bounded measurements. Discard SDK
// profile updates, DOM text, referrers, arbitrary query strings, and clipboard data.
const allowedProperties = new Set([
  "token", "distinct_id", "$device_id", "$session_id", "$window_id", "$lib", "$lib_version", "$insert_id", "$time",
  "$is_identified", "$process_person_profile", "$current_url", "$pathname", "$host", "$browser", "$browser_version", "$os", "$os_version", "$device_type",
  "site", "measurement_version", "locale", "page_type", "content_slug", "topic_slug", "source_topic_slug", "action", "placement", "result_count", "is_recipe_use", "recipe_use_kind", "is_topic_engagement",
])
export function sanitizePosthogEvent<T extends { event: string; properties: Record<string, unknown> }>(event: T): T | null {
  if (event.event !== "$pageview" && !Object.hasOwn(eventActions, event.event)) return null
  const properties = Object.fromEntries(Object.entries(event.properties).filter(([key]) => allowedProperties.has(key)))
  if (typeof properties.$current_url === "string") properties.$current_url = analyticsUrl(properties.$current_url)
  return { ...event, properties }
}
