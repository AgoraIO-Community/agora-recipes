"use client"

import { useI18n } from "@/components/locale-provider"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { ArrowUpRight, Ellipsis } from "lucide-react"
import { SelectionIndicator } from "@/components/ui/selection-indicator"
import { CopyMarkdownButton } from "@/components/copy-markdown-button"
import { CodePanel } from "@/components/code-panel"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IconButton } from "@/components/ui/icon-button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function RecipeDocument({ markdown, children, rawUrl, sourceUrl, languageControl, sourceNote }: { markdown: string; children: ReactNode; rawUrl?: string; sourceUrl?: string; languageControl?: ReactNode; sourceNote?: string }) {
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
  if (!markdown) return <div className="recipe-document">{children}</div>
  return <Tabs value={selected} onValueChange={setSelected} className="recipe-document">
    <div className="recipe-document-tabs">
      <TabsList className="ag-selection-group" data-appearance="underline" aria-label={t("Recipe format")}><SelectionIndicator value={selected} appearance="underline" /><TabsTrigger value="guide">{t("Guide")}</TabsTrigger><TabsTrigger value="markdown">Markdown</TabsTrigger></TabsList>
      <div className="recipe-document-actions">
        {languageControl}
        {rawUrl && <Button asChild variant="ghost" size="sm"><a href={rawUrl} data-material="source" data-placement="reader" target="_blank" rel="noreferrer">Raw<ArrowUpRight aria-hidden="true" /></a></Button>}
        <CopyMarkdownButton markdown={markdown} />
        {sourceUrl && <DropdownMenu>
          <DropdownMenuTrigger asChild><IconButton label={t("Guide options")} size="icon-sm"><Ellipsis aria-hidden="true" /></IconButton></DropdownMenuTrigger>
          <DropdownMenuContent align="end" collisionPadding={16} className="recipe-document-menu">
            <DropdownMenuItem asChild><a href={sourceUrl} data-material="source" data-placement="reader" target="_blank" rel="noreferrer">{t("View on GitHub")}<ArrowUpRight aria-hidden="true" /></a></DropdownMenuItem>
            <DropdownMenuSeparator />
            {sourceNote && <DropdownMenuLabel className="recipe-document-note">{sourceNote}</DropdownMenuLabel>}
            <DropdownMenuLabel className="recipe-document-note">{t("Shown as published by its author; website language does not translate the source guide.")}</DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>}
      </div>
    </div>
    <TabsContent value="guide" forceMount hidden={selected !== "guide"} ref={guidePanel}>{children}</TabsContent>
    <TabsContent value="markdown" forceMount hidden={selected !== "markdown"}><CodePanel code={markdown} label="Markdown" wrap copyable={false} /></TabsContent>
  </Tabs>
}
