"use client"

import { useState, useSyncExternalStore } from "react"
import { Copy, Share2, ArrowUpRight } from "lucide-react"
import { Button } from "./ui/button"
import { useI18n } from "./locale-provider"
import { useAnalytics } from "./analytics-provider"

const subscribe = () => () => {}
const hasNativeShare = () => typeof navigator.share === "function"

export function ShareActions({ url, title }: { url: string; title: string }) {
  const { t } = useI18n()
  const capture = useAnalytics()
  const native = useSyncExternalStore(subscribe, hasNativeShare, () => false)
  const [result, setResult] = useState({ url, status: "" })
  const status = result.url === url ? result.status : ""
  async function copy() {
    try { await navigator.clipboard.writeText(url); setResult({ url, status: t("Link copied") }); capture("share_action", { action: "copy_link", placement: "sharing" }) }
    catch { setResult({ url, status: t("Copy failed. Select the link and copy it manually.") }) }
  }
  async function share() {
    capture("share_action", { action: "native_open", placement: "sharing" })
    try { await navigator.share({ title, url }) }
    catch (error) { if (!(error instanceof Error && error.name === "AbortError")) setResult({ url, status: t("Sharing is unavailable. Copy the link instead.") }) }
  }
  return <div className="share-actions" role="group" aria-label={t("Share this page")}>
    <Button variant="ghost" size="sm" onClick={copy}><Copy aria-hidden="true" />{t("Copy link")}</Button>
    {native && <Button variant="ghost" size="sm" onClick={share}><Share2 aria-hidden="true" />{t("Share")}</Button>}
    <Button asChild variant="ghost" size="sm"><a href={`https://x.com/intent/tweet?${new URLSearchParams({ text: title, url })}`} target="_blank" rel="noreferrer" aria-label={t("{label} (opens in a new tab)", { label: t("Share on {platform}", { platform: "X" }) })} onClick={() => capture("share_action", { action: "x_open", placement: "sharing" })}>X<ArrowUpRight aria-hidden="true" /></a></Button>
    <Button asChild variant="ghost" size="sm"><a href={`https://www.linkedin.com/sharing/share-offsite/?${new URLSearchParams({ url })}`} target="_blank" rel="noreferrer" aria-label={t("{label} (opens in a new tab)", { label: t("Share on {platform}", { platform: "LinkedIn" }) })} onClick={() => capture("share_action", { action: "linkedin_open", placement: "sharing" })}>LinkedIn<ArrowUpRight aria-hidden="true" /></a></Button>
    {status && <p role="status" className="recipe-source-note">{status}{status === t("Copy failed. Select the link and copy it manually.") && <> <a href={url}>{url}</a></>}</p>}
  </div>
}
