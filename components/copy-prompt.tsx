"use client"

import * as React from "react"
import { Check, Copy, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CopyPrompt({ rawUrl }: { rawUrl: string }) {
  const prompt = `Read the Agent.md at ${rawUrl} and follow it to scaffold this recipe in my project.`
  const [copied, setCopied] = React.useState(false)

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard might be blocked; fall back to selecting text.
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-border bg-muted/40">
        <div className="flex items-center gap-2 text-xs font-medium">
          <Wand2 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          <span>Use with any AI agent</span>
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onCopy}
          className="h-7 gap-1.5 text-xs"
          aria-label={copied ? "Copied prompt" : "Copy prompt"}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              Copy
            </>
          )}
        </Button>
      </div>
      <pre
        className={cn(
          "px-4 py-3 text-xs sm:text-sm font-mono leading-relaxed",
          "text-foreground/90 whitespace-pre-wrap break-words",
          "selection:bg-primary/30",
        )}
      >
        <code>{prompt}</code>
      </pre>
    </div>
  )
}
