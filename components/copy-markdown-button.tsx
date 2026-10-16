"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"

export function CopyMarkdownButton({ markdown }: { markdown: string }) {
  const [copied, setCopied] = React.useState(false)
  const [failed, setFailed] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  React.useEffect(() => () => clearTimeout(timer.current), [])

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown)
      setCopied(true)
      setFailed(false)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      setFailed(true)
    }
  }

  return (
    <><Button
      type="button"
      size="sm"
      variant="ghost"
      onClick={onCopy}
      className="gap-2"
      aria-label={copied ? "Copied markdown" : "Copy markdown"}
    >
      {copied ? (
        <Check className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Copy className="h-4 w-4" aria-hidden="true" />
      )}
      {copied ? "Copied" : "Copy markdown"}
    </Button><span role="status" className="sr-only">{copied ? "Markdown copied to clipboard." : failed ? "Copy failed. Use the Raw tab to select and copy the markdown." : ""}</span></>
  )
}
