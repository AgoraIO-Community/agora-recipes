"use client"

import type { RecipeSummary } from "@/lib/recipe-discovery"

// Capabilities shared by most of a category say nothing about one recipe.
const categoryTerms = new Set(["Conversational AI", "Voice Agent", "Agora RTC"])
const styles = ["mark", "code", "sticker"] as const

function styleFor(slug: string, title: string) {
  let hash = 2166136261
  for (const char of slug) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619)
  hash ^= hash >>> 15
  const mixed = Math.imul(hash, 2246822519) >>> 0
  const style = styles[mixed % styles.length]
  // The code layout gives the name under half the frame; long names take a wider layout.
  return style === "code" && title.length > 23 ? (mixed & 2 ? "mark" : "sticker") : style
}

// Poster drawn from recipe metadata for entries without a usable project image.
// It behaves like media: fixed colors in both themes and scaled with the frame.
// It is decorative; the surrounding link and the card heading carry the name.
export function RecipeGeneratedCover({ recipe, title }: { recipe: RecipeSummary; title: string }) {
  const style = styleFor(recipe.slug, title)
  const features = recipe.capabilities.filter(value => !categoryTerms.has(value) && value.toLowerCase() !== title.toLowerCase()).slice(0, 2)
  const name = <span className="recipe-generated-cover__name" data-length={title.length <= 14 ? "short" : title.length <= 24 ? "medium" : "long"}>{title}</span>
  const tags = features.length > 0 && <span className="recipe-generated-cover__tags">{features.map(value => <span key={value}>{value}</span>)}</span>
  return <span className="recipe-generated-cover" data-style={style} aria-hidden="true">
    {style === "sticker" ? <span className="recipe-generated-cover__sticker">{name}</span> : style === "code" ? <span className="recipe-generated-cover__panel">{name}{tags}</span> : name}
    {style !== "code" && tags}
    {style === "mark" && <span className="recipe-generated-cover__mark" />}
    {style === "code" && <span className="recipe-generated-cover__code">
      <span><i>recipe</i>: <b>{recipe.slug}</b></span>
      <span><i>category</i>: {recipe.tags.includes("voice-ai") ? "voice-ai" : "rtc"}</span>
      <span><i>platforms</i>: [{recipe.platforms.slice(0, 2).join(", ")}]</span>
      <span><i>difficulty</i>: {recipe.difficulty}</span>
      <span><i>author</i>: <b>{recipe.author}</b></span>
    </span>}
  </span>
}
