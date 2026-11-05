"use client"

import { createContext, useCallback, useContext, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react"
import { useI18n } from "./locale-provider"
import { Button } from "./ui/button"
import { ButtonGroup } from "./ui/button-group"
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
  const description = t("We use optional third-party analytics to understand site usage.")
  return <PrivacyContext.Provider value={openSettings}>
    {children}
    {showBanner && <>
      <div ref={spacer} aria-hidden="true" />
      <section ref={banner} className="privacy-banner" aria-label={t("Privacy choices")}>
        <div className="shell privacy-banner__inner">
          <div><h2>{t(mode === "unavailable" ? "Privacy settings unavailable" : "Your privacy choices")}</h2><p>{mode === "unavailable" ? t("Optional analytics stays off. Please try again.") : description} {policies}</p></div>
          <div className="privacy-banner__actions">
            {mode === "local" ? <ButtonGroup className="privacy-banner__choices" aria-label={t("Privacy choices")}><Button variant="outline" onClick={() => chooseLocal.current?.(false)}>{t("Reject")}</Button><Button variant="outline" onClick={() => chooseLocal.current?.(true)}>{t("Accept")}</Button></ButtonGroup> : <Button variant="outline" onClick={() => setDismissedError(true)}>{t("Continue browsing")}</Button>}
            <Button variant="ghost" aria-haspopup="dialog" onClick={event => openSettings(event.currentTarget)}>{t("Customize")}</Button>
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
          <div className="privacy-setting"><span>{t("Anonymous statistics")}</span><span>{t("Always on")}</span></div>
          {mode === "local" ? <label className="privacy-setting" htmlFor="usage-statistics"><span>{t("Optional analytics")}</span><Switch id="usage-statistics" checked={draft} onCheckedChange={setDraft} /></label> : <p>{mode === "securiti" ? t("Your preferences may apply across Agora websites.") : mode === "loading" ? t("Loading Agora privacy settings…") : t("Optional analytics stays off. Please try again.")}</p>}
          {policies}
        </div>
        <DialogFooter>
          {mode === "local" ? <Button onClick={() => { chooseLocal.current?.(draft); setOpen(false) }}>{t("Save")}</Button> : mode === "securiti" ? <Button onClick={() => { openAgora.current = true; setOpen(false) }}>{t("Manage preferences")}</Button> : <Button busy={mode === "loading"} onClick={() => { setMode("loading"); setAttempt(value => value + 1) }}>{t("Retry")}</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </PrivacyContext.Provider>
}
