import { campaignText, campaignKeys, type Campaign } from "./analytics-events"

export type Attribution = Campaign & { utm_source: string; landing_path: string }
export const attributionStorageKey = "recipes:campaign:v1"
export const tabPrefix = "recipes:tab:"

export function readUtm(params: URLSearchParams): Campaign | undefined {
  const values: Campaign = {}
  for (const key of campaignKeys) {
    const value = campaignText(params.get(key))
    if (value) values[key] = value
  }
  return values.utm_source ? values : undefined
}

export function sanitizeAttribution(input: Record<string, unknown>): Attribution | undefined {
  const params = new URLSearchParams()
  for (const key of campaignKeys) if (typeof input[key] === "string") params.set(key, input[key])
  const campaign = readUtm(params)
  const path = input.landing_path
  if (!campaign?.utm_source || typeof path !== "string" || path.length > 2048 || !/^\/(?!\/)/.test(path) || /[?#\\\p{Cc}\p{Cf}]/u.test(path)) return undefined
  return { ...campaign, utm_source: campaign.utm_source, landing_path: path }
}

/** Only designated catalog Demo links and the Console resource use this adapter. */
export function attributedDestination(value: string, attribution?: Attribution): string {
  const current = attribution && sanitizeAttribution(attribution)
  if (!current) return value
  try {
    const url = new URL(value)
    if (url.protocol !== "https:" || url.username || url.password) return value
    for (const key of campaignKeys) url.searchParams.delete(key)
    for (const key of campaignKeys) if (current[key]) url.searchParams.set(key, current[key])
    return url.href
  } catch { return value }
}

type StoredAttribution = { tab: string; owner?: string; released: boolean; attribution?: Attribution }
export type AttributionEnvironment = {
  url: string
  referrer: string
  navigationType: string
  restoredFromBFCache?: boolean
  isGranted(): boolean
  getTabName(): string
  setTabName(name: string): void
  read(): string | null
  write(value: string): void
  remove(): void
  newToken(): string
}

/** One consent-bound document controller; there is no time-based expiry. */
export function createAttributionController(env: AttributionEnvironment) {
  let stored: StoredAttribution | undefined
  let tab = ""
  let owner = ""
  let attribution: Attribution | undefined
  let pendingEntry: Attribution | undefined
  let writable = false
  let cleared = false

  function readStored() {
    const saved = JSON.parse(env.read() ?? "null") as StoredAttribution | null
    return saved && typeof saved.tab === "string" ? saved : undefined
  }
  function persist(released: boolean) {
    if (cleared || !env.isGranted() || !writable) return
    try {
      // A restored or delayed document must not overwrite a newer owner.
      if (env.getTabName() !== tab) return
      const latest = readStored()
      if (!latest || latest.tab !== tab || latest.owner !== owner) return
      env.write(JSON.stringify({ tab, owner, released, attribution }))
    } catch { /* Current-document memory remains usable with blocked storage. */ }
  }
  if (env.isGranted()) {
    owner = env.newToken()
    try { stored = readStored() } catch { /* Storage can be denied or corrupt. */ }
    try { tab = env.getTabName() } catch { /* No ownership evidence: do not inherit. */ }
    const ownsTab = stored && stored.tab.startsWith(tabPrefix) && (env.restoredFromBFCache === true || stored.released === true && stored.tab === tab)
    if (ownsTab) {
      tab = stored!.tab
      try { env.setTabName(tab) } catch { /* Memory attribution remains usable. */ }
    }
    attribution = ownsTab && stored?.attribution ? sanitizeAttribution(stored.attribution) : undefined
    if (!ownsTab) {
      tab = tabPrefix + env.newToken()
      try { env.setTabName(tab) } catch { /* Keep current-document attribution only. */ }
    }
    const url = new URL(env.url)
    const campaign = readUtm(url.searchParams)
    let internal = false
    try { internal = new URL(env.referrer).origin === url.origin } catch { /* No internal-navigation evidence. */ }
    const restoring = ["reload", "back_forward"].includes(env.navigationType)
    const entry = Boolean(campaign && !restoring && !(ownsTab && internal))
    if (campaign && (entry || !attribution)) attribution = sanitizeAttribution({ ...campaign, landing_path: url.pathname })
    pendingEntry = entry ? attribution : undefined
    writable = true
    // This document may replace inherited state after validating ownership.
    try { env.write(JSON.stringify({ tab, owner, released: false, attribution })) } catch { /* Memory fallback. */ }
  }

  return {
    get: () => !cleared && env.isGranted() ? attribution : undefined,
    takeEntry() {
      if (cleared || !env.isGranted()) return undefined
      const entry = pendingEntry; pendingEntry = undefined; return entry
    },
    release() { persist(true) },
    resume(restoredFromBFCache = false) {
      if (cleared || !env.isGranted()) return
      pendingEntry = undefined
      try {
        const latest = readStored()
        const currentTab = env.getTabName()
        if (latest && latest.tab.startsWith(tabPrefix) && (latest.tab === currentTab || restoredFromBFCache)) {
          // A confirmed BFCache return uses this browsing context's latest
          // session snapshot, even if its pagehide release has not arrived.
          // Adopt its complete source instead of writing this document's old one.
          tab = latest.tab
          if (currentTab !== tab) env.setTabName(tab)
          attribution = latest.attribution && sanitizeAttribution(latest.attribution)
          writable = true
          // Claim this snapshot before a previous document's delayed release.
          env.write(JSON.stringify({ tab, owner, released: false, attribution }))
        } else {
          attribution = undefined
          writable = false
        }
      } catch { /* Retain memory on read failure; persist still checks ownership. */ }
      persist(false)
    },
    clear() {
      cleared = true
      attribution = undefined
      pendingEntry = undefined
      writable = false
      try { env.remove() } catch { /* Withdrawal cannot depend on storage access. */ }
      try { if (env.getTabName() === tab && tab.startsWith(tabPrefix)) env.setTabName("") } catch { /* Restricted host property. */ }
    },
  }
}
