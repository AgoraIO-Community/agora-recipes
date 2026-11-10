export const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const
export type Utm = { utm_source: string } & Partial<Record<typeof utmKeys[number], string>>
export type Attribution = Utm & { landing_path: string }
export const attributionStorageKey = "recipes:utm"
const tabPrefix = "recipes:tab:"

function validValue(key: typeof utmKeys[number], value: unknown): value is string {
  if (typeof value !== "string" || !value || [...value].length > 100) return false
  return key === "utm_term"
    ? value.trim().length > 0 && !/[\p{Cc}\p{Cf}{}<>]/u.test(value)
    : /^[a-z0-9_]+$/.test(value)
}

export function readUtm(params: URLSearchParams): Utm | undefined {
  const values: Record<string, string> = {}
  for (const key of utmKeys) {
    const candidates = params.getAll(key)
    if (candidates.length === 1 && validValue(key, candidates[0])) values[key] = candidates[0]
  }
  return values.utm_source ? values as Utm : undefined
}

/** Revalidate persisted state and final transport properties, not just query input. */
export function sanitizeAttribution(input: Record<string, unknown>): Attribution | undefined {
  const params = new URLSearchParams()
  for (const key of utmKeys) if (typeof input[key] === "string") params.set(key, input[key])
  const utm = readUtm(params)
  const path = input.landing_path
  if (!utm || typeof path !== "string" || path.length > 2048 || !/^\/(?!\/)/.test(path) || /[?#\\\p{Cc}\p{Cf}]/u.test(path)) return undefined
  return { ...utm, landing_path: path }
}

/** Vercel may see legal UTM only; PostHog continues to use query-free URLs. */
export function vercelAnalyticsUrl(value: string): string | undefined {
  try {
    const url = new URL(value)
    if (!["https:", "http:"].includes(url.protocol)) return undefined
    const utm = readUtm(url.searchParams)
    url.username = ""; url.password = ""; url.search = ""; url.hash = ""
    for (const key of utmKeys) if (utm?.[key]) url.searchParams.set(key, utm[key])
    return url.href
  } catch { return undefined }
}

/** Call only for catalog Demo links or the explicitly designated Console link. */
export function attributedDestination(value: string, attribution?: Attribution): string {
  const current = attribution && sanitizeAttribution(attribution)
  if (!current) return value
  try {
    const url = new URL(value)
    if (url.protocol !== "https:" || url.username || url.password) return value
    // Replace the whole set: a source-only entry must not inherit CTA defaults.
    for (const key of utmKeys) url.searchParams.delete(key)
    for (const key of utmKeys) if (current[key]) url.searchParams.set(key, current[key])
    return url.href
  } catch { return value }
}

type StoredAttribution = { tab: string; released: boolean; attribution?: Attribution }
export type AttributionEnvironment = {
  url: string
  referrer: string
  navigationType: string
  getTabName(): string
  setTabName(name: string): void
  read(): string | null
  write(value: string): void
  newToken(): string
}

/** One controller per document. Snapshots never depend on a visitor's last event. */
export function createAttributionController(env: AttributionEnvironment) {
  let stored: StoredAttribution | undefined
  try { stored = JSON.parse(env.read() ?? "null") ?? undefined } catch { /* Storage can be denied or corrupt. */ }
  let tab = ""
  try { tab = env.getTabName() } catch { /* No ownership evidence: do not inherit. */ }
  const ownsTab = tab.startsWith(tabPrefix) && stored?.tab === tab && stored?.released === true
  // A cloned tab may copy both sessionStorage and window.name, but its source
  // document has not released ownership. Fail closed rather than guessing.
  let attribution = ownsTab && stored?.attribution ? sanitizeAttribution(stored.attribution) : undefined
  if (!ownsTab) {
    tab = tabPrefix + env.newToken()
    try { env.setTabName(tab) } catch { /* Current-document attribution still works. */ }
  }
  const url = new URL(env.url)
  const utm = readUtm(url.searchParams)
  let internal = false
  try { internal = new URL(env.referrer).origin === url.origin } catch { /* No referrer is not proof of an internal navigation. */ }
  const restoring = ["reload", "back_forward"].includes(env.navigationType)
  const campaignEntry = Boolean(utm && !restoring && !(ownsTab && internal))
  if (utm && (campaignEntry || !attribution)) attribution = sanitizeAttribution({ ...utm, landing_path: url.pathname })
  let pendingEntry = campaignEntry && attribution ? { ...attribution } : undefined

  function persist(released: boolean) {
    try { env.write(JSON.stringify({ tab, released, attribution })) } catch { /* Retain the in-memory snapshot only. */ }
  }
  persist(false)
  return {
    get: () => attribution,
    takeEntry() { const entry = pendingEntry; pendingEntry = undefined; return entry },
    release() { persist(true) },
    resume() {
      // BFCache can restore an older document after another document changed
      // this tab's source. Read the current tab snapshot, not historical memory.
      try {
        const latest = JSON.parse(env.read() ?? "null") as StoredAttribution | null
        if (latest?.tab === tab) attribution = latest.attribution && sanitizeAttribution(latest.attribution)
      } catch { /* Keep current-document memory if storage cannot be read. */ }
      persist(false)
    },
  }
}

type Controller = ReturnType<typeof createAttributionController>
let controller: Controller | undefined

/** Lazy initialization also covers actions before the page-view effect runs. */
export function browserAttribution(): Controller | undefined {
  if (typeof window === "undefined") return undefined
  if (!controller) {
    controller = createAttributionController({
      url: window.location.href,
      referrer: document.referrer,
      navigationType: (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)?.type ?? "navigate",
      getTabName: () => window.name,
      setTabName: name => { window.name = name },
      read: () => window.sessionStorage.getItem(attributionStorageKey),
      write: value => window.sessionStorage.setItem(attributionStorageKey, value),
      newToken: () => crypto.randomUUID(),
    })
    window.addEventListener("pagehide", () => controller?.release())
    window.addEventListener("pageshow", () => controller?.resume())
  }
  return controller
}
