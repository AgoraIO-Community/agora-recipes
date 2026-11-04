"use client"

import { useI18n } from "@/components/locale-provider"
import { useEffect, useId, useState } from "react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/hooks/use-theme"

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
  const { t } = useI18n()
  const theme = useTheme()
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
          const palette = getComputedStyle(document.documentElement)
          const color = (name: string) => palette.getPropertyValue(name).trim()
          mermaid.initialize({
            startOnLoad: false, securityLevel: "strict", suppressErrorRendering: true,
            theme: "base", htmlLabels: false,
            secure: ["secure", "securityLevel", "startOnLoad", "maxTextSize", "maxEdges", "suppressErrorRendering", "htmlLabels", "flowchart", "theme", "themeVariables"],
            flowchart: { htmlLabels: false },
            themeVariables: {
              darkMode: theme === "dark", fontFamily: 'MiSansLatin, Helvetica Neue, Arial, sans-serif', fontSize: '13px',
              background: color('--secondary'), primaryColor: color('--muted'),
              primaryTextColor: color('--foreground'), primaryBorderColor: color('--input'),
              lineColor: color('--muted-foreground'), secondaryColor: color('--card'),
              tertiaryColor: color('--secondary'), textColor: color('--foreground'),
            },
          })
          return mermaid.render(id, source)
        })
        renderQueue = job
        const { svg } = await job
        const svgDocument = new DOMParser().parseFromString(svg, "image/svg+xml")
        const width = Number(svgDocument.documentElement.getAttribute("viewBox")?.split(/\s+/)[2])
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
  }, [id, source, theme])

  const current = result?.source === source ? result : undefined
  return (
    <figure className="my-6 min-w-0" aria-label={t("Recipe diagram")}>
      {current?.url ? (
        <div className="ag-surface-solid overflow-x-auto p-4" role="group" tabIndex={0} aria-label={t("Scrollable diagram")}>
          {/* SVG is displayed as an image so diagram markup cannot execute in the page. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.url} alt={t("Recipe diagram; text description is available in Diagram source below")} style={{ width: current.width, maxWidth: actualSize ? "none" : "100%" }} />
        </div>
      ) : (
        <p role="status" className="text-sm text-muted-foreground">
          {t(current ? "This diagram could not be rendered. Its source is available below." : "Loading diagram…")}
        </p>
      )}
      {current?.url ? (
        <Button variant="ghost" size="sm" className="mt-2" type="button" onClick={() => setActualSize(!actualSize)} aria-pressed={actualSize}>
          {t(actualSize ? "Fit to width" : "View actual size")}
        </Button>
      ) : null}
      <details className="mt-2 text-sm" open={current && !current.url ? true : undefined}>
        <summary className="min-h-[46px] cursor-pointer py-3 text-muted-foreground">{t("Diagram source")}</summary>
        <pre><code>{source}</code></pre>
      </details>
    </figure>
  )
}
