"use client"

import { useEffect, useId, useState } from "react"
import { useSystemTheme } from "@/components/theme-provider"

let renderer: Promise<typeof import("mermaid")["default"]> | undefined
let renderQueue: Promise<unknown> = Promise.resolve()

function getRenderer() {
  renderer ??= import("mermaid").then(({ default: mermaid }) => {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      suppressErrorRendering: true,
      theme: "default",
      htmlLabels: false,
      secure: ["secure", "securityLevel", "startOnLoad", "maxTextSize", "maxEdges", "suppressErrorRendering", "htmlLabels", "flowchart"],
      flowchart: { htmlLabels: false },
    })
    return mermaid
  })
  return renderer
}

export function MermaidDiagram({ source }: { source: string }) {
  const resolvedTheme = useSystemTheme()
  const id = `diagram-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  const [result, setResult] = useState<{ source: string; url?: string; width?: number }>()
  const [actualSize, setActualSize] = useState(false)

  useEffect(() => {
    if (!resolvedTheme) return
    let cancelled = false
    async function render() {
      try {
        const mermaid = await getRenderer()
        if (cancelled) return
        const dark = resolvedTheme === "dark"
        const job = renderQueue.catch(() => {}).then(async () => {
          mermaid.initialize({
            startOnLoad: false, securityLevel: "strict", suppressErrorRendering: true,
            theme: "base", htmlLabels: false,
            secure: ["secure", "securityLevel", "startOnLoad", "maxTextSize", "maxEdges", "suppressErrorRendering", "htmlLabels", "flowchart", "theme", "themeVariables"],
            flowchart: { htmlLabels: false },
            themeVariables: {
              darkMode: dark, fontFamily: 'MiSansLatin, Helvetica Neue, Arial, sans-serif', fontSize: '13px',
              background: dark ? '#0a0a0a' : '#f1f0f0', primaryColor: dark ? '#1a1a1a' : '#f0f1f3',
              primaryTextColor: dark ? '#fcf9f8' : '#0f0f0f', primaryBorderColor: dark ? '#626262' : '#8a8a8a',
              lineColor: dark ? '#b3b3b3' : '#626262', secondaryColor: dark ? '#0a1114' : '#f2f7f8',
              tertiaryColor: dark ? '#0a0a0a' : '#fcf9f8', textColor: dark ? '#fcf9f8' : '#0f0f0f',
            },
          })
          return mermaid.render(id, source)
        })
        renderQueue = job
        const { svg } = await job
        const document = new DOMParser().parseFromString(svg, "image/svg+xml")
        const width = Number(document.documentElement.getAttribute("viewBox")?.split(/\s+/)[2])
        if (!cancelled) {
          setResult({
            source,
            url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
            width: Number.isFinite(width) && width > 0 ? Math.ceil(width) : 640,
          })
        }
      } catch {
        if (!cancelled) setResult({ source })
      }
    }
    void render()
    return () => { cancelled = true }
  }, [id, source, resolvedTheme])

  const current = result?.source === source ? result : undefined
  return (
    <figure className="my-6 min-w-0" aria-label="Recipe diagram">
      {current?.url ? (
        <div className="overflow-x-auto rounded-[2px] border border-border bg-secondary p-4" tabIndex={0} aria-label="Scrollable diagram">
          {/* SVG is displayed as an image so diagram markup cannot execute in the page. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.url} alt="Recipe diagram; text description is available in Diagram source below" style={{ width: current.width, maxWidth: actualSize ? "none" : "100%" }} />
        </div>
      ) : (
        <p role="status" className="text-sm text-muted-foreground">
          {current ? "This diagram could not be rendered. Its source is available below." : "Loading diagram…"}
        </p>
      )}
      {current?.url ? (
        <button type="button" onClick={() => setActualSize(!actualSize)} aria-pressed={actualSize} className="text-action underline underline-offset-4">
          {actualSize ? "Fit to width" : "View actual size"}
        </button>
      ) : null}
      <details className="mt-2 text-sm" open={current && !current.url ? true : undefined}>
        <summary className="min-h-[46px] cursor-pointer py-3 text-muted-foreground">Diagram source</summary>
        <pre><code>{source}</code></pre>
      </details>
    </figure>
  )
}
