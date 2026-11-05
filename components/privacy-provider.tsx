"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react"
import { useI18n } from "./locale-provider"
import { Button } from "./ui/button"
import { Switch } from "./ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { analyticsOriginAllowed } from "@/lib/analytics-events"
import { analyticsConsent, type SecuritiConsentApi } from "@/lib/analytics-consent"

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

export function PrivacyProvider({ children, production, productionOrigin }: { children: ReactNode; production: boolean; productionOrigin: string }) {
  const { t } = useI18n()
  const choice = useSyncExternalStore(analyticsConsent.subscribe, analyticsConsent.getSnapshot, () => "pending")
  const [mode, setMode] = useState<"loading" | "local" | "securiti" | "unavailable">("loading")
  const [attempt, setAttempt] = useState(0)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(false)
  const [dismissedError, setDismissedError] = useState(false)
  const chooseLocal = useRef<((enabled: boolean) => void) | undefined>(undefined)
  const api = useRef<SecuritiConsentApi | undefined>(undefined)
  const invoker = useRef<HTMLElement | null>(null)
  const openAgora = useRef(false)
  const banner = useRef<HTMLElement>(null)
  const spacer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const central = production && analyticsOriginAllowed(window.location.href, productionOrigin) && Boolean(tenant || domain)
    if (!central) {
      chooseLocal.current = analyticsConsent.useLocal()
      // Keep setup outside render; an explicit browser choice is the only grant.
      queueMicrotask(() => setMode("local"))
      const changed = () => analyticsConsent.refresh()
      window.addEventListener("storage", changed)
      window.addEventListener("focus", changed)
      document.addEventListener("visibilitychange", changed)
      return () => {
        window.removeEventListener("storage", changed)
        window.removeEventListener("focus", changed)
        document.removeEventListener("visibilitychange", changed)
      }
    }
    analyticsConsent.usePending()
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
    window.addEventListener("focus", changed)
    document.addEventListener("visibilitychange", changed)
    const poll = setInterval(() => { if (!document.hidden) changed() }, 1000)
    return () => {
      active = false
      clearTimeout(timeout)
      clearInterval(poll)
      script?.remove()
      window.removeEventListener("focus", changed)
      document.removeEventListener("visibilitychange", changed)
    }
  }, [production, productionOrigin, attempt])

  const openSettings = useCallback((element: HTMLElement) => {
    invoker.current = element
    setDraft(analyticsConsent.isGranted())
    setOpen(true)
  }, [])
  const showBanner = mode === "local" && choice === "pending" || mode === "unavailable" && !dismissedError
  useEffect(() => {
    if (!showBanner || !banner.current || !spacer.current) return
    const measure = () => { if (spacer.current && banner.current) spacer.current.style.height = `${banner.current.getBoundingClientRect().height}px` }
    const observer = new ResizeObserver(measure)
    observer.observe(banner.current)
    measure()
    return () => observer.disconnect()
  }, [showBanner])
  const policies = <span className="privacy-policy-links"><a href="https://www.agora.io/en/privacy-policy/">{t("Privacy Policy")}</a><a href="https://www.agora.io/en/cookie-policy/">{t("Cookie Policy")}</a></span>
  const description = t("Basic page and search counts are always collected without identifying visitors. You can choose whether to allow optional third-party analytics.")
  return <PrivacyContext.Provider value={openSettings}>
    {children}
    {showBanner && <>
      <div ref={spacer} aria-hidden="true" />
      <section ref={banner} className="privacy-banner" aria-label={t("Privacy choices")}>
        <div className="shell privacy-banner__inner">
          <div><h2>{t(mode === "unavailable" ? "Optional analytics is off" : "Your privacy choices")}</h2><p>{mode === "unavailable" ? t("Agora privacy settings could not load. Optional analytics stays off. Basic page and search counts remain enabled without identifying visitors.") : description} {policies}</p></div>
          <div className="privacy-banner__actions">
            {mode === "local" ? <><Button variant="outline" onClick={() => chooseLocal.current?.(false)}>{t("Reject optional analytics")}</Button><Button variant="outline" onClick={() => chooseLocal.current?.(true)}>{t("Allow optional analytics")}</Button></> : <Button variant="outline" onClick={() => setDismissedError(true)}>{t("Continue browsing")}</Button>}
            <Button variant="ghost" onClick={event => openSettings(event.currentTarget)}>{t("Privacy settings")}</Button>
          </div>
        </div>
      </section>
    </>}
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="privacy-dialog" onCloseAutoFocus={event => {
        event.preventDefault()
        if (openAgora.current) { openAgora.current = false; api.current?.showPreferenceCenter() }
        else {
          const target = invoker.current?.isConnected ? invoker.current : document.querySelector<HTMLElement>(".footer-legal [data-privacy-settings]")
          target?.focus({ preventScroll: true })
        }
      }}>
        <DialogHeader><DialogTitle>{t("Privacy settings")}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>
        <div className="privacy-settings-body">
          <p>{t("Essential preferences keep the site usable and remember your privacy choice. They are always on.")}</p>
          <div className="privacy-setting"><span>{t("Basic counts")}</span><span>{t("Always on")}</span></div>
          {mode === "local" ? <label className="privacy-setting" htmlFor="usage-statistics"><span>{t("Optional analytics")}</span><Switch id="usage-statistics" checked={draft} onCheckedChange={setDraft} /></label> : <p>{mode === "securiti" ? t("Agora's Performance choice controls optional analytics. Changing it can apply across Agora websites. Basic counts stay on.") : mode === "loading" ? t("Loading Agora privacy settings…") : t("Agora privacy settings could not load. Optional analytics stays off. Basic page and search counts remain enabled without identifying visitors.")}</p>}
          {policies}
        </div>
        <DialogFooter>
          {mode === "local" ? <Button onClick={() => { chooseLocal.current?.(draft); setOpen(false) }}>{t("Save preferences")}</Button> : mode === "securiti" ? <Button onClick={() => { openAgora.current = true; setOpen(false) }}>{t("Manage Agora preferences")}</Button> : <Button busy={mode === "loading"} onClick={() => { setMode("loading"); setAttempt(value => value + 1) }}>{t("Retry privacy settings")}</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </PrivacyContext.Provider>
}
