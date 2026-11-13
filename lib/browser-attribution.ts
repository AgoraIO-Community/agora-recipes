"use client"

import { analyticsConsent } from "./analytics-consent"
import { attributionStorageKey, createAttributionController, tabPrefix } from "./analytics-attribution"

let controller: ReturnType<typeof createAttributionController> | undefined
let started = false
let entryRecorded = false
const listeners = new Set<() => void>()
const emit = () => { for (const listener of listeners) listener() }

function sync(navigationType?: string) {
  if (!analyticsConsent.isGranted()) {
    // Startup is pending until PrivacyProvider restores the saved choice.
    // Do not erase a previously consented source during that initialization.
    const clear = Boolean(controller) || analyticsConsent.getSnapshot() === "denied"
    controller?.clear()
    controller = undefined
    if (clear) {
      for (const key of [attributionStorageKey, "recipes:utm"]) {
        try { window.sessionStorage.removeItem(key) } catch { /* Privacy choice remains effective in memory. */ }
      }
      try { if (window.name.startsWith(tabPrefix)) window.name = "" } catch { /* Do not alter unrelated window names. */ }
    }
  } else if (!controller) {
    controller = createAttributionController({
      url: window.location.href,
      referrer: document.referrer,
      navigationType: navigationType ?? (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)?.type ?? "navigate",
      restoredFromBFCache: navigationType === "back_forward",
      isGranted: analyticsConsent.isGranted,
      getTabName: () => window.name,
      setTabName: name => { window.name = name },
      read: () => window.sessionStorage.getItem(attributionStorageKey),
      write: value => window.sessionStorage.setItem(attributionStorageKey, value),
      remove: () => window.sessionStorage.removeItem(attributionStorageKey),
      newToken: () => crypto.randomUUID(),
    })
  }
  emit()
}

// React renders only read the cached snapshot. Initialization belongs to effects
// or consented action dispatch, shared by both event and destination consumers.
export const attributionStore = {
  subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener) } },
  getSnapshot: () => analyticsConsent.isGranted() ? controller?.get() : undefined,
  start() {
    if (typeof window === "undefined" || started) return
    started = true
    analyticsConsent.subscribe(() => sync())
    window.addEventListener("pagehide", () => controller?.release())
    window.addEventListener("pageshow", event => { sync(event.persisted ? "back_forward" : undefined); if (event.persisted) controller?.resume(true); emit() })
    sync()
  },
  takeEntry() {
    const entry = controller?.takeEntry()
    if (entryRecorded || !entry) return undefined
    entryRecorded = true
    return entry
  },
}
