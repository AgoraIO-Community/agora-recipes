"use client"

import { useLayoutEffect, type ReactNode } from "react"
import { catalogPositionKey, rememberCatalogPosition } from "@/hooks/use-catalog-location"

export function DirectoryPosition({ children }: { children: ReactNode }) {
  useLayoutEffect(() => {
    try {
      const href = `${window.location.pathname}${window.location.search}#recipes`
      const saved = JSON.parse(sessionStorage.getItem(catalogPositionKey(href)) ?? "null")
      if (saved?.href === href && Number.isFinite(saved.scroll)) {
        const frame = requestAnimationFrame(() => window.scrollTo({ top: saved.scroll, behavior: "instant" }))
        return () => cancelAnimationFrame(frame)
      }
    } catch { /* The complete directory also works without session storage. */ }
  }, [])
  return <div id="recipes" className="shell recipe-directory" onClickCapture={rememberCatalogPosition} onAuxClickCapture={rememberCatalogPosition}>{children}</div>
}
