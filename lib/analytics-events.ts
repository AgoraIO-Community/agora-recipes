export const eventActions = {
  catalog_action: ["search", "result_open", "filter", "sort", "expand", "collapse", "load_more"],
  material_open: ["demo", "source", "video_original"],
  video_play: ["play"],
  content_copy: ["prompt", "guide", "cli_command", "code"],
  share_action: ["copy_link", "native_open", "x_open", "linkedin_open"],
  topic_action_open: ["participate", "questions", "replay", "source"],
  contribution_open: ["github_form", "github_issue", "pr_instructions"],
} as const
export type AnalyticsEvent = keyof typeof eventActions
export type EventDimensions = { action: string; placement?: string; locale?: string; content_slug?: string; topic_slug?: string; source_topic_slug?: string; result_count?: number; search_term?: string; search_status?: string; search_id?: string; result_position?: number }

export const campaignKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_id", "utm_content", "utm_term"] as const
export type Campaign = Partial<Record<typeof campaignKeys[number], string>>

// Measure public discovery intent, with bounded text instead of arbitrary inputs.
// This filters common sensitive patterns; it is not a guarantee of PII detection.
export function analyticsText(value: unknown, lowercase = false): string | undefined {
  if (typeof value !== "string") return undefined
  const text = value.normalize("NFKC").trim().replace(/\s+/g, " ")
  if (!text || text.length > 100 || /[\p{Cc}\p{Cf}]/u.test(text) ||
    /@|https?:|www\.|(?:password|secret|token|api[-_ ]?key|authorization)\s*[:=]|\bbearer\s|\b(?:sk[-_]|ph[cp]_|gh[pousr]_|github_pat_)[a-z0-9_-]{8,}|\beyJ[a-z0-9_-]+\.[a-z0-9_-]+/i.test(text) ||
    (lowercase && /(?:\d[\s()+.-]*){7,}/.test(text))) return undefined
  return lowercase ? text.toLowerCase() : text
}

export function campaignProperties(input: Record<string, unknown>): Campaign {
  const campaign: Campaign = {}
  for (const key of campaignKeys) {
    const value = analyticsText(input[key])
    if (value) campaign[key] = value
  }
  return campaign
}

export function analyticsEnabled(nodeEnv?: string, vercel?: string, environment?: string) {
  return nodeEnv === "production" && vercel === "1" && environment === "production"
}

// A production build can also be opened through a deployment URL or served
// locally. Only the canonical HTTPS origin may initialize analytics.
export function analyticsOriginAllowed(value?: string, productionOrigin?: string) {
  try {
    const expected = new URL(productionOrigin ?? "")
    const actual = new URL(value ?? "")
    return expected.protocol === "https:" && expected.pathname === "/" &&
      !expected.username && !expected.password && !expected.search && !expected.hash &&
      actual.origin === expected.origin
  } catch { return false }
}

// Only bounded measurements leave the app; account identity, clipboard text,
// destination URLs and submission data are not part of this contract.
export function createAnalyticsEvent(name: AnalyticsEvent, input: EventDimensions) {
  if (!Object.hasOwn(eventActions, name) || !(eventActions[name] as readonly string[]).includes(input.action)) return undefined
  const properties: Record<string, string | number | boolean> = { action: input.action }
  if (["en", "zh-Hans", "zh-Hant", "ja", "hi", "es", "pt-BR"].includes(input.locale ?? "")) properties.locale = input.locale!
  for (const key of ["content_slug", "topic_slug", "source_topic_slug"] as const) if (input[key] && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input[key]) && input[key].length <= 100) properties[key] = input[key]
  if (["catalog", "topic_list", "catalog_card", "hero", "reader", "player", "topic_page", "contribution", "sharing"].includes(input.placement ?? "")) properties.placement = input.placement!
  if (Number.isSafeInteger(input.result_count) && input.result_count! >= 0) properties.result_count = input.result_count!
  if (name === "catalog_action" && ["search", "result_open"].includes(input.action)) {
    const term = analyticsText(input.search_term, true)
    if (term) properties.search_term = term
    else if (input.search_term?.trim()) properties.search_term_redacted = true
    if (["complete", "metadata_only"].includes(input.search_status ?? "")) properties.search_status = input.search_status!
    if (/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(input.search_id ?? "")) properties.search_id = input.search_id!
    if (input.action === "result_open" && Number.isSafeInteger(input.result_position) && input.result_position! > 0) properties.result_position = input.result_position!
  }
  return { name, properties }
}

// Vercel Pro allows two custom properties. Keep its useful summary within that
// budget; the vendor-independent payload remains available to richer adapters.
export function vercelProperties(properties: Record<string, string | number | boolean>) {
  const summary: Record<string, string | number | boolean> = { action: properties.action }
  const keys = properties.action === "search"
    ? ["search_term", "search_term_redacted", "result_count"]
    : ["content_slug", "topic_slug", "source_topic_slug", "placement"]
  const key = keys.find(key => properties[key] !== undefined)
  if (key) summary[key] = properties[key]
  return summary
}

export function analyticsUrl(value: string): string | undefined {
  try {
    const url = new URL(value)
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined
    url.username = ""; url.password = ""; url.search = ""; url.hash = ""
    return url.href
  } catch { return undefined }
}
