"use client"

import { createContext, Suspense, useCallback, useContext, useEffect, useRef, useSyncExternalStore, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { Analytics } from "@vercel/analytics/next"
import { track } from "@vercel/analytics"
import { useI18n } from "./locale-provider"
import { useCatalogSearch } from "@/hooks/use-catalog-location"
import { analyticsOriginAllowed, analyticsUrl, createAnalyticsEvent, type AnalyticsEvent, type EventDimensions } from "@/lib/analytics-events"
import { pageContext, posthogProperties } from "@/lib/posthog-events"
import { browserAttribution, vercelAnalyticsUrl } from "@/lib/utm-attribution"
import { capturePosthog } from "@/lib/posthog-client"

const AnalyticsContext = createContext<{ enabled: boolean; productionOrigin: string; topics: readonly string[] }>({ enabled: false, productionOrigin: "", topics: [] })
// The origin cannot change within a document. Keep the server snapshot disabled
// and check the real browser origin when hydration completes.
const subscribeToOrigin = () => () => {}

export function useAnalytics() {
  const { enabled, productionOrigin, topics } = useContext(AnalyticsContext)
  const { locale } = useI18n()
  const pathname = usePathname() ?? "/"
  const search = useCatalogSearch()
  return useCallback((name: AnalyticsEvent, dimensions: EventDimensions) => {
    if (!enabled) return
    const context = pageContext(pathname, search, topics)
    const event = createAnalyticsEvent(name, { ...context, ...dimensions, locale })
    if (!event) return
    const properties = { ...event.properties, ...browserAttribution()?.get() }
    try { track(event.name, properties) } catch { /* Analytics cannot block the visitor action. */ }
    capturePosthog(event.name, { ...posthogProperties(context, event.name, properties), $current_url: analyticsUrl(window.location.href) }, productionOrigin)
  }, [enabled, productionOrigin, locale, pathname, search, topics])
}

function PageAnalytics() {
  const pathname = usePathname() ?? "/"
  const { topics, productionOrigin } = useContext(AnalyticsContext)
  const previousPath = useRef<string | undefined>(undefined)
  useEffect(() => {
    // Filters and submission association changes are not additional page views.
    if (previousPath.current === pathname) return
    previousPath.current = pathname
    const context = pageContext(pathname, window.location.search, topics)
    const attribution = browserAttribution()
    const entry = attribution?.takeEntry()
    if (entry) {
      try { track("campaign_entry", { ...context, ...entry }) } catch { /* Collection cannot block navigation. */ }
      capturePosthog("campaign_entry", { ...posthogProperties(context, "campaign_entry", entry), $current_url: analyticsUrl(window.location.href) }, productionOrigin)
    }
    capturePosthog("$pageview", { ...posthogProperties(context, "$pageview", attribution?.get()), $current_url: analyticsUrl(window.location.href) }, productionOrigin)
  }, [pathname, topics, productionOrigin])
  useEffect(() => {
    function restored(event: PageTransitionEvent) {
      if (!event.persisted) return
      const context = pageContext(window.location.pathname, window.location.search, topics)
      capturePosthog("$pageview", { ...posthogProperties(context, "$pageview", browserAttribution()?.get()), $current_url: analyticsUrl(window.location.href) }, productionOrigin)
    }
    window.addEventListener("pageshow", restored)
    return () => window.removeEventListener("pageshow", restored)
  }, [topics, productionOrigin])
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
  const active = useSyncExternalStore(subscribeToOrigin, () => enabled && analyticsOriginAllowed(window.location.href, productionOrigin), () => false)
  return <AnalyticsContext.Provider value={{ enabled: active, productionOrigin, topics }}>{children}{active && <><PageAnalytics /><LinkAnalytics /><Suspense fallback={null}><Analytics beforeSend={event => { const url = vercelAnalyticsUrl(event.url); return url ? { ...event, url } : null }} /></Suspense></>}</AnalyticsContext.Provider>
}
