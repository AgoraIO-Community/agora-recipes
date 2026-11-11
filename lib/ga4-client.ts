import { ga4Consent, ga4MeasurementId } from "./analytics-consent"
import { analyticsOriginAllowed, analyticsUrl, campaignProperties } from "./analytics-events"

type PageView = { page_location: string; page_referrer: string }
declare global {
  interface Window {
    recipesGa4DataLayer?: unknown[]
  }
}

const cookiePrefix = "recipes_ga4"
let script: HTMLScriptElement | undefined
let loaded = false
let configured = false
let active = false
let pendingPage: PageView | undefined
let previousPage: string | undefined

const gtag: (...command: unknown[]) => void = function () {
  (window.recipesGa4DataLayer ??= []).push(arguments)
}

function flushPageView() {
  if (!loaded || !pendingPage || !ga4MeasurementId || !ga4Consent?.isGranted()) return
  const page = pendingPage
  pendingPage = undefined
  Reflect.set(window, `ga-disable-${ga4MeasurementId}`, false)
  if (!active) {
    gtag("consent", "update", { analytics_storage: "granted" })
    active = true
  }
  if (!configured) {
    gtag("js", new Date())
    gtag("config", ga4MeasurementId, {
      ...page,
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_domain: "none",
      cookie_prefix: cookiePrefix,
    })
    configured = true
  }
  gtag("set", page)
  gtag("event", "page_view", { ...page, send_to: ga4MeasurementId })
}

export function captureGa4PageView(productionOrigin: string) {
  if (!ga4MeasurementId || !ga4Consent?.isGranted() || !analyticsOriginAllowed(window.location.href, productionOrigin)) return false
  const location = new URL(window.location.href)
  const page = new URL(analyticsUrl(location.href)!)
  for (const [key, value] of Object.entries(campaignProperties(Object.fromEntries(location.searchParams)))) {
    page.searchParams.set(key, value)
  }
  const referrer = analyticsUrl(document.referrer)
  pendingPage = {
    page_location: page.href,
    page_referrer: previousPage ?? (referrer ? new URL(referrer).origin : ""),
  }
  previousPage = analyticsUrl(page.href)
  if (loaded) flushPageView()
  else if (!script) {
    gtag("consent", "default", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" })
    const tag = document.createElement("script")
    tag.async = true
    tag.src = `https://www.googletagmanager.com/gtag/js?id=${ga4MeasurementId}&l=recipesGa4DataLayer`
    tag.referrerPolicy = "no-referrer"
    tag.onload = () => { loaded = true; flushPageView() }
    tag.onerror = () => { tag.remove(); script = undefined; pendingPage = undefined }
    script = tag
    document.head.append(tag)
  }
  return true
}

export function syncGa4Consent() {
  const choice = ga4Consent?.getSnapshot()
  if (!ga4MeasurementId || choice === "granted") return
  pendingPage = undefined
  previousPage = undefined
  Reflect.set(window, `ga-disable-${ga4MeasurementId}`, true)
  if (active) {
    active = false
    gtag("consent", "update", { analytics_storage: "denied" })
  } else if (choice !== "denied") return
  try {
    for (const cookie of document.cookie.split(";")) {
      const key = cookie.split("=")[0].trim()
      if (key.startsWith(`${cookiePrefix}_`)) document.cookie = `${key}=; Max-Age=0; Path=/; Secure; SameSite=Lax`
    }
  } catch { /* Cookie access can be blocked by browser policy. */ }
}
