import { analyticsText, analyticsUrl, campaignKeys, campaignProperties, eventActions } from "./analytics-events"
import { applicationProperties } from "./analytics-context"

// Keep anonymous transport/session identity and bounded measurements. Discard SDK
// profile updates, DOM text, referrers, arbitrary query strings, and clipboard data.
const allowedProperties = new Set([
  "token", "distinct_id", "$device_id", "$session_id", "$window_id", "$lib", "$lib_version", "$insert_id", "$time",
  "$is_identified", "$process_person_profile", "$current_url", "$pathname", "$host", "$browser", "$browser_version", "$os", "$os_version", "$device_type",
  "app", "site", "environment", "measurement_version", "locale", "page_type", "content_slug", "topic_slug", "source_topic_slug", "action", "placement", "result_count", "is_recipe_use", "recipe_use_kind", "is_topic_engagement",
  ...campaignKeys, "search_term", "search_term_redacted", "search_status", "search_id", "result_position",
])
export function sanitizePosthogEvent<T extends { event: string; properties: Record<string, unknown> }>(event: T): T | null {
  if (event.event !== "$pageview" && !Object.hasOwn(eventActions, event.event)) return null
  const properties = Object.fromEntries(Object.entries(event.properties).filter(([key]) => allowedProperties.has(key)))
  if (typeof properties.$current_url === "string") properties.$current_url = analyticsUrl(properties.$current_url)
  for (const key of campaignKeys) delete properties[key]
  Object.assign(properties, campaignProperties(event.properties))
  if ("search_term" in properties) {
    const term = analyticsText(properties.search_term, true)
    delete properties.search_term
    if (term) properties.search_term = term
    else properties.search_term_redacted = true
  }
  // Enforce the shared-project dimensions at the final SDK boundary as well:
  // callers and persisted super-properties cannot relabel Recipes events.
  return { ...event, properties: { ...properties, ...applicationProperties } }
}
