import { getAllEntries } from "@/lib/recipes"
import { searchableGuide } from "@/lib/search-documents"

export const dynamic = "force-static"

export function GET() {
  const documents = Object.fromEntries(getAllEntries().filter(entry => entry.recipeUrl).map(entry => {
    const versions = [entry.recipeDocument, ...Object.values(entry.documentLanguages?.versions ?? {})]
    return [entry.slug, [...new Set(versions.filter(document => !document.fetchError).map(document => searchableGuide(document.markdown)).filter(Boolean))].join("\n\n")]
  }))
  return Response.json({ version: 1, documents }, { headers: { "Cache-Control": "public, max-age=0, must-revalidate" } })
}
