export type ConsentChoice = "pending" | "granted" | "denied"
export const consentStorageKey = "recipes:analytics-consent:v1"
const choiceLifetime = 180 * 24 * 60 * 60 * 1000

export type SecuritiConsentApi = {
  isConsentGiven(): boolean
  getConsent(): { category?: Record<string, string> } | null
  getCategories(): { name: string; base_category: string }[]
  showPreferenceCenter(): void
}

export function securitiAnalyticsChoice(api: SecuritiConsentApi): ConsentChoice {
  try {
    if (!api.isConsentGiven()) return "pending"
    const category = api.getCategories().find(category => category.base_category === "Analytics & Customization")
    if (!category) return "pending"
    return api.getConsent()?.category?.[category.name] === "granted" ? "granted" : "denied"
  } catch { return "pending" }
}

export function savedConsentChoice(value: string | null, now: number): ConsentChoice {
  try {
    const record = JSON.parse(value ?? "null")
    if (record?.version !== 1 || typeof record.analytics !== "boolean" || !Number.isFinite(record.updatedAt) || record.updatedAt > now || now - record.updatedAt >= choiceLifetime) return "pending"
    return record.analytics ? "granted" : "denied"
  } catch { return "pending" }
}

// The app and both analytics adapters share this gate. No vendor identity or
// campaign data is needed to remember a privacy choice.
export function createConsentStore(storage: () => Pick<Storage, "getItem" | "setItem">, now = Date.now, key = consentStorageKey) {
  let reader = (): ConsentChoice => "pending"
  const listeners = new Set<() => void>()
  const refresh = () => { for (const listener of listeners) listener() }
  return {
    getSnapshot: () => reader(),
    isGranted: () => reader() === "granted",
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } },
    refresh,
    usePending() { reader = () => "pending"; refresh() },
    useLocal() {
      let fallback: ConsentChoice = "pending"
      let memoryOnly = false
      reader = () => {
        if (memoryOnly) return fallback
        try { return savedConsentChoice(storage().getItem(key), now()) } catch { return fallback }
      }
      refresh()
      return (analytics: boolean) => {
        fallback = analytics ? "granted" : "denied"
        try { storage().setItem(key, JSON.stringify({ version: 1, analytics, updatedAt: now() })); memoryOnly = false } catch { memoryOnly = true }
        refresh()
      }
    },
    useSecuriti(api: SecuritiConsentApi) { reader = () => securitiAnalyticsChoice(api); refresh() },
  }
}

export const analyticsConsent = createConsentStore(() => window.localStorage)

const configuredMeasurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID?.trim()
export const ga4MeasurementId = configuredMeasurementId && /^G-[A-Z0-9]{1,32}$/.test(configuredMeasurementId)
  ? configuredMeasurementId
  : undefined

// A grant for a different destination, or for product analytics, cannot enable GA4.
export const ga4Consent = ga4MeasurementId
  ? createConsentStore(() => window.localStorage, Date.now, `recipes:ga4-consent:v1:${ga4MeasurementId}`)
  : undefined
