"use client"

import { useState } from "react"
import { Check, Copy, Download } from "lucide-react"

type Props = {
  content: string
  filename?: string
}

export function AgentMdActions({ content, filename = "Agent.md" }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("[v0] Failed to copy Agent.md:", err)
    }
  }

  function handleDownload() {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "Agent.md copied to clipboard" : "Copy Agent.md to clipboard"}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
      >
        {copied ? (
          <>
            <Check className="h-3 w-3 text-primary" aria-hidden="true" />
            copied
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" aria-hidden="true" />
            copy
          </>
        )}
      </button>
      <button
        type="button"
        onClick={handleDownload}
        aria-label="Download Agent.md file"
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
      >
        <Download className="h-3 w-3" aria-hidden="true" />
        download
      </button>
    </div>
  )
}
