import { catalogMarkdown } from "@/lib/recipe-markdown"

export const dynamic = "force-static"

export function GET() {
  return new Response(catalogMarkdown(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
