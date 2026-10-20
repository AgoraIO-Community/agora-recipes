import "server-only"
import entries from "@/content/showcase.json"
import { getAllRecipes } from "@/lib/recipes"
import type { RecipeSummary, Showcase } from "@/lib/recipe-discovery"

export function getRecipeSummaries(): RecipeSummary[] {
  const recipes = getAllRecipes()
  const curated = new Map<string, { showcase: Showcase; recommendedOrder: number }>()
  entries.forEach((entry, index) => {
    if (!recipes.some((recipe) => recipe.slug === entry.slug) || curated.has(entry.slug)) {
      throw new Error(`[showcase] Unknown or duplicate recipe slug: ${entry.slug}`)
    }
    for (const url of [entry.demoUrl, entry.videoUrl, entry.thumbnailSource]) {
      if (url && !url.startsWith("https://")) throw new Error(`[showcase] Expected HTTPS URL for ${entry.slug}`)
    }
    curated.set(entry.slug, { showcase: entry, recommendedOrder: index })
  })
  return recipes.map(({ slug, title, tagline, description, tags, platforms, useCases, capabilities, mainRepoUrl, recipeUrl, author, updated, difficulty }) => ({
    slug, title, tagline, description, tags, platforms, useCases, capabilities, mainRepoUrl, recipeUrl, author, updated, difficulty,
    ...curated.get(slug),
  }))
}
