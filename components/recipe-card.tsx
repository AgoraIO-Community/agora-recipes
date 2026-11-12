"use client"

import { useI18n } from "@/components/locale-provider"
import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react"
import Link from "next/link"
import { Play } from "lucide-react"
import { DialogTrigger } from "@/components/ui/dialog"
import { RecipeVideoDialog } from "@/components/recipe-video-dialog"
import { RecipeAuthor } from "@/components/recipe-author"
import { RecipeCoverImage } from "@/components/recipe-cover-image"
import { GlassSurface } from "@/components/design-system/glass-surface"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/ui/icon-button"
import { ButtonGroup } from "@/components/ui/button-group"
import type { RecipeSummary } from "@/lib/recipe-discovery"
import { localePath } from "@/lib/locales"
import { cn } from "@/lib/utils"
import { videoSource } from "@/lib/video"

function prefersExplicitPlayback() {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  return connection?.saveData === true || window.matchMedia("(prefers-reduced-motion: reduce), (prefers-reduced-data: reduce)").matches
}

function RecipeCover({ recipe, title, href }: { recipe: RecipeSummary; title: string; href: string }) {
  const { t } = useI18n()
  const [preview, setPreview] = useState(false)
  const [playing, setPlaying] = useState(false)
  const video = useRef<HTMLVideoElement>(null)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const hovered = useRef(false)
  const media = recipe.showcase
  const source = media?.videoUrl ? videoSource(media.videoUrl) : undefined
  const videoUrl = source?.kind === "file" ? source.url : undefined
  const stopPreview = useCallback(() => {
    hovered.current = false
    clearTimeout(hoverTimer.current)
    video.current?.pause()
    setPreview(false)
    setPlaying(false)
  }, [])

  useEffect(() => {
    if (!videoUrl) return
    const visibility = () => { if (document.hidden) stopPreview() }
    document.addEventListener("visibilitychange", visibility)
    return () => {
      hovered.current = false
      clearTimeout(hoverTimer.current)
      document.removeEventListener("visibilitychange", visibility)
    }
  }, [videoUrl, stopPreview])

  useEffect(() => {
    const player = video.current
    if (!preview || !player) return
    player.muted = true
    return () => {
      player.pause()
      player.removeAttribute("src")
      player.load()
    }
  }, [preview, videoUrl])

  function startPreview(event: PointerEvent<HTMLDivElement>) {
    if (hovered.current || !videoUrl || event.pointerType !== "mouse" || !window.matchMedia("(hover: hover) and (pointer: fine)").matches || prefersExplicitPlayback()) return
    hovered.current = true
    setPreview(true)
    clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => {
      const player = video.current
      if (!hovered.current || !player) return
      if (prefersExplicitPlayback()) { stopPreview(); return }
      void player.play().catch(() => { if (hovered.current && video.current === player) stopPreview() })
    }, 2000)
  }
  if (!media) return null
  const cover = <div className="recipe-cover" data-preview={playing ? "playing" : preview ? "loading" : undefined} style={{ "--thumbnail-scale": media.thumbnailScale ?? 1, "--thumbnail-origin": media.thumbnailOrigin ?? "50% 50%" } as CSSProperties}>
    <RecipeCoverImage recipe={recipe} loading={recipe.recommendedOrder !== undefined ? "eager" : "lazy"} className="recipe-cover__image" />
    {preview && videoUrl && <video ref={video} src={videoUrl} className="recipe-cover__video" muted loop playsInline preload="metadata" aria-hidden="true" onPlaying={() => { if (hovered.current) setPlaying(true) }} onError={stopPreview} />}
    {media.videoUrl && <Badge className="recipe-cover__label ag-overlay">{media.videoDuration || t("Video")}</Badge>}
  </div>
  return <div className="recipe-cover-frame" onPointerEnter={startPreview} onPointerLeave={stopPreview} onPointerDown={stopPreview} onClick={stopPreview}>
    {recipe.demoUrl ? <a href={recipe.demoUrl} className="recipe-cover-link" data-material="demo" target="_blank" rel="noreferrer" aria-label={t("Try {title} demo (opens in a new tab)", { title })}>{cover}</a> : <Link prefetch={false} href={href} className="recipe-cover-link" aria-label={t("Open {title} recipe", { title })}>{cover}</Link>}
    {media.videoUrl && <DialogTrigger asChild><button type="button" className="recipe-cover__play" aria-label={t("Watch {title} demo", { title })}><span className="recipe-cover__play-control"><GlassSurface material="liquid" className="ag-floating-control recipe-cover__play-material" /><Play fill="currentColor" className="recipe-cover__play-icon" /><span className="recipe-cover__play-caption"><Play fill="currentColor" /><span>{t("Watch demo")}</span></span></span></button></DialogTrigger>}
  </div>
}

export function RecipeCard({ recipe, compact = false, returnTo }: { recipe: RecipeSummary; compact?: boolean; returnTo?: string }) {
  const { t, locale } = useI18n()
  const href = localePath(`/recipes/${recipe.slug}`, locale) + (returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : "")
  const media = recipe.showcase
  const featured = Boolean(media && recipe.recommendedOrder !== undefined)
  const title = media?.compactTitle ?? media?.title ?? recipe.title
  const label = media?.labels.find(value => recipe.platforms.includes(value)) ?? media?.labels[0] ?? recipe.platforms[0]
  const previewActions = (recipe.demoUrl || compact && media?.videoUrl) && <ButtonGroup className="recipe-card-actions" aria-label={t("Available materials")}>
    {compact && media?.videoUrl && <DialogTrigger asChild><IconButton size="icon-sm" label={t("Watch {title} demo", { title })}><Play aria-hidden="true" /></IconButton></DialogTrigger>}
    {recipe.demoUrl && <Button asChild variant="link" size="sm" className="recipe-demo-link"><a href={recipe.demoUrl} data-material="demo" target="_blank" rel="noreferrer" aria-label={t("Try {title} demo (opens in a new tab)", { title })}><span className="recipe-demo-link__full">{t("Try demo")}</span><span className="recipe-demo-link__compact">{t("Demo")}</span></a></Button>}
  </ButtonGroup>

  const technology = <div className="recipe-technologies" role="group" aria-label={t("Technology and difficulty")}>{recipe.platforms.slice(0, 2).map(value => <span key={value}>{value}</span>)}{recipe.platforms.length > 2 && <span>+{recipe.platforms.length - 2}</span>}{recipe.difficulty && <span className="recipe-technologies__difficulty">{t(recipe.difficulty)}</span>}</div>

  if (compact) return <RecipeVideoDialog recipe={recipe} detailHref={href}>
    <article className="recipe-result" data-recipe-slug={recipe.slug} data-compact>
      <div className="recipe-result__content">
        <Link prefetch={false} href={href} className="recipe-result__details" aria-label={t("Open {title} recipe", { title })}><h3>{title}</h3><p data-guide-excerpt={recipe.searchExcerpt ? true : undefined}>{recipe.searchExcerpt ? <><span>{t("Guide excerpt")}: </span>{recipe.searchExcerpt}</> : media?.compactSummary ?? recipe.tagline}</p></Link>
        {technology}
      </div>
      <div className="recipe-result__byline"><RecipeAuthor name={recipe.author} />{previewActions}</div>
    </article>
  </RecipeVideoDialog>


  return <RecipeVideoDialog recipe={recipe} detailHref={href}>
    <article className={cn("showcase-card", !featured && "showcase-card--directory")} data-recipe-slug={recipe.slug} data-recommended={recipe.recommendedOrder !== undefined || undefined}>
      {media && <RecipeCover recipe={recipe} title={title} href={href} />}
      <div className="showcase-card__body">
        <Link prefetch={false} href={href} className="showcase-card__details" aria-label={t("Open {title} recipe", { title })}>
          <h3><span>{title}</span></h3>
          <p className="showcase-card__summary" data-guide-excerpt={recipe.searchExcerpt ? true : undefined}>{recipe.searchExcerpt ? <><span>{t("Guide excerpt")}: </span>{recipe.searchExcerpt}</> : media?.compactSummary ?? recipe.tagline}</p>
        </Link>
        {!featured && technology}
        <div className="showcase-card__footer"><RecipeAuthor name={recipe.author} />{featured && label && <Badge>{t(label)}</Badge>}{previewActions}</div>
      </div>
    </article>
  </RecipeVideoDialog>
}
