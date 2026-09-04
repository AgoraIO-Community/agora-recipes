import {
  RECIPE_API_SCHEMA_VERSION,
  isOfficialAgoraRecipe,
  toRecipeApiDetail,
} from "@/lib/recipe-api"
import { getRecipe } from "@/lib/recipes"

const CACHE_CONTROL =
  "public, max-age=300, s-maxage=300, stale-while-revalidate=3600"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const recipe = getRecipe(slug)
  if (!recipe || !isOfficialAgoraRecipe(recipe)) {
    return Response.json(
      {
        schemaVersion: RECIPE_API_SCHEMA_VERSION,
        error: {
          code: "RECIPE_NOT_FOUND",
          message: `recipe ${JSON.stringify(slug)} was not found`,
        },
      },
      { status: 404 },
    )
  }

  return Response.json(
    {
      schemaVersion: RECIPE_API_SCHEMA_VERSION,
      recipe: toRecipeApiDetail(recipe),
    },
    { headers: { "Cache-Control": CACHE_CONTROL } },
  )
}
