"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react"
import { useI18n } from "./locale-provider"
import { Button } from "./ui/button"
import { Checkbox } from "./ui/checkbox"
import { Label } from "./ui/label"
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { analyticsOriginAllowed } from "@/lib/analytics-events"
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
const pendingChoice = () => "pending" as const
const subscribeWithoutTraffic = () => () => {}

export function PrivacyProvider({ children, production, productionOrigin }: { children: ReactNode; production: boolean; productionOrigin: string }) {
  const { t } = useI18n()
  const choice = useSyncExternalStore(analyticsConsent.subscribe, analyticsConsent.getSnapshot, pendingChoice)
  const trafficChoice = useSyncExternalStore(ga4Consent?.subscribe ?? subscribeWithoutTraffic, ga4Consent?.getSnapshot ?? pendingChoice, pendingChoice)
  const [mode, setMode] = useState<"loading" | "local" | "securiti" | "unavailable">("loading")
  const [attempt, setAttempt] = useState(0)
  const [open, setOpen] = useState(false)
  const [productDraft, setProductDraft] = useState<boolean>()
  const [trafficDraft, setTrafficDraft] = useState<boolean>()
  const [dismissedError, setDismissedError] = useState(false)
  const chooseLocal = useRef<((enabled: boolean) => void) | undefined>(undefined)
  const chooseTraffic = useRef<((enabled: boolean) => void) | undefined>(undefined)
  const api = useRef<SecuritiConsentApi | undefined>(undefined)
  const invoker = useRef<HTMLElement | null>(null)
  const openAgora = useRef(false)
  const banner = useRef<HTMLElement>(null)
  const spacer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const changed = () => { analyticsConsent.refresh(); ga4Consent?.refresh() }
    window.addEventListener("storage", changed)
    window.addEventListener("focus", changed)
    document.addEventListener("visibilitychange", changed)
    return () => {
      window.removeEventListener("storage", changed)
      window.removeEventListener("focus", changed)
      document.removeEventListener("visibilitychange", changed)
    }
  }, [])

  useEffect(() => {
    const central = production && analyticsOriginAllowed(window.location.href, productionOrigin) && Boolean(tenant || domain)
    if (!central) {
      chooseLocal.current = analyticsConsent.useLocal()
      chooseTraffic.current = ga4Consent?.useLocal()
      // Keep setup outside render; an explicit browser choice is the only grant.
      queueMicrotask(() => setMode("local"))
      return
    }
    analyticsConsent.usePending()
    ga4Consent?.usePending()
    let active = true
    let script: HTMLScriptElement | undefined
    const failed = () => { if (active) setMode("unavailable") }
    const timeout = setTimeout(failed, 10_000)
    const ready = (value: SecuritiConsentApi) => {
      if (!active) return
      if (![value?.isConsentGiven, value?.getConsent, value?.getCategories, value?.showPreferenceCenter].every(method => typeof method === "function")) { failed(); return }
      clearTimeout(timeout)
      api.current = value
      analyticsConsent.useSecuriti(value)
      chooseTraffic.current = ga4Consent?.useLocal()
      setMode("securiti")
    }
    const changed = () => { if (active) analyticsConsent.refresh() }
    window.SecuritiDataLayer ??= []
    window.SecuritiDataLayer.push(["onConsentGiven", changed])
    if (typeof window.SecuritiSDK?.onReady === "function") window.SecuritiSDK.onReady(ready)
    else if (uuid.test(tenant ?? "") && uuid.test(domain ?? "")) {
      window.SecuritiDataLayer.push(["onReady", ready])
      script = document.createElement("script")
      script.src = "https://cdn-prod.securiti.ai/consent/cookie-consent-sdk-loader.js"
      script.setAttribute("data-tenant-uuid", tenant!)
      script.setAttribute("data-domain-uuid", domain!)
      script.setAttribute("data-backend-url", "https://app.securiti.ai")
      script.setAttribute("data-skip-css", "false")
      script.onerror = failed
      document.head.append(script)
    } else queueMicrotask(failed)
    // Central preferences are shared by Agora subdomains. Recheck a change in
    // another tab on return, as cookies do not emit a storage event.
    const poll = setInterval(() => { if (!document.hidden) changed() }, 1000)
    return () => {
      active = false
      clearTimeout(timeout)
      clearInterval(poll)
      script?.remove()
    }
  }, [production, productionOrigin, attempt])

  const openSettings = useCallback((element: HTMLElement) => {
    invoker.current = element
    setProductDraft(undefined)
    setTrafficDraft(undefined)
    setOpen(true)
  }, [])
  const trafficAvailable = Boolean(ga4Consent) && (mode === "local" || mode === "securiti")
  function chooseAll(enabled: boolean) {
    chooseLocal.current?.(enabled)
    chooseTraffic.current?.(enabled)
  }
  function savePreferences() {
    // Keep untouched decisions live so Save cannot undo another tab's withdrawal.
    if (mode === "local" && (productDraft !== undefined || analyticsConsent.getSnapshot() === "pending")) {
      chooseLocal.current?.(productDraft ?? false)
    }
    if (trafficAvailable && (trafficDraft !== undefined || ga4Consent?.getSnapshot() === "pending")) {
      chooseTraffic.current?.(trafficDraft ?? false)
    }
    setOpen(false)
  }
  function manageAgora() {
    openAgora.current = true
    setOpen(false)
  }
  const showBanner = mode === "local" && choice === "pending" || mode === "unavailable" && !dismissedError
  useEffect(() => {
    if (!showBanner || !banner.current || !spacer.current) return
    const measure = () => { if (spacer.current && banner.current) spacer.current.style.height = `${banner.current.getBoundingClientRect().height}px` }
    const observer = new ResizeObserver(measure)
    observer.observe(banner.current)
    measure()
    return () => observer.disconnect()
  }, [showBanner])
  const policies = <span className="privacy-policy-links">
    <Button asChild wrap variant="link"><a href="https://www.agora.io/en/privacy-policy/">{t("Privacy Policy")}</a></Button>
    <Button asChild wrap variant="link"><a href="https://www.agora.io/en/cookie-policy/">{t("Cookie Policy")}</a></Button>
  </span>
  const description = trafficAvailable
    ? t("We use optional analytics to measure traffic and how Recipes is used.")
    : t("We use optional third-party analytics to understand site usage.")
  const productAnalyticsCopy = <span className="privacy-setting__copy">
    <span id="product-analytics-title">{t("Product analytics")}</span>
    <span id="product-analytics-purpose">{t("Measures searches, filters, and recipe interactions.")}</span>
  </span>
  const trafficAnalyticsCopy = <span className="privacy-setting__copy">
    <span id="traffic-analytics-title">{t("Traffic analytics")}</span>
    <span id="traffic-analytics-purpose">{t("Measures visits and where they come from.")}</span>
  </span>
  return <PrivacyContext.Provider value={openSettings}>
    {children}
    {showBanner && <>
      <div ref={spacer} aria-hidden="true" />
      <section ref={banner} className="privacy-banner" aria-label={t(mode === "unavailable" ? "Privacy settings unavailable" : "Privacy choices")}>
        <div className="shell privacy-banner__inner">
          <p>{mode === "unavailable" ? t("Optional analytics stays off. Please try again.") : description}</p>
          <div className="privacy-banner__actions">
            {mode === "local" ? <div className="privacy-banner__choices" role="group" aria-label={t("Privacy choices")}><Button wrap variant="outline" onClick={() => chooseAll(false)}>{t("Reject")}</Button><Button wrap variant="outline" onClick={() => chooseAll(true)}>{t("Accept")}</Button></div> : <Button wrap variant="outline" onClick={() => setDismissedError(true)}>{t("Continue browsing")}</Button>}
            <Button wrap variant="ghost" aria-haspopup="dialog" onClick={event => openSettings(event.currentTarget)}>{t("Customize")}</Button>
          </div>
        </div>
      </section>
    </>}
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent onCloseAutoFocus={event => {
        event.preventDefault()
        if (openAgora.current) { openAgora.current = false; api.current?.showPreferenceCenter() }
        else {
          const target = invoker.current?.isConnected ? invoker.current : document.querySelector<HTMLElement>(".footer-legal [data-privacy-settings]")
          target?.focus({ preventScroll: true })
        }
      }}>
        <DialogHeader><DialogTitle>{t("Privacy settings")}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>
        <DialogBody><div className="privacy-settings-body">
          <ul className="privacy-settings-list">
            <li>
              <div className="privacy-setting privacy-setting--static">
                <span className="privacy-setting__copy">
                  <span>{t("Anonymous statistics")}</span>
                  <span>{t("Counts page views and common searches without identifying visitors.")}</span>
                </span>
                <span className="privacy-setting__state">{t("Always on")}</span>
              </div>
            </li>
            <li>
              {mode === "local" ? <Label className="facet-option privacy-setting" htmlFor="product-analytics">
                {productAnalyticsCopy}
                <Checkbox id="product-analytics" aria-labelledby="product-analytics-title" aria-describedby="product-analytics-purpose" checked={productDraft ?? (choice === "granted")} onCheckedChange={checked => setProductDraft(checked === true)} />
              </Label> : <div className="privacy-setting privacy-setting--static">
                {productAnalyticsCopy}
                <span className="privacy-setting__state">{mode === "securiti" && trafficAvailable
                  ? <Button wrap variant="link" onClick={manageAgora}>{t("Manage preferences")}</Button>
                  : <span id="product-analytics-state">{mode === "securiti" ? t("Managed by Agora") : mode === "loading" ? t("Loading…") : t("Unavailable")}</span>}
                  {mode === "unavailable" && <Checkbox disabled checked={false} aria-labelledby="product-analytics-title" aria-describedby="product-analytics-purpose product-analytics-state" />}
                </span>
              </div>}
            </li>
            <li>
              {trafficAvailable ? <Label className="facet-option privacy-setting" htmlFor="traffic-analytics">
                {trafficAnalyticsCopy}
                <Checkbox id="traffic-analytics" aria-labelledby="traffic-analytics-title" aria-describedby="traffic-analytics-purpose" checked={trafficDraft ?? (trafficChoice === "granted")} onCheckedChange={checked => setTrafficDraft(checked === true)} />
              </Label> : <div className="privacy-setting privacy-setting--static">
                {trafficAnalyticsCopy}
                <span className="privacy-setting__state">
                  <span id="traffic-analytics-state">{t(ga4Consent ? "Unavailable" : "Not enabled")}</span>
                  <Checkbox disabled checked={false} aria-labelledby="traffic-analytics-title" aria-describedby="traffic-analytics-purpose traffic-analytics-state" />
                </span>
              </div>}
            </li>
          </ul>
          {mode === "securiti" && <p>{t("Product analytics preferences may apply across Agora websites.")}</p>}
          {mode === "unavailable" && <p>{t("Optional analytics stays off. Please try again.")}</p>}
          {policies}
        </div></DialogBody>
        <DialogFooter>
          {mode === "local" || trafficAvailable ? <Button wrap onClick={savePreferences}>{t("Save")}</Button> : mode === "securiti" ? <Button wrap onClick={manageAgora}>{t("Manage preferences")}</Button> : <Button wrap busy={mode === "loading"} onClick={() => { setMode("loading"); setAttempt(value => value + 1) }}>{t("Retry")}</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </PrivacyContext.Provider>
}
