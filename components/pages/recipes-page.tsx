import Link from "next/link"
import type { Metadata } from "next"
import { StructuredData } from "@/components/structured-data"
import { DirectoryPosition } from "@/components/directory-position"
import { Button } from "@/components/ui/button"
import { getAllEntries } from "@/lib/recipes"
import { getT, localizeEntry } from "@/lib/i18n"
import { localePath, type Locale } from "@/lib/locales"
import { pageAlternates } from "@/lib/seo"
import { siteUrl } from "@/lib/site"
import { breadcrumbSchema, directorySchema } from "@/lib/structured-data"

type Params = { locale?: Locale }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale = "en" } = await params
  const t = getT(locale)
  return { title: t("All projects and recipes"), description: t("Browse every Voice AI and RTC project, with guides and source links."), alternates: pageAlternates("/recipes", locale) }
}

export default async function RecipesPage({ params }: { params: Promise<Params> }) {
  const { locale = "en" } = await params
  const t = getT(locale)
  const entries = getAllEntries().map(entry => localizeEntry(entry, locale)).sort((a, b) => a.title.localeCompare(b.title, locale) || a.slug.localeCompare(b.slug))
  const path = localePath("/recipes", locale)
  return <article className="recipe-detail">
    <StructuredData value={directorySchema(siteUrl.href, path, t("All projects and recipes"), entries.map(entry => ({ title: entry.title, path: localePath(`/recipes/${entry.slug}`, locale) })))} />
    <StructuredData value={breadcrumbSchema(siteUrl.href, [{ name: t("Recipes"), path: localePath("/", locale) }, { name: t("All projects and recipes"), path }])} />
    <header className="detail-hero"><div className="shell"><h1 className="hero-title">{t("All projects and recipes")}</h1><p className="detail-description">{t("Browse every Voice AI and RTC project, with guides and source links.")}</p><div className="detail-actions"><Button asChild variant="outline"><Link href={localePath("/", locale)}>{t("Search and filter recipes")}</Link></Button></div></div></header>
    <DirectoryPosition><ul className="recipe-directory__list">{entries.map(entry => <li key={entry.slug}>
      <Link className="recipe-directory__link" href={`${localePath(`/recipes/${entry.slug}`, locale)}?returnTo=${encodeURIComponent(path)}`}><h2>{entry.title}</h2><p>{entry.tagline}</p><span>{entry.platforms.join(" / ")}</span></Link>
    </li>)}</ul></DirectoryPosition>
  </article>
}
