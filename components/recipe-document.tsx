"use client"

import { useI18n } from "@/components/locale-provider"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { ArrowUpRight } from "lucide-react"
import { CopyMarkdownButton } from "@/components/copy-markdown-button"
import { CodePanel } from "@/components/code-panel"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function RecipeDocument({ markdown, children, rawUrl }: { markdown: string; children: ReactNode; rawUrl?: string }) {
  const { t } = useI18n()
  const [selected, setSelected] = useState("guide")
  const guidePanel = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function revealGuide(event: MouseEvent) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]')
      if (!link || !guidePanel.current?.hidden) return
      let target: HTMLElement | null
      try { target = document.getElementById(decodeURIComponent(link.hash.slice(1))) }
      catch { return }
      if (!target || !guidePanel.current.contains(target)) return
      setSelected("guide")
      requestAnimationFrame(() => target.scrollIntoView({ block: "start" }))
    }
    document.addEventListener("click", revealGuide)
    return () => document.removeEventListener("click", revealGuide)
  }, [])
  return <Tabs value={selected} onValueChange={setSelected} className="recipe-document">
    <div className="recipe-document-tabs">
      <TabsList aria-label={t("Recipe format")}><TabsTrigger value="guide">{t("Guide")}</TabsTrigger><TabsTrigger value="markdown">Markdown</TabsTrigger></TabsList>
      <div className="recipe-document-actions">{rawUrl && <Button asChild variant="ghost" size="sm"><a href={rawUrl} target="_blank" rel="noreferrer">Raw<ArrowUpRight aria-hidden="true" /></a></Button>}<CopyMarkdownButton markdown={markdown} /></div>
    </div>
    <TabsContent value="guide" forceMount hidden={selected !== "guide"} ref={guidePanel}>{children}</TabsContent>
    <TabsContent value="markdown" forceMount hidden={selected !== "markdown"}><CodePanel code={markdown} label="Markdown" wrap /></TabsContent>
  </Tabs>
}
