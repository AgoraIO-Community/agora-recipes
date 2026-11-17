export type ConsentChoice = "pending" | "granted" | "denied"

export type SecuritiConsentApi = {
  isConsentGiven(): boolean
  getConsent(): { category?: Record<string, string> } | null
  getCategories(): { name: string; base_category: string }[]
  showPreferenceCenter(): void
  showBanner(): void
}

// Both purposes read the same managed record. Recipes never writes a second
// consent record or treats an SDK's default state as an explicit decision.
export function securitiAnalyticsChoice(api: SecuritiConsentApi, purpose: "product" | "traffic" = "product", trafficCategory?: string): ConsentChoice {
  try {
    if (!api.isConsentGiven()) return "pending"
    const categories = api.getCategories().filter(category => category.base_category === "Analytics & Customization")
    const productCategories = categories.filter(category => category.name !== trafficCategory)
    // An ambiguous or overlapping configuration must not grant either purpose.
    if (productCategories.length !== 1) return "pending"
    const category = purpose === "product" ? productCategories[0] : categories.find(category => category.name === trafficCategory)
    if (!category) return "pending"
    const choice = api.getConsent()?.category?.[category.name]
    return choice === "granted" ? "granted" : (choice === "denied" || choice === "declined") ? "denied" : "pending"
  } catch { return "pending" }
}

export function createConsentStore(readChoice = securitiAnalyticsChoice) {
  let reader = (): ConsentChoice => "pending"
  const listeners = new Set<() => void>()
  const refresh = () => { for (const listener of listeners) listener() }
  return {
    getSnapshot: () => reader(),
    isGranted: () => reader() === "granted",
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } },
    refresh,
    usePending() { reader = () => "pending"; refresh() },
    useSecuriti(api: SecuritiConsentApi) { reader = () => readChoice(api); refresh() },
  }
}

const trafficCategory = process.env.NEXT_PUBLIC_SECURITI_GA4_CATEGORY?.trim()
export const analyticsConsent = createConsentStore(api => securitiAnalyticsChoice(api, "product", trafficCategory))

const configuredMeasurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID?.trim()
export const ga4MeasurementId = configuredMeasurementId && /^G-[A-Z0-9]{1,32}$/.test(configuredMeasurementId)
  ? configuredMeasurementId
  : undefined

// A dedicated category must exist in the managed preference center before GA4
// can start. An existing product analytics grant cannot authorize a new purpose.
export const ga4Consent = ga4MeasurementId
  ? createConsentStore(api => trafficCategory ? securitiAnalyticsChoice(api, "traffic", trafficCategory) : "pending")
  : undefined
