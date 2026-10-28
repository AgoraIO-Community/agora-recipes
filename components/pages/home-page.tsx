import { socialMetadata } from "@/lib/social"
import type { Metadata } from "next"
import { RecipeExplorer } from "@/components/recipe-explorer"
import { locales, localePath } from "@/lib/locales"
import { getRecipeSummaries } from "@/lib/showcase"

export const metadata: Metadata = {
  ...socialMetadata({ title: "Agora Recipes", description: "Voice AI and real-time apps, with working code.", path: "/", locale: "en" }),
  alternates: {
    canonical: "/",
    languages: Object.fromEntries(locales.map(locale => [locale, localePath("/", locale)])),
    types: { "text/markdown": "/index.md" },
  },
}

export default function HomePage() {
  return <RecipeExplorer recipes={getRecipeSummaries()} />
}
