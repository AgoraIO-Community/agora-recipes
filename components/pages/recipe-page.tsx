import { socialMetadata } from "@/lib/social"
import { absoluteUrl } from "@/lib/site"
import { ShareActions } from "@/components/share-actions"
import DocumentUnavailable from "./document-not-found"
import { headingId } from "@/lib/headings"
import { selectDocument, documentLanguageName } from "@/lib/documents"
import { DocumentLanguageSwitcher } from "@/components/document-language-switcher"
import Link from "next/link"
import { getEntryTopics, topicNames } from "@/lib/topics"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ArrowUpRight, ChevronDown, Github, MonitorPlay } from "lucide-react"
import { getAllEntries, getAllRecipes, getEntry, getRelatedEntries, buildPrimaryPrompt } from "@/lib/recipes"
import { getRecipeSummaries } from "@/lib/showcase"
import { RecipeBackLink } from "@/components/recipe-back-link"
import { RecipeStartActions } from "@/components/recipe-start-actions"
import { RecipeDocument } from "@/components/recipe-document"
import { Markdown } from "@/components/markdown"
import { RecipePreview } from "@/components/recipe-preview"
import { RecipeOutline } from "@/components/recipe-outline"
import { RecipeAuthor } from "@/components/recipe-author"
import { IconButton } from "@/components/ui/icon-button"
import { ButtonGroup } from "@/components/ui/button-group"
import { getT, getMessages, localizeEntry } from "@/lib/i18n"
import { locales, localePath, type Locale } from "@/lib/locales"
import { RelatedEntryLink } from "@/components/related-entry-link"
import { Badge } from "@/components/ui/badge"

type Params = { slug: string; locale?: Locale; documentLocale?: string }

export function generateStaticParams(): Params[] {
  return getAllEntries().map(recipe => ({ slug: recipe.slug }))
}

export function generateDocumentStaticParams() {
  return getAllRecipes().flatMap(entry => {
    const versions = Object.keys(entry.documentLanguages?.versions ?? {})
    return entry.documentLanguages ? [...new Set(["original", ...locales, ...versions])].map(documentLocale => ({ slug: entry.slug, documentLocale })) : []
  })
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug, locale = "en", documentLocale } = await params
  const source = getEntry(slug)
  const t = getT(locale)
  if (!source) return { title: t("Recipe not found") }
  const recipe = localizeEntry(source, locale)
  const selected = selectDocument(source, locale, documentLocale).document
  const unavailable = Boolean(documentLocale && !selected)
  const markdownUrl = selected && selected.rawUrl !== source.recipeDocument.rawUrl ? selected.rawUrl : `/recipes/${slug}/index.md`
  return {
    title: unavailable ? t("This guide version is unavailable") : recipe.title,
    description: recipe.tagline,
    ...(unavailable ? { robots: { index: false, follow: true } } : {}),
    alternates: { canonical: localePath(`/recipes/${slug}`, locale), languages: Object.fromEntries(locales.map(value => [value, localePath(`/recipes/${slug}`, value)])), ...(recipe.recipeUrl && !unavailable ? { types: { "text/markdown": markdownUrl } } : {}) },
    ...socialMetadata({ title: recipe.title, description: recipe.tagline, path: localePath(`/recipes/${slug}`, locale), locale, image: recipe.media?.thumbnail, type: "article" }),
  }
}

function guideSections(markdown: string) {
  const sections: { title: string; id: string }[] = []
  let fence = ""
  for (const line of markdown.split("\n")) {
    const marker = line.trimStart().match(/^(`{3,}|~{3,})/)
    if (marker) { if (!fence) fence = marker[1][0]; else if (fence === marker[1][0]) fence = ""; continue }
    if (fence) continue
    const heading = line.match(/^##\s+(.+?)\s*#*$/)
    if (!heading) continue
    const title = heading[1].replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/<[^>]+>|[*_`]/g, "").trim()
    const id = headingId(title)
    if (id && !sections.some(section => section.id === id)) sections.push({ title, id })
  }
  return sections.slice(0, 8)
}

export default async function RecipePage({ params }: { params: Promise<Params> }) {
  const { slug, locale = "en", documentLocale } = await params
  const source = getEntry(slug)
  if (!source) notFound()
  const selected = selectDocument(source, locale, documentLocale)
  if (documentLocale && !selected.document) return <DocumentUnavailable />
  const selectedDocument = selected.document ?? source.recipeDocument
  const recipe = { ...localizeEntry(source, locale), recipeDocument: selectedDocument, primaryPrompt: buildPrimaryPrompt(source, selectedDocument) }
  const t = getT(locale)
  const languageName = documentLanguageName(selected.language)
  const options = [
    { key: "auto", label: "Automatic for website language" },
    { key: "original", label: `${documentLanguageName(source.documentLanguages?.originalLanguage)} · ${t("Submitted original")}` },
    ...Object.entries(source.documentLanguages?.versions ?? {}).map(([key, document]) => ({ key, label: documentLanguageName(document.language), unavailable: Boolean(document.fetchError || !document.markdown) })),
  ]
  const summary = getRecipeSummaries(locale).find(entry => entry.slug === slug)!
  const related = getRelatedEntries(slug, 3).map(entry => localizeEntry(entry, locale))
  const sections = guideSections(recipe.recipeDocument.markdown)
  const command = `agora init my-${slug} --recipe ${slug}`

  return <article className="recipe-detail">
    <header className="detail-hero">
      <div className="shell">
        <RecipeBackLink topics={topicNames(locale)} />
        <div className={summary.showcase ? "detail-overview detail-overview--media" : "detail-overview"}>
          <div className="detail-overview__content">
            <h1 className="hero-title">{recipe.title}</h1>
            <p className="detail-description">{recipe.tagline}</p>
            <div className="detail-meta detail-meta--recipe"><span>{recipe.platforms.join(" / ")}</span>{recipe.difficulty && <span>{t(recipe.difficulty)}</span>}<RecipeAuthor name={recipe.author} /></div>
            <div className="detail-actions detail-actions--recipe">
              {recipe.recipeUrl && <RecipeStartActions prompt={recipe.primaryPrompt} command={recipe.cli ? command : undefined} />}
              <ButtonGroup className="recipe-material-actions" aria-label={t("Available materials")}>
                {recipe.demoUrl && <IconButton asChild variant="outline" label={t("Try demo (opens in a new tab)")}><a href={recipe.demoUrl} data-material="demo" target="_blank" rel="noreferrer"><MonitorPlay aria-hidden="true" /></a></IconButton>}
                {recipe.mainRepoUrl && <IconButton asChild variant="outline" label={t("Source on GitHub (opens in a new tab)")}><a href={recipe.mainRepoUrl} data-material="source" target="_blank" rel="noreferrer"><Github aria-hidden="true" /></a></IconButton>}
              </ButtonGroup>
              <ShareActions url={absoluteUrl(localePath(`/recipes/${slug}`, locale))} title={recipe.title} compact />
            </div>
          </div>
          <RecipePreview recipe={summary} />
        </div>
      </div>
    </header>
    <div className="shell detail-layout">
      <div className="detail-main">{recipe.recipeUrl ? <>
        <section id="recipe-markdown-heading" aria-labelledby="recipe-guide-heading" className="recipe-guide">
          <h2 id="recipe-guide-heading" className="sr-only">{t("Implementation guide")}</h2>
          {sections.length > 0 && <details className="mobile-guide-outline ag-disclosure"><summary>{t("In this guide")}<ChevronDown size={15} aria-hidden="true" /></summary><nav aria-label={t("Guide contents on mobile")}>{sections.map(section => <a key={section.id} href={`#${section.id}`}>{section.title}</a>)}</nav></details>}
          <RecipeDocument markdown={recipe.recipeDocument.markdown} rawUrl={recipe.recipeDocument.rawUrl} sourceUrl={recipe.recipeDocument.viewUrl}
            languageControl={options.length > 2 ? <DocumentLanguageSwitcher key="document-language" slug={slug} selected={selected.manual ? selected.key : "auto"} label={t(languageName)}
              description={`${t("Document language: {language}", { language: t(languageName) })}${!selected.manual && selected.language && selected.language !== locale ? ` · ${t("The requested language is unavailable; showing the available author version.")}` : ""}`} options={options} /> : undefined}>

            {recipe.recipeDocument.markdown ? <div lang={selected.language}><Markdown messages={getMessages(locale)} source={recipe.recipeDocument.markdown} sourceUrl={recipe.recipeDocument.viewUrl} headingOffset={1} /></div> : <div className="recipe-document-error"><h3>{t("The guide couldn’t be loaded")}</h3><p>{t("You can still copy the recipe prompt or open the implementation on GitHub.")}</p><a href={selectedDocument.viewUrl || recipe.recipeUrl} target="_blank" rel="noreferrer">{t("Open source guide")}<ArrowUpRight size={14} aria-hidden="true" /></a></div>}
          </RecipeDocument>
        </section>
      </> : <section className="recipe-about"><h2>{t("About this project")}</h2><p>{recipe.description}</p></section>}</div>
      <aside className="detail-rail" aria-label={t("Recipe information")}>
        {sections.length > 0 && <RecipeOutline sections={sections} />}
        <section className="recipe-about" aria-labelledby="recipe-about-heading"><h2 id="recipe-about-heading">{t(recipe.recipeUrl ? "About this recipe" : "About this project")}</h2><dl><div><dt>{t("Author")}</dt><dd><RecipeAuthor name={recipe.author} /></dd></div><div><dt>{t("Updated")}</dt><dd>{new Date(`${recipe.updated}T00:00:00Z`).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" })}</dd></div>{recipe.difficulty && <div><dt>{t("Difficulty")}</dt><dd>{t(recipe.difficulty)}</dd></div>}</dl></section>
        <details className="recipe-metadata ag-disclosure"><summary>{t("Use cases & capabilities")}<ChevronDown size={14} aria-hidden="true" /></summary><div className="recipe-metadata__tags">{[...new Set([...recipe.useCases, ...recipe.capabilities])].map(value => <Badge key={value} variant="outline">{t(value)}</Badge>)}</div></details>
        {getEntryTopics(slug).length > 0 && <section className="related-recipes"><h2>{t("In these Topics")}</h2>{getEntryTopics(slug).map(topic => <Link key={topic.slug} href={localePath(`/topics/${topic.slug}`, locale)}>{t(topic.title)}<ArrowUpRight size={14} aria-hidden="true" /></Link>)}</section>}
        {related.length > 0 && <section className="related-recipes"><h2>{t("Related projects and recipes")}</h2>{related.map(entry => <RelatedEntryLink key={entry.slug} slug={entry.slug} title={entry.title} />)}</section>}
      </aside>
    </div>
  </article>
}
