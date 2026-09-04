import "server-only"

import type { Recipe, RecipeCLIConfig } from "@/lib/recipes"

export const RECIPE_API_SCHEMA_VERSION = 1

export type RecipeCatalogType = "ai" | "rtc"

export type RecipeApiSummary = {
  slug: string
  title: string
  tagline: string
  description: string
  platforms: string[]
  useCases: string[]
  capabilities: string[]
  mainRepoUrl: string
  recipeUrl: string
  author: string
  updated: string
  difficulty: Recipe["difficulty"]
  type: RecipeCatalogType
  official: boolean
}

export type RecipeApiDetail = RecipeApiSummary & {
  recipeRawUrl: string
  primaryPrompt: string
  cli?: RecipeCLIConfig
}

export function isOfficialAgoraRecipe(recipe: Recipe): boolean {
  return recipe.author === "Agora"
}

export function getRecipeCatalogType(recipe: Recipe): RecipeCatalogType {
  return recipe.capabilities.some((capability) =>
    capability.toLowerCase().includes("agora rtc"),
  )
    ? "rtc"
    : "ai"
}

export function toRecipeApiSummary(recipe: Recipe): RecipeApiSummary {
  return {
    slug: recipe.slug,
    title: recipe.title,
    tagline: recipe.tagline,
    description: recipe.description,
    platforms: recipe.platforms,
    useCases: recipe.useCases,
    capabilities: recipe.capabilities,
    mainRepoUrl: recipe.mainRepoUrl,
    recipeUrl: recipe.recipeUrl,
    author: recipe.author,
    updated: recipe.updated,
    difficulty: recipe.difficulty,
    type: getRecipeCatalogType(recipe),
    official: isOfficialAgoraRecipe(recipe),
  }
}

export function toRecipeApiDetail(recipe: Recipe): RecipeApiDetail {
  return {
    ...toRecipeApiSummary(recipe),
    recipeRawUrl: recipe.recipeDocument.rawUrl,
    primaryPrompt: recipe.primaryPrompt,
    cli: recipe.cli,
  }
}

export function isCliInitializableRecipe(recipe: Recipe): boolean {
  return isOfficialAgoraRecipe(recipe) && recipe.cli !== undefined
}
