"use client"

import { useI18n } from "@/components/locale-provider"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { ArrowUpRight, ChevronDown } from "lucide-react"
import { CopyMarkdownButton } from "@/components/copy-markdown-button"
import { CodePanel } from "@/components/code-panel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IconButton } from "@/components/ui/icon-button"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
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
    {(markdown || languageControl || sourceUrl || rawUrl) && <div className="recipe-document-tabs">
      {markdown && <TabsList variant="segmented" aria-label={t("Recipe format")}><TabsTrigger value="guide">{t("Guide")}</TabsTrigger><TabsTrigger value="markdown">Markdown</TabsTrigger></TabsList>}
      <div className="recipe-document-tools">
        {languageControl}
        {(markdown || sourceUrl || rawUrl) && <ButtonGroup className="recipe-document-actions" aria-label={t("Markdown source")} data-document-raw-url={rawUrl}>
          {markdown && <CopyMarkdownButton markdown={markdown} />}
          {(sourceUrl || rawUrl) && <DropdownMenu>
            <DropdownMenuTrigger asChild>{markdown
              ? <IconButton label={t("Markdown source")} variant="outline" size="icon-sm"><ChevronDown aria-hidden="true" /></IconButton>
              : <Button variant="outline" size="sm">{t("Markdown source")}<ChevronDown aria-hidden="true" /></Button>}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" collisionPadding={16} className="recipe-document-menu">
              <DropdownMenuGroup>
                {sourceUrl && <DropdownMenuItem asChild><a href={sourceUrl} data-material="source" data-placement="reader" target="_blank" rel="noreferrer">{t("View on GitHub")}<ArrowUpRight aria-hidden="true" /></a></DropdownMenuItem>}
                {rawUrl && <DropdownMenuItem asChild><a href={rawUrl} data-material="source" data-placement="reader" target="_blank" rel="noreferrer">{t("Open raw Markdown")}<ArrowUpRight aria-hidden="true" /></a></DropdownMenuItem>}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>}
        </ButtonGroup>}
      </div>
    </div>}
    {markdown ? <>
      <TabsContent value="guide" forceMount hidden={selected !== "guide"} ref={guidePanel}>{children}</TabsContent>
      <TabsContent value="markdown" forceMount hidden={selected !== "markdown"}><CodePanel code={markdown} label="Markdown" wrap copyable={false} /></TabsContent>
    </> : children}
  </Tabs>
}
