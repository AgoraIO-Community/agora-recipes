"use client"

import Image from "next/image"
import { useState, type CSSProperties } from "react"
import type { RecipeSummary } from "@/lib/recipe-discovery"

export function RecipeCoverImage({ recipe, className, loading = "lazy", style, onError }: {
  recipe: RecipeSummary
  className?: string
  loading?: "eager" | "lazy"
  style?: CSSProperties
  onError?: () => void
}) {
  const [failed, setFailed] = useState(false)
  const media = recipe.showcase
  const category = recipe.tags.includes("voice-ai") ? "voice-ai" : "rtc"
  const fallback = failed || !media?.thumbnail
  const defaultCover = fallback || media?.thumbnail.startsWith("/recipes/default-")
  const source = fallback ? `/recipes/default-${category}-light.webp` : media.thumbnail
  const darkSource = fallback ? `/recipes/default-${category}-dark.webp` : media.thumbnailDark
  const alt = defaultCover
    ? `${category === "voice-ai" ? "Voice AI" : "RTC"} default cover illustration; not a project screenshot`
    : media.thumbnailAlt

  return <picture className="recipe-cover__picture" data-default-cover={defaultCover ? category : undefined}>
    {darkSource && <source media="(prefers-color-scheme: dark)" srcSet={darkSource} />}
    <Image src={source} alt={alt} width={1600} height={840} loading={loading} unoptimized={defaultCover} className={className}
      style={defaultCover ? { ...style, objectPosition: "50% 50%", transform: "none" } : style}
      onError={() => { setFailed(true); onError?.() }} />
  </picture>
}
