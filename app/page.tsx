import { Hero } from "@/components/hero"
import { RecipeExplorer } from "@/components/recipe-explorer"
import { getAllRecipes, getFilterOptionsByTag } from "@/lib/recipes"
import type { Metadata } from "next"

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    types: { "text/markdown": "/index.md" },
  },
}

export default function HomePage() {
  const recipes = getAllRecipes()
  const filterOptionsByTag = getFilterOptionsByTag()

  return (
    <>
      <Hero />
      <RecipeExplorer recipes={recipes} filterOptionsByTag={filterOptionsByTag} />
    </>
  )
}
