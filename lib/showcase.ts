import "server-only"
import recommendations from "@/content/showcase.json"
import { getAllEntries } from "@/lib/recipes"
import { getT, localizeEntry } from "@/lib/i18n"
import type { Locale } from "@/lib/locales"
import type { RecipeSummary, Showcase } from "@/lib/recipe-discovery"

export function getRecipeSummaries(locale: Locale = "en"): RecipeSummary[] {
  const entries = getAllEntries()
  const t = getT(locale)
  const order = new Map<string, number>()
  recommendations.forEach(({ slug }, index) => {
    if (!entries.some(entry => entry.slug === slug) || order.has(slug)) throw new Error(`[showcase] Unknown or duplicate entry slug: ${slug}`)
    order.set(slug, index)
  })
  return entries.map(({ cli: _cli, recipeDocument: _document, primaryPrompt: _prompt, generatedAt: _generated, media, ...entry }) => {
    const showcase: Showcase | undefined = media && (media.thumbnail || media.videoUrl) ? {
      slug: entry.slug, title: entry.title, summary: entry.description,
      thumbnail: "", thumbnailAlt: entry.title, thumbnailSource: "", demoNote: "",
      labels: [], searchTerms: [], ...media,
    } : undefined
    const presentation = localizeEntry(entry, locale)
    if (showcase && locale !== "en") {
      showcase.compactSummary = presentation.tagline
      showcase.summary = presentation.description
      showcase.thumbnailAlt = t(showcase.thumbnailAlt)
      showcase.demoNote = t(showcase.demoNote)
    }
    return { ...presentation, ...(locale !== "en" ? { searchTerms: [entry.title, entry.tagline, entry.description] } : {}), ...(showcase ? { showcase } : {}), ...(order.has(entry.slug) ? { recommendedOrder: order.get(entry.slug)! } : {}) }
  })
}
