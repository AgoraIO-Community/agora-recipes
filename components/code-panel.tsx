"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { Check, Copy } from "lucide-react"

export function CodePanel({ code, label = "Text", wrap = false, children }: { code: string; label?: string; wrap?: boolean; children?: ReactNode }) {
  const [state,setState] = useState<"idle"|"copied"|"failed">("idle")
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current),[])
  async function copy() {
    clearTimeout(timer.current)
    try { await navigator.clipboard.writeText(code);setState("copied") }
    catch {setState("failed")}
    timer.current=setTimeout(()=>setState("idle"),2000)
  }
  return <div className={`code-block${wrap?" code-block--wrap":""}`}>
    <div className="code-block__header">
      <span className="code-block__label">{label}</span>
      <button type="button" className="code-copy" onClick={copy} aria-label={`Copy ${label.toLowerCase()}`}>
        {state==="copied"?<Check size={16} strokeWidth={1.5} aria-hidden="true"/>:<Copy size={16} strokeWidth={1.5} aria-hidden="true"/>}{state==="copied"?"Copied":"Copy"}
      </button>
    </div>
    {children || <pre role="region" tabIndex={0} aria-label={`${label} code`}><code>{code}</code></pre>}
    <span role="status" className="sr-only">{state==="copied"?`${label} copied to clipboard.`:state==="failed"?"Copy failed. Select the text and copy it manually.":""}</span>
  </div>
}
