"use client"

import { createContext, Suspense, useCallback, useContext, useEffect, useRef, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { Analytics } from "@vercel/analytics/next"
import { track } from "@vercel/analytics"
import { useI18n } from "./locale-provider"
import { useCatalogSearch } from "@/hooks/use-catalog-location"
import { analyticsUrl, createAnalyticsEvent, type AnalyticsEvent, type EventDimensions } from "@/lib/analytics-events"
import { pageContext, posthogProperties } from "@/lib/posthog-events"
import { capturePosthog } from "@/lib/posthog-client"

const AnalyticsContext = createContext<{ enabled: boolean; topics: readonly string[] }>({ enabled: false, topics: [] })
export function useAnalytics() {
  const { enabled, topics } = useContext(AnalyticsContext)
  const { locale } = useI18n()
  const pathname = usePathname() ?? "/"
  const search = useCatalogSearch()
  return useCallback((name: AnalyticsEvent, dimensions: EventDimensions) => {
    if (!enabled) return
    const context = pageContext(pathname, search, topics)
    const event = createAnalyticsEvent(name, { ...context, ...dimensions, locale })
    if (!event) return
    try { track(event.name, event.properties) } catch { /* Analytics cannot block the visitor action. */ }
    capturePosthog(event.name, { ...posthogProperties(context, event.name, event.properties), $current_url: analyticsUrl(window.location.href) })
  }, [enabled, locale, pathname, search, topics])
}

function PageAnalytics() {
  const pathname = usePathname() ?? "/"
  const { topics } = useContext(AnalyticsContext)
  const previousPath = useRef<string | undefined>(undefined)
  useEffect(() => {
    // Filters and submission association changes are not additional page views.
    if (previousPath.current === pathname) return
    previousPath.current = pathname
    const context = pageContext(pathname, window.location.search, topics)
    capturePosthog("$pageview", { ...posthogProperties(context, "$pageview"), $current_url: analyticsUrl(window.location.href) })
  }, [pathname, topics])
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
export function AnalyticsProvider({ enabled, topics, children }: { enabled: boolean; topics: readonly string[]; children: ReactNode }) {
  return <AnalyticsContext.Provider value={{ enabled, topics }}>{children}{enabled && <><PageAnalytics /><LinkAnalytics /><Suspense fallback={null}><Analytics beforeSend={event => { const url = analyticsUrl(event.url); return url ? { ...event, url } : null }} /></Suspense></>}</AnalyticsContext.Provider>
}
