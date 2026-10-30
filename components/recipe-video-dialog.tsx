"use client"

import { useState, type ReactNode } from "react"
import { ArrowUpRight } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { youtubeEmbedUrl } from "@/lib/video"
import type { RecipeSummary } from "@/lib/recipe-discovery"

export function RecipeVideoDialog({ recipe, children }: { recipe: RecipeSummary; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [failed, setFailed] = useState(false)
  const media = recipe.showcase
  if (!media?.videoUrl) return children
  const youtubeUrl = youtubeEmbedUrl(media.videoUrl)

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); setFailed(false) }}>
      {children}
      <DialogContent className="video-preview max-h-[90dvh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader className="pr-8 text-left">
          <DialogTitle className="font-brand text-xl leading-tight">{media.compactTitle ?? media.title}</DialogTitle>
          <DialogDescription>{media.demoNote}</DialogDescription>
        </DialogHeader>
        {open && youtubeUrl && (
          <iframe src={youtubeUrl} title={`${media.title} gameplay video`} className="aspect-video w-full rounded-md bg-black" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
        )}
        {open && !youtubeUrl && !failed && (
          <video key={media.videoUrl} controls playsInline preload="metadata" poster={media.thumbnail} className="aspect-video w-full rounded-md bg-black" onError={() => setFailed(true)}>
            <source src={media.videoUrl} type="video/mp4" />
            Your browser does not support video playback. Open the original video below.
          </video>
        )}
        {failed && <p role="alert" className="rounded-md border p-6 text-sm">This video couldn’t load. You can open the original video or read the recipe below.</p>}
        <div className="video-preview__footer">
          <a href={media.videoUrl} target="_blank" rel="noreferrer" className="video-source-link">Original video <ArrowUpRight aria-hidden="true" /></a>
          <div className="video-preview__actions">
            <a href={`/recipes/${recipe.slug}`} className="video-recipe-link">Read recipe</a>
            {recipe.demoUrl && <Button asChild><a href={recipe.demoUrl} target="_blank" rel="noreferrer">Try live demo <ArrowUpRight aria-hidden="true" /></a></Button>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
