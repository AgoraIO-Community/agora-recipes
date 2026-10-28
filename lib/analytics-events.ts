export const eventActions = {
  catalog_action: ["search", "filter", "sort", "expand", "collapse"],
  material_open: ["demo", "source", "video_original"],
  video_play: ["play"],
  content_copy: ["prompt", "guide", "cli_command", "code"],
  share_action: ["copy_link", "native_open", "x_open", "linkedin_open"],
  topic_action_open: ["participate", "questions", "replay"],
  contribution_open: ["github_form", "github_issue", "pr_instructions"],
} as const
export type AnalyticsEvent = keyof typeof eventActions
export type EventDimensions = { action: string; placement?: string; locale?: string; content_slug?: string; topic_slug?: string; result_count?: number }

export function analyticsEnabled(nodeEnv?: string, vercel?: string, environment?: string) {
  return nodeEnv === "production" && vercel === "1" && environment === "production"
}

// Only bounded public dimensions leave the app. In particular, no search text,
// author/account identity, clipboard text, destination URLs, or submission data.
export function createAnalyticsEvent(name: AnalyticsEvent, input: EventDimensions) {
  if (!Object.hasOwn(eventActions, name) || !(eventActions[name] as readonly string[]).includes(input.action)) return undefined
  const properties: Record<string, string | number> = { action: input.action }
  if (["en", "zh-Hans", "zh-Hant", "ja"].includes(input.locale ?? "")) properties.locale = input.locale!
  for (const key of ["content_slug", "topic_slug"] as const) if (input[key] && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input[key]) && input[key].length <= 100) properties[key] = input[key]
  if (["catalog", "topic_list", "catalog_card", "hero", "reader", "player", "topic_page", "contribution", "sharing"].includes(input.placement ?? "")) properties.placement = input.placement!
  if (Number.isSafeInteger(input.result_count) && input.result_count! >= 0) properties.result_count = input.result_count!
  return { name, properties }
}

export function analyticsUrl(value: string): string | undefined {
  try {
    const url = new URL(value)
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined
    url.username = ""; url.password = ""; url.search = ""; url.hash = ""
    return url.href
  } catch { return undefined }
}
