import { notFound } from "next/navigation"
import { RecipeExplorer } from "@/components/recipe-explorer"
import { getRecipeSummaries } from "@/lib/showcase"
import { isLocale, localePath, locales } from "@/lib/locales"
import { getT } from "@/lib/i18n"
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  return { description: getT(locale)("Voice AI and real-time apps, with working code."), alternates: { canonical: localePath("/", locale), languages: Object.fromEntries(locales.map(value => [value, localePath("/", value)])) } }
}
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return <RecipeExplorer recipes={getRecipeSummaries(locale)} />
}
