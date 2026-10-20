"use client"

import Image from "next/image"
import { ArrowUpRight, Play } from "lucide-react"
import { Button } from "@/components/agent-ui/button"
import { DialogTrigger } from "@/components/ui/dialog"
import { RecipeVideoDialog } from "@/components/recipe-video-dialog"
import type { RecipeSummary } from "@/lib/recipe-discovery"

export function RecipePreview({ recipe }: { recipe: RecipeSummary }) {
  const media = recipe.showcase
  if (!media) return null
  return (
    <section className="agent-ui flex flex-col gap-4" aria-labelledby="recipe-preview-title">
      <h2 id="recipe-preview-title" className="font-brand text-xl font-semibold">See it in action</h2>
      <RecipeVideoDialog recipe={recipe}>
        <Image src={media.thumbnail} alt={media.thumbnailAlt} width={1280} height={720} className="w-full rounded-lg border border-border" />
        <div className="flex flex-wrap gap-2">
          {media.videoUrl && <DialogTrigger asChild><Button variant="outline" className="min-h-11"><Play aria-hidden="true" /> Watch demo · {media.videoDuration}</Button></DialogTrigger>}
          {media.demoUrl && <Button asChild className="min-h-11"><a href={media.demoUrl} target="_blank" rel="noreferrer">Try live demo <ArrowUpRight aria-hidden="true" /></a></Button>}
        </div>
      </RecipeVideoDialog>
      <p className="text-sm text-muted-foreground">{media.demoNote}</p>
    </section>
  )
}
