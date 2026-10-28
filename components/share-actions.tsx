"use client"

import { useState, useSyncExternalStore } from "react"
import { Check, Copy, Share2, ArrowUpRight } from "lucide-react"
import { IconButton } from "./ui/icon-button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { useI18n } from "./locale-provider"
import { useAnalytics } from "./analytics-provider"

const subscribe = () => () => {}
const hasNativeShare = () => typeof navigator.share === "function"

export function ShareActions({ url, title }: { url: string; title: string }) {
  const { t } = useI18n()
  const capture = useAnalytics()
  const native = useSyncExternalStore(subscribe, hasNativeShare, () => false)
  const [result, setResult] = useState({ url, status: "", error: false })
  const status = result.url === url ? result.status : ""
  const failed = Boolean(status && result.error)
  async function copy() {
    try { await navigator.clipboard.writeText(url); setResult({ url, status: t("Link copied"), error: false }); capture("share_action", { action: "copy_link", placement: "sharing" }) }
    catch { setResult({ url, status: t("Copy failed. Select the link and copy it manually."), error: true }) }
  }
  async function share() {
    capture("share_action", { action: "native_open", placement: "sharing" })
    try { await navigator.share({ title, url }) }
    catch (error) { if (!(error instanceof Error && error.name === "AbortError")) setResult({ url, status: t("Sharing is unavailable. Copy the link instead."), error: true }) }
  }
  return <div className="share-actions" data-error={failed || undefined} role="group" aria-label={t("Share this page")}>
    <IconButton label={status && !failed ? status : t("Copy link")} onClick={copy}>{status && !failed ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}</IconButton>
    <DropdownMenu>
      <DropdownMenuTrigger asChild><IconButton label={t("Share this page")}><Share2 aria-hidden="true" /></IconButton></DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} collisionPadding={16}>
        <DropdownMenuLabel>{t("Share this page")}</DropdownMenuLabel>
        {native && <DropdownMenuItem onSelect={share}><Share2 aria-hidden="true" />{t("Share")}</DropdownMenuItem>}
        <DropdownMenuItem asChild><a href={`https://x.com/intent/tweet?${new URLSearchParams({ text: title, url })}`} target="_blank" rel="noreferrer" aria-label={t("{label} (opens in a new tab)", { label: t("Share on {platform}", { platform: "X" }) })} onClick={() => capture("share_action", { action: "x_open", placement: "sharing" })}>{t("Share on {platform}", { platform: "X" })}<ArrowUpRight aria-hidden="true" /></a></DropdownMenuItem>
        <DropdownMenuItem asChild><a href={`https://www.linkedin.com/sharing/share-offsite/?${new URLSearchParams({ url })}`} target="_blank" rel="noreferrer" aria-label={t("{label} (opens in a new tab)", { label: t("Share on {platform}", { platform: "LinkedIn" }) })} onClick={() => capture("share_action", { action: "linkedin_open", placement: "sharing" })}>{t("Share on {platform}", { platform: "LinkedIn" })}<ArrowUpRight aria-hidden="true" /></a></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <span role="status" className={failed ? "share-feedback" : "sr-only"}>{status}{failed && <> <a href={url}>{url}</a></>}</span>
  </div>
}
