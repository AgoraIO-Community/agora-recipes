import { pageAlternates } from "@/lib/seo"
import { StructuredData } from "@/components/structured-data"
import { websiteSchema } from "@/lib/structured-data"
import { siteUrl } from "@/lib/site"
import { socialMetadata } from "@/lib/social"
import type { Metadata } from "next"
import { RecipeExplorer } from "@/components/recipe-explorer"
import { getRecipeSummaries } from "@/lib/showcase"

const title = "Voice AI & RTC Examples and Recipes | Agora"
const description = "Explore open-source Voice AI agents and real-time voice and video projects, with working code, demos, and implementation guides."

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  ...socialMetadata({ title, description, path: "/", locale: "en" }),
  alternates: pageAlternates("/", "en", "/index.md"),
}

export default function HomePage() {
  return <><StructuredData value={websiteSchema(siteUrl.href)} /><RecipeExplorer recipes={getRecipeSummaries()} /></>
}
