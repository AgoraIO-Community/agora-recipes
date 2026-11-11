import type { BasicCount } from "./basic-analytics"

type Catalog = { recipes: ReadonlySet<string>; topics: ReadonlySet<string>; terms: ReadonlySet<string> }
type Configuration = Catalog & { enabled: boolean; origin: string; token?: string; host?: string }
const fields = new Set(["metric", "page_type", "content_slug", "topic_slug", "search_term", "zero_results"])
const response = (status: number) => new Response(null, { status, headers: { "Cache-Control": "no-store" } })

export function validBasicCount(input: unknown, catalog: Catalog): BasicCount | undefined {
  if (!input || typeof input !== "object" || Array.isArray(input)) return
  const value = input as Record<string, unknown>
  if (Object.keys(value).some(key => !fields.has(key))) return
  if (typeof value.metric !== "string" || !["page_view", "search"].includes(value.metric)) return
  if (typeof value.page_type !== "string" || !["catalog", "recipe", "topic_directory", "topic", "contribute"].includes(value.page_type)) return
  if (value.page_type === "recipe" ? typeof value.content_slug !== "string" || !catalog.recipes.has(value.content_slug) : value.content_slug !== undefined) return
  if (value.page_type === "topic" ? typeof value.topic_slug !== "string" || !catalog.topics.has(value.topic_slug) : value.topic_slug !== undefined) return
  if (value.metric === "search") {
    if (!["catalog", "topic"].includes(String(value.page_type)) || typeof value.zero_results !== "boolean") return
    if (typeof value.search_term !== "string" || value.search_term !== "other" && !catalog.terms.has(value.search_term)) return
  } else if (value.search_term !== undefined || value.zero_results !== undefined) return
  return value as BasicCount
}

async function readCount(request: Request) {
  const reader = request.body?.getReader()
  if (!reader) return
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > 512) { await reader.cancel(); return }
      chunks.push(value)
    }
    const bytes = new Uint8Array(size)
    let offset = 0
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength }
    return JSON.parse(new TextDecoder().decode(bytes)) as unknown
  } catch { return undefined }
}

export async function recordBasicCount(request: Request, config: Configuration, send: typeof fetch = fetch, now = Date.now) {
  if (!config.enabled) return response(204)
  // A first-party reverse proxy can change the upstream URL/Host. Browser
  // Origin and Fetch Metadata still describe the actual same-origin caller.
  if (request.headers.get("origin") !== config.origin || request.headers.has("sec-fetch-site") && request.headers.get("sec-fetch-site") !== "same-origin") return response(403)
  if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") return response(415)
  const count = validBasicCount(await readCount(request), config)
  if (!count) return response(400)
  if (!config.token) return response(503)
  try {
    const host = config.host?.trim() || "https://us.i.posthog.com"
    const destination = new URL(`${host.replace(/\/$/, "")}/i/v0/e/`, config.origin)
    if (destination.protocol !== "https:" || destination.username || destination.password || destination.search || destination.hash) return response(503)
    const day = new Date(now()).toISOString().slice(0, 10)
    // Every visitor contributes to the SAME public counter identity. It is not
    // a visitor/session ID, daily fingerprint, or identifier from the browser.
    // Only the increment and its public reporting bucket leave this server.
    const result = await send(destination, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: config.token, event: "recipes_basic_count", distinct_id: "recipes:aggregate",
        timestamp: `${day}T00:00:00.000Z`,
        properties: { ...count, day, count: 1, app: "recipes", site: "agora-recipes", environment: "production", measurement_tier: "aggregate", measurement_version: 3, $process_person_profile: false, $ip: "0.0.0.0", $geoip_disable: true },
      }),
      credentials: "omit", referrerPolicy: "no-referrer", redirect: "error", cache: "no-store", signal: AbortSignal.timeout(5000),
    })
    await result.body?.cancel()
    return response(result.ok ? 204 : 503)
  } catch { return response(503) }
}
