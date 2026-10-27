"use client"

import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight, BookOpen, Play } from "lucide-react"
import { DialogTrigger } from "@/components/ui/dialog"
import { RecipeVideoDialog } from "@/components/recipe-video-dialog"
import { RecipeAuthor } from "@/components/recipe-author"
import { GlassSurface } from "@/components/agent-ui/glass-surface"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { RecipeSummary } from "@/lib/recipe-discovery"
import { cn } from "@/lib/utils"

function prefersExplicitPlayback() {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  return connection?.saveData === true || window.matchMedia("(prefers-reduced-motion: reduce), (prefers-reduced-data: reduce)").matches
}

function RecipeCover({ recipe, title }: { recipe: RecipeSummary; title: string }) {
  const [imageFailed, setImageFailed] = useState(false)
  const [preview, setPreview] = useState(false)
  const [playing, setPlaying] = useState(false)
  const video = useRef<HTMLVideoElement>(null)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const hovered = useRef(false)
  const media = recipe.showcase
  const videoUrl = media?.videoUrl
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

  function startPreview(event: PointerEvent<HTMLButtonElement>) {
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
    {!imageFailed ? <Image src={media.thumbnail} alt={media.thumbnailAlt} width={1280} height={720} loading={recipe.recommendedOrder !== undefined ? "eager" : "lazy"} className="recipe-cover__image" onError={() => setImageFailed(true)} /> : <div className="recipe-cover__fallback"><BookOpen aria-hidden="true" /><span>{title}</span></div>}
    {preview && videoUrl && <video ref={video} src={videoUrl} className="recipe-cover__video" muted loop playsInline preload="metadata" aria-hidden="true" onPlaying={() => { if (hovered.current) setPlaying(true) }} onError={stopPreview} />}
    {media.videoUrl && <div className="recipe-cover__play" aria-hidden="true"><div className="recipe-cover__play-control"><GlassSurface material="liquid" className="ag-floating-control recipe-cover__play-material" /><Play fill="currentColor" /><span>Watch demo</span></div></div>}
    {(media.videoUrl || recipe.demoUrl) && <Badge className="recipe-cover__label ag-overlay">{media.videoUrl ? media.videoDuration : <>Live demo <ArrowUpRight aria-hidden="true" /></>}</Badge>}
  </div>
  return media.videoUrl ? <DialogTrigger asChild><button type="button" className="recipe-cover-link" aria-label={`Watch ${title} demo`} onPointerEnter={startPreview} onPointerLeave={stopPreview} onPointerDown={stopPreview} onClick={stopPreview}>{cover}</button></DialogTrigger> : recipe.demoUrl ? <a href={recipe.demoUrl} target="_blank" rel="noreferrer" className="recipe-cover-link" aria-label={`Try ${title} demo (opens in a new tab)`} title={media.demoNote}>{cover}</a> : <Link prefetch={false} href={`/recipes/${recipe.slug}`} className="recipe-cover-link">{cover}</Link>
}

export function RecipeCard({ recipe, compact = false }: { recipe: RecipeSummary; compact?: boolean }) {
  const media = recipe.showcase
  const title = media?.compactTitle ?? media?.title ?? recipe.title
  const label = media?.labels.find(value => recipe.platforms.includes(value)) ?? media?.labels[0] ?? recipe.platforms[0]
  const previewAction = media?.videoUrl ? <DialogTrigger asChild><Button variant="ghost" size="sm" aria-label={`Watch ${title} demo`}><Play aria-hidden="true" />Video</Button></DialogTrigger> : recipe.demoUrl ? <Button asChild variant="ghost" size="sm"><a href={recipe.demoUrl} target="_blank" rel="noreferrer" aria-label={`Try ${title} demo (opens in a new tab)`}>Live demo<ArrowUpRight aria-hidden="true" /></a></Button> : null

  if (compact) return <RecipeVideoDialog recipe={recipe}>
    <article className="recipe-result" data-recipe-slug={recipe.slug} data-compact>
      <div className="recipe-result__content">
        <Link prefetch={false} href={`/recipes/${recipe.slug}`} className="recipe-result__details"><h3>{title}</h3><p>{media?.compactSummary ?? recipe.tagline}</p></Link>
        <div className="recipe-result__technology" role="group" aria-label="Technology and difficulty">{recipe.platforms.slice(0, 2).map(value => <span key={value}>{value}</span>)}{recipe.platforms.length > 2 && <span>+{recipe.platforms.length - 2}</span>}<span className="recipe-result__difficulty">{recipe.difficulty}</span></div>
      </div>
      <div className="recipe-result__byline"><RecipeAuthor name={recipe.author} />{previewAction || <span>Recipe guide</span>}</div>
      <Button asChild variant="ghost" size="icon" className="recipe-result__arrow"><Link prefetch={false} href={`/recipes/${recipe.slug}`} aria-label={`Open ${title} recipe`}><ArrowUpRight aria-hidden="true" /></Link></Button>
    </article>
  </RecipeVideoDialog>


  return <RecipeVideoDialog recipe={recipe}>
    <article className={cn("showcase-card", !media && "showcase-card--guide")} data-recipe-slug={recipe.slug} data-recommended={recipe.recommendedOrder !== undefined || undefined}>
      {media && <RecipeCover recipe={recipe} title={title} />}
      <div className="showcase-card__body">
        <Link prefetch={false} href={`/recipes/${recipe.slug}`} className="showcase-card__details">
          <h3>{title}<ArrowUpRight className="showcase-card__arrow" aria-hidden="true" /></h3>
          <p className="showcase-card__summary">{media?.compactSummary ?? recipe.tagline}</p>
        </Link>
        <div className="showcase-card__footer"><RecipeAuthor name={recipe.author} />{label && <Badge>{label}</Badge>}</div>
        {!media && previewAction}
      </div>
    </article>
  </RecipeVideoDialog>
}
