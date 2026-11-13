"use client"

import { useI18n } from "@/components/locale-provider"
import type { RecipeSummary } from "@/lib/recipe-discovery"

// Cover for recipes without usable project media: the frame carries the title
// instead of an invented picture, so it can never fail to load.
export function RecipeTextCover({ recipe, title, heading = false }: { recipe: RecipeSummary; title: string; heading?: boolean }) {
  const { t } = useI18n()
  const Frame = heading ? "div" : "span"
  const Title = heading ? "h3" : "span"
  return <Frame className="recipe-text-cover">
    <span className="recipe-text-cover__category">{t(recipe.tags.includes("voice-ai") ? "Voice AI" : "RTC")}</span>
    <Title className="recipe-text-cover__title">{title}</Title>
  </Frame>
}
