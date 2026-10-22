"use client"

import { useEffect, useId, useState } from "react"

let renderer: Promise<typeof import("mermaid")["default"]> | undefined
let renderQueue: Promise<unknown> = Promise.resolve()

function getRenderer() {
  renderer ??= import("mermaid").then(({ default: mermaid }) => {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      suppressErrorRendering: true,
      theme: "dark",
      htmlLabels: false,
      secure: ["secure", "securityLevel", "startOnLoad", "maxTextSize", "maxEdges", "suppressErrorRendering", "htmlLabels", "flowchart"],
      flowchart: { htmlLabels: false },
    })
    return mermaid
  })
  return renderer
}

export function MermaidDiagram({ source }: { source: string }) {
  const id = `diagram-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  const [result, setResult] = useState<{ source: string; url?: string; width?: number }>()
  const [actualSize, setActualSize] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function render() {
      try {
        const mermaid = await getRenderer()
        if (cancelled) return
        const job = renderQueue.catch(() => {}).then(async () => {
          mermaid.initialize({
            startOnLoad: false, securityLevel: "strict", suppressErrorRendering: true,
            theme: "base", htmlLabels: false,
            secure: ["secure", "securityLevel", "startOnLoad", "maxTextSize", "maxEdges", "suppressErrorRendering", "htmlLabels", "flowchart", "theme", "themeVariables"],
            flowchart: { htmlLabels: false },
            themeVariables: {
              darkMode: true, fontFamily: 'MiSansLatin, Helvetica Neue, Arial, sans-serif', fontSize: '13px',
              background: '#0a0a0a', primaryColor: '#1a1a1a',
              primaryTextColor: '#fcf9f8', primaryBorderColor: '#626262',
              lineColor: '#b3b3b3', secondaryColor: '#0a1114',
              tertiaryColor: '#0a0a0a', textColor: '#fcf9f8',
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
  }, [id, source])

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
