"use client"

import { useState, useSyncExternalStore } from "react"
import { Check, Copy, Share2 } from "lucide-react"
import { useCopyFeedback } from "@/hooks/use-copy-feedback"
import { IconButton } from "./ui/icon-button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild><IconButton variant="outline" label={state === "copied" ? t("Link copied") : t("Share this page")}>{state === "copied" ? <Check aria-hidden="true" /> : <Share2 aria-hidden="true" />}</IconButton></DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} collisionPadding={16}>
        <DropdownMenuItem disabled={state === "copying"} onSelect={() => { setShareError({ url, message: "" }); void copy() }}><Copy aria-hidden="true" />{t(state === "copying" ? "Copying…" : "Copy link")}</DropdownMenuItem>
        {native && <DropdownMenuItem onSelect={share}><Share2 aria-hidden="true" />{t("Share")}</DropdownMenuItem>}
        <DropdownMenuItem asChild><a href={`https://x.com/intent/tweet?${new URLSearchParams({ text: title, url })}`} target="_blank" rel="noreferrer" aria-label={t("{label} (opens in a new tab)", { label: t("Share on {platform}", { platform: "X" }) })} onClick={() => capture("share_action", { action: "x_open", placement: "sharing" })}>{t("Share on {platform}", { platform: "X" })}</a></DropdownMenuItem>
        <DropdownMenuItem asChild><a href={`https://www.linkedin.com/sharing/share-offsite/?${new URLSearchParams({ url })}`} target="_blank" rel="noreferrer" aria-label={t("{label} (opens in a new tab)", { label: t("Share on {platform}", { platform: "LinkedIn" }) })} onClick={() => capture("share_action", { action: "linkedin_open", placement: "sharing" })}>{t("Share on {platform}", { platform: "LinkedIn" })}</a></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <span role="status" className={failed ? "share-feedback" : "sr-only"}>{status}{failed && <> <a href={url}>{url}</a></>}</span>
  </div>
}
