"use client"

import { useAnalytics } from "@/components/analytics-provider"
import { useI18n } from "@/components/locale-provider"
import { catalogReturnPath, localePath } from "@/lib/locales"
import { useCatalogSearch } from "@/hooks/use-catalog-location"
import { useCallback, useRef, useState, type ReactNode } from "react"
import { RecipeVideoPlayer } from "@/components/recipe-video-player"
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
  const onError = useCallback(() => setFailed(true), [])
  const onPlay = useCallback(() => {
    if (played.current) return
    played.current = true
    capture("video_play", { action: "play", placement: "player", content_slug: recipe.slug })
  }, [capture, recipe.slug])
  const media = recipe.showcase
  if (!media?.videoUrl) return children

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); setFailed(false); played.current = false }}>
      {children}
      <DialogContent data-recipe-slug={recipe.slug} className="video-preview max-h-[90dvh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader className="pr-8 text-left">
          <DialogTitle className="font-brand text-xl leading-tight">{media.compactTitle ?? media.title}</DialogTitle>
          <DialogDescription>{media.demoNote}</DialogDescription>
        </DialogHeader>
        {open && !failed && (
          <RecipeVideoPlayer key={media.videoUrl} url={media.videoUrl} title={t("Watch {title} demo", { title: media.compactTitle ?? media.title })} poster={media.thumbnail} onPlay={onPlay} onError={onError} />
        )}
        {failed && <div className="recipe-video-error"><p role="alert">{t("This video couldn’t load. You can open the original video or view the project below.")}</p><Button variant="outline" size="sm" onClick={() => setFailed(false)}>{t("Try again")}</Button></div>}
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
