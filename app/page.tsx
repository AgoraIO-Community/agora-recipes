import { Hero } from "@/components/hero"
import { RecipeExplorer } from "@/components/recipe-explorer"
import { getAllRecipes, getFilterOptions } from "@/lib/recipes"

export default function HomePage() {
  const recipes = getAllRecipes()
  const filterOptions = getFilterOptions()

  return (
    <main>
      <Hero
        recipeCount={recipes.length}
        platformCount={filterOptions.platforms.length}
        capabilityCount={filterOptions.capabilities.length}
      />
      <RecipeExplorer recipes={recipes} filterOptions={filterOptions} />
    </main>
  )
}
