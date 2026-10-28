"use client"

import { useAnalytics } from "@/components/analytics-provider"
import { useI18n } from "@/components/locale-provider"
import { catalogReturnPath, localePath } from "@/lib/locales"
import { useCatalogSearch } from "@/hooks/use-catalog-location"
import { useRef, useState, type ReactNode } from "react"
import { ArrowUpRight } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { RecipeSummary } from "@/lib/recipe-discovery"

export function RecipeVideoDialog({ recipe, children, detailHref }: { recipe: RecipeSummary; children: ReactNode; detailHref?: string }) {
  const { t, locale } = useI18n()
  const source = new URLSearchParams(useCatalogSearch()).get("returnTo")
  const defaultHref = localePath(`/recipes/${recipe.slug}`, locale) + (source ? `?returnTo=${encodeURIComponent(catalogReturnPath(source, locale))}` : "")
  const capture = useAnalytics()
  const played = useRef(false)
  const [open, setOpen] = useState(false)
  const [failed, setFailed] = useState(false)
  const media = recipe.showcase
  if (!media?.videoUrl) return children

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); setFailed(false); played.current = false }}>
      {children}
      <DialogContent className="video-preview max-h-[90dvh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader className="pr-8 text-left">
          <DialogTitle className="font-brand text-xl leading-tight">{media.compactTitle ?? media.title}</DialogTitle>
          <DialogDescription>{media.demoNote}</DialogDescription>
        </DialogHeader>
        {open && !failed && (
          <video key={media.videoUrl} controls playsInline onPlay={() => { if (!played.current) { played.current = true; capture("video_play", { action: "play", placement: "player", content_slug: recipe.slug }) } }} preload="metadata" poster={media.thumbnail} className="aspect-video w-full rounded-md bg-black" onError={() => setFailed(true)}>
            <source src={media.videoUrl} type="video/mp4" />
            {t("Your browser does not support video playback. Open the original video below.")}
          </video>
        )}
        {failed && <p role="alert" className="rounded-md border p-6 text-sm">{t("This video couldn’t load. You can open the original video or view the project below.")}</p>}
        <div className="video-preview__footer">
          <Button asChild variant="ghost" size="sm"><a href={media.videoUrl} data-material="video_original" data-placement="player" target="_blank" rel="noreferrer">{t("Original video")} <ArrowUpRight aria-hidden="true" /></a></Button>
          <div className="video-preview__actions">
            <Button asChild variant="outline"><a href={detailHref ?? defaultHref}>{t(recipe.recipeUrl ? "Read recipe" : "View project")}</a></Button>
            {recipe.demoUrl && <Button asChild><a href={recipe.demoUrl} data-material="demo" data-placement="player" target="_blank" rel="noreferrer">{t("Try live demo")} <ArrowUpRight aria-hidden="true" /></a></Button>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
