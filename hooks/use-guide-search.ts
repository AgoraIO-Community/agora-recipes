"use client"

import { useCallback, useEffect, useState } from "react"
import type { GuideSearchDocuments } from "@/lib/search-documents"

let request: Promise<GuideSearchDocuments> | undefined
function loadDocuments() {
  if (request) return request
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8_000)
  request = fetch("/search-index.json", { signal: controller.signal, referrerPolicy: "no-referrer" }).then(async response => {
    if (!response.ok) throw new Error("Guide search asset is unavailable")
    const data: unknown = await response.json()
    if (!data || typeof data !== "object" || !("version" in data) || data.version !== 1 || !("documents" in data) || !data.documents || typeof data.documents !== "object" || Object.values(data.documents).some(value => typeof value !== "string")) throw new Error("Invalid guide search asset")
    return data.documents as GuideSearchDocuments
  }).catch(error => { request = undefined; throw error }).finally(() => clearTimeout(timeout))
  return request
}

export function useGuideSearch(query: string) {
  const [requested, setRequested] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<{ documents?: GuideSearchDocuments; error?: boolean; attempt: number }>({ attempt: -1 })
  const preload = useCallback(() => setRequested(true), [])
  const retry = useCallback(() => { setRequested(true); setAttempt(value => value + 1) }, [])
  const shouldLoad = requested || Boolean(query.trim())
  useEffect(() => {
    if (!shouldLoad) return
    let cancelled = false
    void loadDocuments().then(documents => { if (!cancelled) setResult({ documents, attempt }) }).catch(() => { if (!cancelled) setResult({ error: true, attempt }) })
    return () => { cancelled = true }
  }, [shouldLoad, attempt])
  const status = !shouldLoad ? "idle" : result.attempt !== attempt ? "loading" : result.error ? "error" : "ready"
  return { documents: result.documents, status, preload, retry }
}
