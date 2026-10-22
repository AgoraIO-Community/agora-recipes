import type { MetadataRoute } from "next"
import { getAllRecipes } from "@/lib/recipes"
import { absoluteUrl } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/") },
    ...getAllRecipes().map((recipe) => ({
      url: absoluteUrl(`/recipes/${recipe.slug}`),
      lastModified: recipe.updated,
    })),
  ]
}
