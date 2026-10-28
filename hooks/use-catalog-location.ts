"use client"

import { useSyncExternalStore } from "react"
import { catalogReturnPath, type Locale } from "@/lib/locales"

const locationEvent = "recipes:location"
export const catalogPositionKey = (href: string) => `recipes:catalog-position:${href}`

function subscribe(callback: () => void) {
  window.addEventListener("popstate", callback)
  window.addEventListener(locationEvent, callback)
  return () => {
    window.removeEventListener("popstate", callback)
    window.removeEventListener(locationEvent, callback)
  }
}

export function useCatalogSearch() {
  return useSyncExternalStore(subscribe, () => window.location.search, () => "")
}

export function replaceCatalogSearch(params: URLSearchParams) {
  replaceLocationSearch(params, "#recipes")
}

export function replaceLocationSearch(params: URLSearchParams, hash = window.location.hash) {
  const search = params.toString()
  window.history.replaceState(window.history.state, "", `${window.location.pathname}${search ? `?${search}` : ""}${hash}`)
  window.dispatchEvent(new Event(locationEvent))
}

export function rememberCatalogPosition() {
  try {
    const href = `${window.location.pathname}${window.location.search}#recipes`
    sessionStorage.setItem(catalogPositionKey(href), JSON.stringify({ href, scroll: window.scrollY }))
  } catch { /* URL state and list anchors work without session storage. */ }
}

export function getCatalogReturnHref(search = "", locale: Locale = "en"): string {
  return catalogReturnPath(new URLSearchParams(search).get("returnTo"), locale)
}
