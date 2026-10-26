import type { Metadata } from "next"
import { RecipeExplorer } from "@/components/recipe-explorer"
import { getRecipeSummaries } from "@/lib/showcase"

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    types: { "text/markdown": "/index.md" },
  },
}

export default function HomePage() {
  return <RecipeExplorer recipes={getRecipeSummaries()} />
}
