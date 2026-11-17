import { pageAlternates } from "@/lib/seo"
import { StructuredData } from "@/components/structured-data"
import { websiteSchema } from "@/lib/structured-data"
import { siteUrl } from "@/lib/site"
import { socialMetadata } from "@/lib/social"
import { notFound } from "next/navigation"
import { RecipeExplorer } from "@/components/recipe-explorer"
import { getRecipeSummaries } from "@/lib/showcase"
import { isLocale, localePath } from "@/lib/locales"
import { getT } from "@/lib/i18n"
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = getT(locale)
  const title = t("Voice AI & RTC Examples and Recipes | Agora")
  const description = t("Explore open-source Voice AI agents and real-time voice and video projects, with working code, demos, and implementation guides.")
  return { title: { absolute: title }, description, ...socialMetadata({ title, description, path: localePath("/", locale), locale }), alternates: pageAlternates("/", locale, "/index.md") }
}
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return <><StructuredData value={websiteSchema(siteUrl.href)} /><RecipeExplorer recipes={getRecipeSummaries(locale)} /></>
}
