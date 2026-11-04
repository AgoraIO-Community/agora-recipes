"use client"

import { useI18n } from "@/components/locale-provider"
import { useState } from "react"
import Image from "next/image"
import { ArrowUpRight, BookOpen, Play } from "lucide-react"
import { GlassSurface } from "@/components/agent-ui/glass-surface"
import { DialogTrigger } from "@/components/ui/dialog"
import { RecipeVideoDialog } from "@/components/recipe-video-dialog"
import type { RecipeSummary } from "@/lib/recipe-discovery"

export function RecipePreview({ recipe }: { recipe: RecipeSummary }) {
  const { t } = useI18n()
  const [failed, setFailed] = useState(false)
  const media = recipe.showcase
  if (!media) return null
  const title = media.compactTitle ?? media.title
  const cover = <>
    {failed || !media.thumbnail ? <span className="detail-preview__fallback"><BookOpen aria-hidden="true" />{title}</span> : <Image src={media.thumbnail} alt={media.thumbnailAlt} width={1280} height={720} loading="eager" onError={() => setFailed(true)} />}
    <GlassSurface material="liquid" className="detail-preview__action ag-floating-control">{media.videoUrl ? <><Play fill="currentColor" aria-hidden="true" />{t("Watch demo")} {media.videoDuration && `· ${media.videoDuration}`}</> : recipe.demoUrl ? <>{t("Try live demo")}<ArrowUpRight aria-hidden="true" /></> : t("Project preview")}</GlassSurface>
  </>
  return <section id="demo" className="detail-preview" aria-label={t("{title} demo preview", { title })}>
    <RecipeVideoDialog recipe={recipe}>
      {media.videoUrl ? <DialogTrigger asChild><button type="button" className="detail-preview__cover" aria-label={t("Watch {title} demo", { title })}>{cover}</button></DialogTrigger> : recipe.demoUrl ? <a className="detail-preview__cover" href={recipe.demoUrl} data-material="demo" target="_blank" rel="noreferrer" aria-label={t("Try {title} demo (opens in a new tab)", { title })}>{cover}</a> : <div className="detail-preview__cover">{cover}</div>}
    </RecipeVideoDialog>
    <p>{media.demoNote}</p>
  </section>
}
