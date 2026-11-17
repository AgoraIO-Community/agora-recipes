"use client"

import { AttributionLink } from "@/components/attribution-link"
import { useAnalytics } from "@/components/analytics-provider"
import { useI18n } from "@/components/locale-provider"
import { catalogReturnPath, localePath } from "@/lib/locales"
import { useCatalogSearch } from "@/hooks/use-catalog-location"
import { useCallback, useRef, useState, type ReactNode } from "react"
import { RecipeVideoPlayer } from "@/components/recipe-video-player"
import { BookOpen, ExternalLink, MonitorPlay } from "lucide-react"
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { IconButton } from "@/components/ui/icon-button"
import { ButtonGroup } from "@/components/ui/button-group"
import type { RecipeSummary } from "@/lib/recipe-discovery"

export function RecipeVideoDialog({ recipe, children, detailHref }: { recipe: RecipeSummary; children: ReactNode; detailHref?: string }) {
  const { t, locale } = useI18n()
  const source = new URLSearchParams(useCatalogSearch()).get("returnTo")
  const defaultHref = localePath(`/recipes/${recipe.slug}`, locale) + (source ? `?returnTo=${encodeURIComponent(catalogReturnPath(source, locale))}` : "")
  const capture = useAnalytics()
  const played = useRef(false)
  const [open, setOpen] = useState(false)
  const [failed, setFailed] = useState(false)
  const onError = useCallback(() => { if (open) setFailed(true) }, [open])
  const onPlay = useCallback(() => {
    if (!open || played.current) return
    played.current = true
    capture("video_play", { action: "play", placement: "player", content_slug: recipe.slug })
  }, [capture, recipe.slug, open])
  const media = recipe.showcase
  if (!media?.videoUrl) return children

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (next) { setFailed(false); played.current = false } }}>
      {children}
      <DialogContent data-recipe-slug={recipe.slug} className="video-preview sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{media.compactTitle ?? media.title}</DialogTitle>
          <DialogDescription>{media.demoNote}</DialogDescription>
        </DialogHeader>
        <DialogBody>
        {/* The portal owns exit teardown; active stops playback while preserving the player frame. */}
        {!failed && (
          <RecipeVideoPlayer key={media.videoUrl} active={open} url={media.videoUrl} title={t("Watch {title} demo", { title: media.compactTitle ?? media.title })} poster={media.thumbnail} onPlay={onPlay} onError={onError} />
        )}
        {failed && <Alert variant="destructive"><AlertDescription><p>{t("The video couldn’t load.")}</p><Button variant="outline" size="sm" onClick={() => setFailed(false)}>{t("Try again")}</Button></AlertDescription></Alert>}
        </DialogBody>
        <DialogFooter className="video-preview__footer">
          <ButtonGroup className="video-preview__actions" aria-label={t("Available materials")}>
            {recipe.demoUrl && <IconButton asChild variant="outline" label={t("Try live demo")}><AttributionLink href={recipe.demoUrl} data-material="demo" data-placement="player" target="_blank" rel="noreferrer"><MonitorPlay aria-hidden="true" /></AttributionLink></IconButton>}
            <IconButton asChild variant="outline" label={t(recipe.recipeUrl ? "Read recipe" : "View project")}><a href={detailHref ?? defaultHref}><BookOpen aria-hidden="true" /></a></IconButton>
            <IconButton asChild variant="outline" label={t("Original video")}><a href={media.videoUrl} data-material="video_original" data-placement="player" target="_blank" rel="noreferrer"><ExternalLink aria-hidden="true" /></a></IconButton>
          </ButtonGroup>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
