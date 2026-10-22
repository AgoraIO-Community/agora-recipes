import { getAllRecipes, getRecipe } from "@/lib/recipes"
import { markdownResponse, recipeMarkdown } from "@/lib/recipe-markdown"

export const dynamic = "force-static"

export function generateStaticParams() {
  return getAllRecipes().map(({ slug }) => ({ slug }))
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const recipe = getRecipe(slug)
  if (!recipe) return new Response("Recipe not found\n", { status: 404 })
  return markdownResponse(recipeMarkdown(recipe))
}
