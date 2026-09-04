import { Hero } from "@/components/hero"
import { RecipeExplorer } from "@/components/recipe-explorer"
import { getAllRecipes, getFilterOptionsByTag } from "@/lib/recipes"

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
