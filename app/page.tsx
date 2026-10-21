import { RecipeExplorer } from "@/components/recipe-explorer"
import { getRecipeSummaries } from "@/lib/showcase"
import { Hero } from "@/components/hero"

export default function HomePage() {
  return <><Hero /><RecipeExplorer recipes={getRecipeSummaries()} /></>
}
