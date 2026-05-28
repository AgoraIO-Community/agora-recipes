"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"

export function CopyMarkdownButton({ markdown }: { markdown: string }) {
  const [copied, setCopied] = React.useState(false)

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard access can be blocked by browser settings.
    }
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
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
    </Button>
  )
}
