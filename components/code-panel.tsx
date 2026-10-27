"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CopyTextButton({ text, label = "Copy", subject = "Text", primary = false }: { text: string; label?: string; subject?: string; primary?: boolean }) {
  const [result, setResult] = useState<{ text: string; status: "idle" | "copied" | "failed" }>({ text, status: "idle" })
  const state = result.text === text ? result.status : "idle"
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const request = useRef(0)
  useEffect(() => () => { request.current++; clearTimeout(timer.current) }, [text])
  async function copy() {
    const current = ++request.current
    clearTimeout(timer.current)
    let status: "copied" | "failed"
    try { await navigator.clipboard.writeText(text); status = "copied" }
    catch { status = "failed" }
    if (current !== request.current) return
    setResult({ text, status })
    timer.current = setTimeout(() => setResult({ text, status: "idle" }), 2500)
  }
  return <>
    <Button type="button" variant={primary ? "default" : "ghost"} size={primary ? "default" : "sm"} onClick={copy} className="copy-action" data-copy-state={state} aria-label={state === "copied" ? `${subject} copied` : `Copy ${subject.toLowerCase()}`}>
      <span className="copy-action__icon" aria-hidden="true"><Copy /><Check /></span>
      <span className="copy-action__label"><span aria-hidden={state !== "idle"}>{label}</span><span aria-hidden={state !== "copied"}>Copied</span><span aria-hidden={state !== "failed"}>Copy failed</span></span>
    </Button>
    <span role="status" className="sr-only">{state === "copied" ? `${subject} copied to clipboard.` : state === "failed" ? "Copy failed. Select the text and copy it manually." : ""}</span>
  </>
}

export function CodePanel({ code, label = "Text", wrap = false, children }: { code: string; label?: string; wrap?: boolean; children?: ReactNode }) {
  return <div className={cn("code-block", wrap && "code-block--wrap")}>
    <div className="code-block__header"><span className="code-block__label">{label}</span><CopyTextButton text={code} subject={label} /></div>
    {children || <pre role="group" tabIndex={0} aria-label={`${label} code`}><code>{code}</code></pre>}
  </div>
}
