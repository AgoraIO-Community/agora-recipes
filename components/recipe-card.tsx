"use client"

import { useState, type CSSProperties } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight, BookOpen, Play } from "lucide-react"
import { DialogTrigger } from "@/components/ui/dialog"
import { RecipeVideoDialog } from "@/components/recipe-video-dialog"
import { RecipeAuthor } from "@/components/recipe-author"
import type { RecipeSummary } from "@/lib/recipe-discovery"
import { cn } from "@/lib/utils"

export function RecipeCard({ recipe }: { recipe: RecipeSummary }) {
  const [imageFailed, setImageFailed] = useState(false)
  const media = recipe.showcase
  const title = media?.compactTitle ?? media?.title ?? recipe.title
  const labels = (media?.labels ?? recipe.platforms).slice(0, 2)
  const cover = media && (
    <div className="recipe-cover" style={{ "--thumbnail-scale": media.thumbnailScale ?? 1, "--thumbnail-origin": media.thumbnailOrigin ?? "50% 50%" } as CSSProperties}>
      {!imageFailed ? <Image src={media.thumbnail} alt={media.thumbnailAlt} width={1280} height={720} loading={recipe.recommendedOrder !== undefined ? "eager" : "lazy"} className="recipe-cover__image" onError={() => setImageFailed(true)} /> : <div className="recipe-cover__fallback"><BookOpen aria-hidden="true" /><span>{title}</span></div>}
      {media.videoUrl && <span className="recipe-cover__play" aria-hidden="true"><Play fill="currentColor" /></span>}
      {(media.videoUrl || recipe.demoUrl) && <span className="recipe-cover__label">{media.videoUrl ? media.videoDuration : <>Live demo <ArrowUpRight aria-hidden="true" /></>}</span>}
    </div>
  )

  return (
    <RecipeVideoDialog recipe={recipe}>
      <article className={cn("showcase-card", !media && "showcase-card--guide")} data-recipe-slug={recipe.slug} data-recommended={recipe.recommendedOrder !== undefined || undefined}>
        {media && (media.videoUrl ? <DialogTrigger asChild><button className="recipe-cover-link" aria-label={`Watch ${title} demo`}>{cover}</button></DialogTrigger> : recipe.demoUrl ? <a href={recipe.demoUrl} target="_blank" rel="noreferrer" className="recipe-cover-link" aria-label={`Try ${title} demo (opens in a new tab)`} title={media.demoNote}>{cover}</a> : <Link prefetch={false} href={`/recipes/${recipe.slug}`} className="recipe-cover-link">{cover}</Link>)}
        <div className="showcase-card__body">
          <Link prefetch={false} href={`/recipes/${recipe.slug}`} className="showcase-card__details">
            <h3>{title}</h3>
            <p className="showcase-card__summary">{media?.compactSummary ?? recipe.tagline}</p>
          </Link>
          <div className="showcase-card__footer">
            <RecipeAuthor name={recipe.author} />
            <div className="showcase-card__tags" aria-label="Recipe tags">{labels.map((label) => <span key={label}>{label}</span>)}</div>
          </div>
          {!media && recipe.demoUrl && <a href={recipe.demoUrl} target="_blank" rel="noreferrer" className="text-action recipe-demo-link" aria-label={`Try ${title} demo (opens in a new tab)`}>Try demo <ArrowUpRight size={14} aria-hidden="true" /></a>}
        </div>
      </article>
    </RecipeVideoDialog>
  )
}
