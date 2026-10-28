"use client"

import { useAnalytics } from "@/components/analytics-provider"
import { useI18n } from "@/components/locale-provider"
import { type ReactNode } from "react"
import { useCopyFeedback } from "@/hooks/use-copy-feedback"
import { Check, Copy, LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CopyTextButton({ text, label = "Copy", subject = "Text", primary = false }: { text: string; label?: string; subject?: string; primary?: boolean }) {
  const { t } = useI18n()
  const capture = useAnalytics()
  const { state, copy } = useCopyFeedback(text, () => capture("content_copy", { action: subject === "Recipe prompt" || subject === "Prompt" ? "prompt" : subject === "Markdown" ? "guide" : subject === "Agora CLI" ? "cli_command" : "code", placement: primary ? "hero" : "reader" }))
  return <>
    <Button type="button" variant={primary ? "default" : "ghost"} size={primary ? "default" : "sm"} onClick={copy} aria-disabled={state === "copying"} aria-busy={state === "copying"} className="copy-action" data-copy-state={state} aria-label={t(state === "copied" ? "{subject} copied" : "Copy {subject}", { subject: t(subject) })}>
      <span className="copy-action__icon" aria-hidden="true"><Copy /><Check /><LoaderCircle /></span>
      <span className="copy-action__label"><span aria-hidden={state !== "idle"}>{t(label)}</span><span aria-hidden={state !== "copied"}>{t("Copied")}</span><span aria-hidden={state !== "failed"}>{t("Try copying again")}</span><span aria-hidden={state !== "copying"}>{t("Copying…")}</span></span>
    </Button>
    <span role="status" className={state === "failed" ? "copy-error" : "sr-only"}>{state === "copying" ? t("Copying…") : state === "copied" ? t("{subject} copied to clipboard.", { subject: t(subject) }) : state === "failed" ? t("Copy failed. Select the text and copy it manually.") : ""}</span>
  </>
}

export function CodePanel({ code, label = "Text", wrap = false, children }: { code: string; label?: string; wrap?: boolean; children?: ReactNode }) {
  const { t } = useI18n()
  return <div className={cn("code-block", wrap && "code-block--wrap")}>
    <div className="code-block__header"><span className="code-block__label">{t(label)}</span><CopyTextButton text={code} subject={label} /></div>
    {children || <pre role="group" tabIndex={0} aria-label={t("{label} code", { label: t(label) })}><code>{code}</code></pre>}
  </div>
}
