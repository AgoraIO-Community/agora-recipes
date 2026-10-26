import { catalogMarkdown, markdownResponse } from "@/lib/recipe-markdown"

export const dynamic = "force-static"

export function GET() {
  return markdownResponse(catalogMarkdown())
}
