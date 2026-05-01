import { Hero } from "@/components/hero"
import { RecipeExplorer } from "@/components/recipe-explorer"
import { getAllRecipes, getFilterOptions } from "@/lib/recipes"

export default function HomePage() {
  const recipes = getAllRecipes()
  const filterOptions = getFilterOptions()

  return (
    <main>
      <Hero />
      <RecipeExplorer recipes={recipes} filterOptions={filterOptions} />
    </main>
  )
}
