"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import { useI18n } from "./locale-provider"
import { Button } from "./ui/button"
import { analyticsConsent, ga4Consent, type SecuritiConsentApi } from "@/lib/analytics-consent"

type SecuritiEvent = [string, (api: SecuritiConsentApi) => void]
declare global {
  interface Window {
    SecuritiDataLayer?: SecuritiEvent[]
    SecuritiSDK?: { onReady(callback: (api: SecuritiConsentApi) => void): void }
  }
}
const PrivacyContext = createContext<(invoker: HTMLElement) => void>(() => {})
export const usePrivacySettings = () => useContext(PrivacyContext)
const tenant = process.env.NEXT_PUBLIC_SECURITI_TENANT_ID?.trim()
const domain = process.env.NEXT_PUBLIC_SECURITI_DOMAIN_ID?.trim()
const uuid = /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n()
  const [attempt, setAttempt] = useState(0)
  const [failed, setFailed] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const api = useRef<SecuritiConsentApi | undefined>(undefined)
  const invoker = useRef<HTMLElement | null>(null)
  const openRequested = useRef(false)
  const banner = useRef<HTMLElement>(null)
  const spacer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Development and production use the same CMP and UI. Analytics delivery
    // retains its separate production/origin gates in AnalyticsProvider.
    analyticsConsent.usePending()
    ga4Consent?.usePending()
    api.current = undefined
    let active = true
    let script: HTMLScriptElement | undefined
    const unavailable = () => {
      if (!active) return
      analyticsConsent.usePending()
      ga4Consent?.usePending()
      setFailed(true)
    }
    const timeout = setTimeout(unavailable, 10_000)
    const ready = (value: SecuritiConsentApi) => {
      if (!active) return
      if (![value?.isConsentGiven, value?.getConsent, value?.getCategories, value?.showPreferenceCenter].every(method => typeof method === "function")) { unavailable(); return }
      clearTimeout(timeout)
      api.current = value
      analyticsConsent.useSecuriti(value)
      ga4Consent?.useSecuriti(value)
      setFailed(false)
      if (openRequested.current) { openRequested.current = false; value.showPreferenceCenter() }
    }
    const changed = () => {
      if (!active) return
      analyticsConsent.refresh()
      ga4Consent?.refresh()
    }
    window.SecuritiDataLayer ??= []
    const onConsent: SecuritiEvent = ["onConsentGiven", changed]
    const onReady: SecuritiEvent = ["onReady", ready]
    // The namespace can exist before the SDK is ready. Keep an array-based
    // readiness subscription as well as checking an already initialized SDK.
    window.SecuritiDataLayer.push(onConsent, onReady)
    if (typeof window.SecuritiSDK?.onReady === "function") window.SecuritiSDK.onReady(ready)
    else if (uuid.test(tenant ?? "") && uuid.test(domain ?? "")) {
      script = document.createElement("script")
      script.src = "https://cdn-prod.securiti.ai/consent/cookie-consent-sdk-loader.js"
      script.setAttribute("data-tenant-uuid", tenant!)
      script.setAttribute("data-domain-uuid", domain!)
      script.setAttribute("data-backend-url", "https://app.securiti.ai")
      script.setAttribute("data-skip-css", "false")
      script.onerror = unavailable
      document.head.append(script)
    } else {
      clearTimeout(timeout)
      // No alternate consent manager when a local environment lacks CMP config.
      queueMicrotask(() => { if (active && openRequested.current) unavailable() })
    }
    // Managed cookies can change in another Agora tab without a storage event.
    const poll = setInterval(() => { if (!document.hidden) changed() }, 1000)
    window.addEventListener("focus", changed)
    document.addEventListener("visibilitychange", changed)
    return () => {
      active = false
      clearTimeout(timeout)
      clearInterval(poll)
      window.removeEventListener("focus", changed)
      document.removeEventListener("visibilitychange", changed)
      // The SDK owns and instruments this queue after loading. Leave registered
      // entries in place; inactive callbacks cannot change application state.
      script?.remove()
    }
  }, [attempt])

  const openSettings = useCallback((element: HTMLElement) => {
    invoker.current = element
    setDismissed(false)
    if (api.current) api.current.showPreferenceCenter()
    else {
      openRequested.current = true
      if (!uuid.test(tenant ?? "") || !uuid.test(domain ?? "")) setFailed(true)
    }
  }, [])

  useEffect(() => {
    // Reserve the real managed notice's height, including late SDK insertion.
    const observer = new MutationObserver(() => measure())
    const resize = new ResizeObserver(() => measure())
    let managed: HTMLElement | null = null
    let preferencesVisible = false
    if (banner.current) resize.observe(banner.current)
    function measure() {
      const next = document.querySelector<HTMLElement>(".cc-window.f-cc-pref-window")
      if (next !== managed) {
        if (managed) resize.unobserve(managed)
        managed = next
        if (managed) resize.observe(managed)
      }
      const managedHeight = managed && getComputedStyle(managed).visibility !== "hidden" && !managed.classList.contains("cc-invisible") ? managed.getBoundingClientRect().height : 0
      const errorHeight = banner.current?.getBoundingClientRect().height ?? 0
      const preferences = document.getElementById("cookiePreferencesDialog")
      const visible = Boolean(preferences?.getClientRects().length && getComputedStyle(preferences).visibility !== "hidden")
      if (preferencesVisible && !visible && invoker.current?.isConnected) {
        invoker.current.focus({ preventScroll: true })
        invoker.current = null
      }
      preferencesVisible = visible
      if (spacer.current) {
        const height = `${Math.max(managedHeight, errorHeight)}px`
        if (spacer.current.style.height !== height) spacer.current.style.height = height
      }
    }
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style"] })
    measure()
    return () => { observer.disconnect(); resize.disconnect() }
  }, [failed, dismissed])

  return <PrivacyContext.Provider value={openSettings}>
    {children}
    <div ref={spacer} className="privacy-notice-spacer" aria-hidden="true" />
    {failed && !dismissed && <section ref={banner} className="privacy-banner" aria-label={t("Privacy settings unavailable")}>
      <div className="shell privacy-banner__inner">
        <p role="status">{t("Optional analytics stays off. Please try again.")}</p>
        <div className="privacy-banner__actions">
          <Button wrap variant="outline" onClick={() => setDismissed(true)}>{t("Continue browsing")}</Button>
          <Button wrap variant="outline" onClick={() => { setFailed(false); setAttempt(value => value + 1) }}>{t("Retry")}</Button>
        </div>
      </div>
    </section>}
  </PrivacyContext.Provider>
}
