"use client"

import { useState, useSyncExternalStore } from "react"
import { Check, Copy, LoaderCircle, Share2, ArrowUpRight } from "lucide-react"
import { useCopyFeedback } from "@/hooks/use-copy-feedback"
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
  const { state, copy } = useCopyFeedback(url, () => capture("share_action", { action: "copy_link", placement: "sharing" }))
  const [shareError, setShareError] = useState({ url, message: "" })
  const status = state === "copied" ? t("Link copied") : state === "failed" ? t("Copy failed. Select the link and copy it manually.") : shareError.url === url ? shareError.message : ""
  const failed = Boolean(status && state !== "copied")
  async function share() {
    setShareError({ url, message: "" })
    capture("share_action", { action: "native_open", placement: "sharing" })
    try { await navigator.share({ title, url }) }
    catch (error) { if (!(error instanceof Error && error.name === "AbortError")) setShareError({ url, message: t("Sharing is unavailable. Copy the link instead.") }) }
  }
  return <div className="share-actions" data-error={failed || undefined} role="group" aria-label={t("Share this page")}>
    <IconButton label={state === "copying" ? t("Copying…") : status && !failed ? status : t("Copy link")} onClick={() => { setShareError({ url, message: "" }); void copy() }} aria-disabled={state === "copying"} aria-busy={state === "copying"} className="copy-action" data-copy-state={state}><span className="copy-action__icon" aria-hidden="true"><Copy /><Check /><LoaderCircle /></span></IconButton>
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
