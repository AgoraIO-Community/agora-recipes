import { RecipeExplorer } from "@/components/recipe-explorer"
import { getRecipeSummaries } from "@/lib/showcase"

export default function HomePage() {
  return <RecipeExplorer recipes={getRecipeSummaries()} />
}
