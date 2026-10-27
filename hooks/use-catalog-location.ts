"use client"

import { useSyncExternalStore } from "react"

const locationEvent = "recipes:location"
export const catalogPositionKey = "recipes:catalog-position"

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
  const search = params.toString()
  window.history.replaceState(window.history.state, "", `${window.location.pathname}${search ? `?${search}` : ""}#recipes`)
  window.dispatchEvent(new Event(locationEvent))
}

export function rememberCatalogPosition() {
  try {
    sessionStorage.setItem(catalogPositionKey, JSON.stringify({
      href: `${window.location.pathname}${window.location.search}#recipes`,
      scroll: window.scrollY,
    }))
  } catch { /* Browsing and URL filters also work without session storage. */ }
}

export function getCatalogReturnHref(): string {
  try {
    const saved = JSON.parse(sessionStorage.getItem(catalogPositionKey) ?? "null")
    if (typeof saved?.href === "string") {
      const url = new URL(saved.href, window.location.origin)
      if (url.origin === window.location.origin && url.pathname === "/") return `${url.pathname}${url.search}#recipes`
    }
  } catch { /* Fall back to the complete catalog. */ }
  return "/#recipes"
}
