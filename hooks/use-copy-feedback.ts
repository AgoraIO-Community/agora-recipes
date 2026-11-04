"use client"

import { useEffect, useRef, useState } from "react"

type CopyState = "idle" | "copying" | "copied" | "failed"

/** Clipboard feedback belongs to the content that was copied, including late responses. */
export function useCopyFeedback(text: string, onCopied: () => void) {
  const [result, setResult] = useState<{ text: string; state: CopyState }>({ text, state: "idle" })
  const request = useRef(0)
  const busy = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => { request.current++; busy.current = false; clearTimeout(timer.current) }, [text])
  async function copy() {
    if (busy.current) return
    busy.current = true
    const current = ++request.current
    clearTimeout(timer.current)
    setResult({ text, state: "copying" })
    try {
      await navigator.clipboard.writeText(text)
      if (current !== request.current) return
      onCopied()
      setResult({ text, state: "copied" })
      timer.current = setTimeout(() => setResult({ text, state: "idle" }), 2500)
    } catch {
      if (current === request.current) setResult({ text, state: "failed" })
    } finally {
      if (current === request.current) busy.current = false
    }
  }
  return { state: result.text === text ? result.state : "idle", copy }
}
