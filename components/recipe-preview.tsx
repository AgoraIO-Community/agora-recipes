"use client"

import { useI18n } from "@/components/locale-provider"
import { useState } from "react"
import { ExternalLink, Play } from "lucide-react"
import { GlassSurface } from "@/components/design-system/glass-surface"
import { DialogTrigger } from "@/components/ui/dialog"
import { RecipeVideoDialog } from "@/components/recipe-video-dialog"
import { RecipeCoverImage } from "@/components/recipe-cover-image"
import type { RecipeSummary } from "@/lib/recipe-discovery"

export function RecipePreview({ recipe }: { recipe: RecipeSummary }) {
  const { t } = useI18n()
  const [failed, setFailed] = useState(false)
  const media = recipe.showcase
  if (!media) return null
  const title = media.compactTitle ?? media.title
  const cover = <>
    <RecipeCoverImage recipe={recipe} loading="eager" style={{ objectPosition: media.thumbnailOrigin }} onError={() => setFailed(true)} />
    {(media.videoUrl || recipe.demoUrl) && <GlassSurface material="liquid" className="detail-preview__action ag-floating-control">{media.videoUrl ? <><Play fill="currentColor" aria-hidden="true" />{media.videoDuration}</> : <ExternalLink aria-hidden="true" />}</GlassSurface>}
  </>
  return <section id="demo" className="detail-preview" aria-label={t("{title} demo preview", { title })}>
    <RecipeVideoDialog recipe={recipe}>
      {media.videoUrl ? <DialogTrigger asChild><button type="button" className="detail-preview__cover" aria-label={t("Watch {title} demo", { title })}>{cover}</button></DialogTrigger> : recipe.demoUrl ? <a className="detail-preview__cover" href={recipe.demoUrl} data-material="demo" target="_blank" rel="noreferrer" aria-label={t("Try {title} demo (opens in a new tab)", { title })}>{cover}</a> : <div className="detail-preview__cover">{cover}</div>}
    </RecipeVideoDialog>
    <p>{failed ? t("Default cover illustration.") : media.demoNote}</p>
  </section>
}
