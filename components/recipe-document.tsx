"use client"

import { useI18n } from "@/components/locale-provider"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { BookOpen, FileCode2, Github } from "lucide-react"
import { CopyMarkdownButton } from "@/components/copy-markdown-button"
import { CodePanel } from "@/components/code-panel"
import { Toolbar, ToolbarActions } from "@/components/ui/toolbar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IconButton } from "@/components/ui/icon-button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuGroup, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function RecipeDocument({ markdown, children, rawUrl, sourceUrl, languageControl }: { markdown: string; children: ReactNode; rawUrl?: string; sourceUrl?: string; languageControl?: ReactNode }) {
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
  return <Tabs value={selected} onValueChange={setSelected} className="recipe-document" data-unavailable={!markdown || undefined}>
    {(markdown || languageControl || sourceUrl || rawUrl) && <Toolbar className="recipe-document-tabs" aria-label={t("Implementation guide")}>
      {markdown && <TabsList variant="segmented" aria-label={t("Recipe format")}>
        <Tooltip><TooltipTrigger asChild><TabsTrigger size="icon" value="guide" aria-label={t("Guide")}><BookOpen aria-hidden="true" /></TabsTrigger></TooltipTrigger><TooltipContent>{t("Guide")}</TooltipContent></Tooltip>
        <Tooltip><TooltipTrigger asChild><TabsTrigger size="icon" value="markdown" aria-label="Markdown"><FileCode2 aria-hidden="true" /></TabsTrigger></TooltipTrigger><TooltipContent>Markdown</TooltipContent></Tooltip>
      </TabsList>}
      <ToolbarActions className="recipe-document-tools">
        {languageControl}
        {(markdown || sourceUrl || rawUrl) && <ButtonGroup className="recipe-document-actions" aria-label={t("Markdown source")} data-document-raw-url={rawUrl}>
          {markdown && <CopyMarkdownButton markdown={markdown} />}
          {(sourceUrl || rawUrl) && <DropdownMenu>
            <DropdownMenuTrigger asChild><IconButton label={t("Markdown source")} variant="outline" size="icon-sm"><Github aria-hidden="true" /></IconButton></DropdownMenuTrigger>
            <DropdownMenuContent align="end" collisionPadding={16} className="recipe-document-menu">
              <DropdownMenuGroup>
                {sourceUrl && <DropdownMenuItem asChild><a href={sourceUrl} data-material="source" data-placement="reader" target="_blank" rel="noreferrer">{t("View on GitHub")}</a></DropdownMenuItem>}
                {rawUrl && <DropdownMenuItem asChild><a href={rawUrl} data-material="source" data-placement="reader" target="_blank" rel="noreferrer">{t("Open raw Markdown")}</a></DropdownMenuItem>}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>}
        </ButtonGroup>}
      </ToolbarActions>
    </Toolbar>}
    {markdown ? <>
      <TabsContent value="guide" forceMount hidden={selected !== "guide"} ref={guidePanel}>{children}</TabsContent>
      <TabsContent value="markdown" forceMount hidden={selected !== "markdown"}><CodePanel code={markdown} label="Markdown" wrap copyable={false} /></TabsContent>
    </> : children}
  </Tabs>
}
