"use client"

import { createContext, Suspense, useCallback, useContext, useEffect, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { Analytics } from "@vercel/analytics/next"
import { track } from "@vercel/analytics"
import { useI18n } from "./locale-provider"
import { useCatalogSearch } from "@/hooks/use-catalog-location"
import { catalogReturnPath, localePath } from "@/lib/locales"
import { analyticsUrl, createAnalyticsEvent, type AnalyticsEvent, type EventDimensions } from "@/lib/analytics-events"

const AnalyticsContext = createContext(false)
export function useAnalytics() {
  const enabled = useContext(AnalyticsContext)
  const { locale } = useI18n()
  const pathname = usePathname() ?? "/"
  const search = useCatalogSearch()
  return useCallback((name: AnalyticsEvent, dimensions: EventDimensions) => {
    if (!enabled) return
    const path = localePath(pathname, "en")
    const source = catalogReturnPath(new URLSearchParams(search).get("returnTo"), locale)
    const event = createAnalyticsEvent(name, { ...dimensions, locale, content_slug: dimensions.content_slug ?? path.match(/^\/recipes\/([a-z0-9-]+)/)?.[1], topic_slug: dimensions.topic_slug ?? path.match(/^\/topics\/([a-z0-9-]+)/)?.[1] ?? source.match(/\/topics\/([a-z0-9-]+)/)?.[1] })
    if (event) { try { track(event.name, event.properties) } catch { /* Analytics cannot block the visitor action. */ } }
  }, [enabled, locale, pathname, search])
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
export function AnalyticsProvider({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  return <AnalyticsContext.Provider value={enabled}>{children}{enabled && <><LinkAnalytics /><Suspense fallback={null}><Analytics beforeSend={event => { const url = analyticsUrl(event.url); return url ? { ...event, url } : null }} /></Suspense></>}</AnalyticsContext.Provider>
}
