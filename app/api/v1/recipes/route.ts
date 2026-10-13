import {
  RECIPE_API_SCHEMA_VERSION,
  isOfficialAgoraRecipe,
  type RecipeCatalogType,
  toRecipeApiSummary,
} from "@/lib/recipe-api"
import { getAllRecipes } from "@/lib/recipes"

const CACHE_CONTROL =
  "public, max-age=300, s-maxage=300, stale-while-revalidate=3600"
const RECIPE_TYPES = new Set(["all", "ai", "rtc"])

export function GET(request: Request) {
  const requestedType = new URL(request.url).searchParams.get("type") ?? "all"
  if (!RECIPE_TYPES.has(requestedType)) {
    return Response.json(
      {
        schemaVersion: RECIPE_API_SCHEMA_VERSION,
        error: {
          code: "RECIPE_TYPE_INVALID",
          message: 'type must be one of "all", "ai", or "rtc"',
        },
      },
      { status: 400 },
    )
  }

  const items = getAllRecipes()
    .filter(isOfficialAgoraRecipe)
    .map(toRecipeApiSummary)
    .filter(
      (recipe) =>
        requestedType === "all" ||
        recipe.type === (requestedType as RecipeCatalogType),
    )
    .sort(
      (left, right) =>
        left.title.localeCompare(right.title, undefined, {
          sensitivity: "base",
        }) || left.slug.localeCompare(right.slug),
    )

  return Response.json(
    {
      schemaVersion: RECIPE_API_SCHEMA_VERSION,
      items,
      total: items.length,
      type: requestedType,
    },
    { headers: { "Cache-Control": CACHE_CONTROL } },
  )
}
