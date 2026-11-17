"use client"

import { createContext, Suspense, useCallback, useContext, useEffect, useRef, useSyncExternalStore, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { Analytics } from "@vercel/analytics/next"
import { track } from "@vercel/analytics"
import { useI18n } from "./locale-provider"
import { useCatalogSearch } from "@/hooks/use-catalog-location"
import { analyticsOriginAllowed, analyticsUrl, createAnalyticsEvent, vercelProperties, type AnalyticsEvent, type EventDimensions } from "@/lib/analytics-events"
import { pageContext, analyticsProperties } from "@/lib/analytics-context"
import { attributionStore } from "@/lib/browser-attribution"
import { capturePosthog, syncPosthogConsent } from "@/lib/posthog-client"
import { analyticsConsent, ga4Consent } from "@/lib/analytics-consent"
import { basicCampaignProperties, basicPageCount, basicUsageCount, sendBasicCount, type BasicCount } from "@/lib/basic-analytics"
import { captureGa4PageView, syncGa4Consent } from "@/lib/ga4-client"

const AnalyticsContext = createContext<{ enabled: boolean; basicEnabled: boolean; productionOrigin: string; topics: readonly string[] }>({ enabled: false, basicEnabled: false, productionOrigin: "", topics: [] })
// The origin cannot change within a document. Keep the server snapshot disabled
// and check the real browser origin when hydration completes.
const subscribeToOrigin = () => () => {}
const pendingConsent = () => "pending" as const
export const useAnalyticsActive = () => useContext(AnalyticsContext).enabled

export function useBasicAnalytics() {
  const { basicEnabled } = useContext(AnalyticsContext)
  return useCallback((count: BasicCount) => {
    if (!basicEnabled) return false
    sendBasicCount({ ...count, ...basicCampaignProperties(window.location.search) })
    return true
  }, [basicEnabled])
}

function BasicPageAnalytics() {
  const pathname = usePathname() ?? "/"
  const capture = useBasicAnalytics()
  const previousPath = useRef<string | undefined>(undefined)
  useEffect(() => {
    if (previousPath.current === pathname) return
    const count = basicPageCount(pathname)
    if (count && capture(count)) previousPath.current = pathname
  }, [pathname, capture])
  return null
}

export function useAnalytics() {
  const { enabled, productionOrigin, topics } = useContext(AnalyticsContext)
  const captureBasic = useBasicAnalytics()
  const { locale } = useI18n()
  const pathname = usePathname() ?? "/"
  const search = useCatalogSearch()
  return useCallback((name: AnalyticsEvent, dimensions: EventDimensions) => {
    const context = pageContext(pathname, search, topics)
    const event = createAnalyticsEvent(name, { ...context, ...dimensions, locale })
    if (!event) return false
    const basic = basicUsageCount(pathname, name, event.properties)
    if (basic) captureBasic(basic)
    if (!enabled || !analyticsConsent.isGranted()) return false
    attributionStore.start()
    const properties = analyticsProperties(context, event.name, event.properties, attributionStore.getSnapshot())
    try { track(event.name, vercelProperties(properties)) } catch { /* Analytics cannot block the visitor action. */ }
    capturePosthog(event.name, { ...properties, $current_url: analyticsUrl(window.location.href) }, productionOrigin)
    return true
  }, [captureBasic, enabled, productionOrigin, locale, pathname, search, topics])
}

function PageAnalytics() {
  const pathname = usePathname() ?? "/"
  const { topics, productionOrigin } = useContext(AnalyticsContext)
  const previousPath = useRef<string | undefined>(undefined)
  useEffect(() => {
    if (!analyticsConsent.isGranted()) return
    // Filters and submission association changes are not additional page views.
    if (previousPath.current === pathname) return
    previousPath.current = pathname
    const context = pageContext(pathname, window.location.search, topics)
    attributionStore.start()
    const entry = attributionStore.takeEntry()
    if (entry) capturePosthog("campaign_entry", { ...analyticsProperties(context, "campaign_entry", {}, entry), $current_url: analyticsUrl(window.location.href) }, productionOrigin)
    capturePosthog("$pageview", { ...analyticsProperties(context, "$pageview", {}, attributionStore.getSnapshot()), $current_url: analyticsUrl(window.location.href) }, productionOrigin)
  }, [pathname, topics, productionOrigin])
  useEffect(() => {
    const restored = (event: PageTransitionEvent) => {
      if (!event.persisted || !analyticsConsent.isGranted()) return
      const context = pageContext(window.location.pathname, window.location.search, topics)
      capturePosthog("$pageview", { ...analyticsProperties(context, "$pageview", {}, attributionStore.getSnapshot()), $current_url: analyticsUrl(window.location.href) }, productionOrigin)
    }
    window.addEventListener("pageshow", restored)
    return () => window.removeEventListener("pageshow", restored)
  }, [topics, productionOrigin])
  return null
}

function TrafficPageAnalytics({ productionOrigin }: { productionOrigin: string }) {
  const pathname = usePathname() ?? "/"
  const previousPath = useRef<string | undefined>(undefined)
  useEffect(() => {
    if (previousPath.current === pathname) return
    if (captureGa4PageView(productionOrigin)) previousPath.current = pathname
  }, [pathname, productionOrigin])
  return null
}

function LinkAnalytics() {
  const capture = useAnalytics()
  useEffect(() => {
    function clicked(event: MouseEvent) {
      if (event.type === "auxclick" && event.button !== 1 || event.type === "click" && event.button !== 0) return
      const link = (event.target as Element).closest<HTMLAnchorElement>("a[data-material], a[data-contribution], a[data-topic-action]")
      if (!link) return
      const content_slug = link.closest<HTMLElement>("[data-recipe-slug]")?.dataset.recipeSlug
      const placement = link.dataset.placement ?? (content_slug ? "catalog_card" : "hero")
      if (link.dataset.material) capture("material_open", { action: link.dataset.material, placement, content_slug })
      if (link.dataset.contribution) capture("contribution_open", { action: link.dataset.contribution, placement: "contribution" })
      if (link.dataset.topicAction) capture("topic_action_open", { action: link.dataset.topicAction, placement: "topic_page" })
    }
    document.addEventListener("click", clicked)
    document.addEventListener("auxclick", clicked)
    return () => { document.removeEventListener("click", clicked); document.removeEventListener("auxclick", clicked) }
  }, [capture])
  return null
}
export function AnalyticsProvider({ enabled, productionOrigin, topics, children }: { enabled: boolean; productionOrigin: string; topics: readonly string[]; children: ReactNode }) {
  const production = useSyncExternalStore(subscribeToOrigin, () => enabled && analyticsOriginAllowed(window.location.href, productionOrigin), () => false)
  const choice = useSyncExternalStore(analyticsConsent.subscribe, analyticsConsent.getSnapshot, pendingConsent)
  const trafficChoice = useSyncExternalStore(ga4Consent?.subscribe ?? subscribeToOrigin, ga4Consent?.getSnapshot ?? pendingConsent, pendingConsent)
  useEffect(() => {
    attributionStore.start()
    let previous: string | undefined
    return analyticsConsent.subscribe(() => {
      const next = analyticsConsent.getSnapshot()
      if (next === previous) return
      previous = next
      if (next !== "granted") { syncPosthogConsent() }
    })
  }, [])
  useEffect(() => {
    if (!production || !ga4Consent) return
    syncGa4Consent()
    return ga4Consent.subscribe(syncGa4Consent)
  }, [production])
  const active = production && choice === "granted"
  return <AnalyticsContext.Provider value={{ enabled: active, basicEnabled: production, productionOrigin, topics }}>{children}{production && <><BasicPageAnalytics /><LinkAnalytics /></>}{active && <><PageAnalytics /><Suspense fallback={null}><Analytics beforeSend={event => { if (!analyticsConsent.isGranted()) return null; const url = analyticsUrl(event.url); return url ? { ...event, url } : null }} /></Suspense></>}{production && trafficChoice === "granted" && <TrafficPageAnalytics productionOrigin={productionOrigin} />}</AnalyticsContext.Provider>
}
