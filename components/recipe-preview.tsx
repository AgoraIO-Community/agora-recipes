"use client"

import { AttributionLink } from "@/components/attribution-link"
import { useI18n } from "@/components/locale-provider"
import { useState } from "react"
import Image from "next/image"
import { ExternalLink, Play } from "lucide-react"
import { GlassSurface } from "@/components/design-system/glass-surface"
import { DialogTrigger } from "@/components/ui/dialog"
import { RecipeVideoDialog } from "@/components/recipe-video-dialog"
import { RecipeTextCover } from "@/components/recipe-text-cover"
import type { RecipeSummary } from "@/lib/recipe-discovery"

export function RecipePreview({ recipe }: { recipe: RecipeSummary }) {
  const { t } = useI18n()
  const [failed, setFailed] = useState(false)
  const media = recipe.showcase
  if (!media) return null
  const image = !failed && media.thumbnail
  // Without project media there is nothing to preview unless a video or Demo still needs this entry point.
  if (!image && !media.videoUrl && !recipe.demoUrl) return null
  const title = media.compactTitle ?? media.title
  const cover = <>
    {image ? <Image src={image} alt={media.thumbnailAlt} width={1600} height={900} loading="eager" style={{ objectPosition: media.thumbnailOrigin }} onError={() => setFailed(true)} /> : <RecipeTextCover recipe={recipe} title={title} />}
    {(media.videoUrl || recipe.demoUrl) && <GlassSurface material="liquid" className="detail-preview__action ag-floating-control">{media.videoUrl ? <><Play fill="currentColor" aria-hidden="true" />{media.videoDuration}</> : <ExternalLink aria-hidden="true" />}</GlassSurface>}
  </>
  return <section id="demo" className="detail-preview" aria-label={t("{title} demo preview", { title })}>
    <RecipeVideoDialog recipe={recipe}>
      {media.videoUrl ? <DialogTrigger asChild><button type="button" className="detail-preview__cover" aria-label={t("Watch {title} demo", { title })}>{cover}</button></DialogTrigger> : recipe.demoUrl ? <AttributionLink className="detail-preview__cover" href={recipe.demoUrl} data-material="demo" target="_blank" rel="noreferrer" aria-label={t("Try {title} demo (opens in a new tab)", { title })}>{cover}</AttributionLink> : <div className="detail-preview__cover">{cover}</div>}
    </RecipeVideoDialog>
    {image && <p>{media.demoNote}</p>}
  </section>
}
