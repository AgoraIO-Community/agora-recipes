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
import { ArrowUpRight, ChevronDown } from "lucide-react"
import { getAllEntries, getAllRecipes, getEntry, getRelatedEntries, buildPrimaryPrompt } from "@/lib/recipes"
import { getRecipeSummaries } from "@/lib/showcase"
import { RecipeBackLink } from "@/components/recipe-back-link"
import { CopyPrompt } from "@/components/copy-prompt"
import { RecipeDocument } from "@/components/recipe-document"
import { CodePanel, CopyTextButton } from "@/components/code-panel"
import { Markdown } from "@/components/markdown"
import { RecipePreview } from "@/components/recipe-preview"
import { RecipeOutline } from "@/components/recipe-outline"
import { RecipeAuthor } from "@/components/recipe-author"
import { Button } from "@/components/ui/button"
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
            <div className="detail-meta"><Badge variant="outline">{recipe.platforms.join(" / ")}</Badge>{recipe.difficulty && <Badge variant="outline">{t(recipe.difficulty)}</Badge>}<RecipeAuthor name={recipe.author} /></div>
            <div className="detail-actions">
              {recipe.recipeUrl && <CopyTextButton text={recipe.primaryPrompt} label="Copy recipe prompt" subject="Recipe prompt" primary />}
              {recipe.demoUrl && <Button asChild variant="outline"><a href={recipe.demoUrl} data-material="demo" target="_blank" rel="noreferrer" aria-label={t("Try demo (opens in a new tab)")}>{t("Try demo")}<ArrowUpRight aria-hidden="true" /></a></Button>}
              {recipe.mainRepoUrl && <Button asChild variant="ghost"><a href={recipe.mainRepoUrl} data-material="source" target="_blank" rel="noreferrer" aria-label={t("Source on GitHub (opens in a new tab)")}>GitHub<ArrowUpRight aria-hidden="true" /></a></Button>}
            </div>
            <ShareActions url={absoluteUrl(localePath(`/recipes/${slug}`, locale))} title={recipe.title} />
            {recipe.recipeUrl && <p className="detail-agent-hint">{t("Paste the prompt into Cursor, Claude Code, or your coding agent.")}</p>}
          </div>
          <RecipePreview recipe={summary} />
        </div>
        {recipe.recipeUrl && <nav className="detail-jump-nav" aria-label={t("Recipe sections")}>
          <Button asChild variant="ghost" size="sm"><a href="#build">{t("Build with agent")}</a></Button><Button asChild variant="ghost" size="sm"><a href="#recipe-markdown-heading">{t("Implementation guide")}</a></Button>{recipe.cli && <Button asChild variant="ghost" size="sm"><a href="#recipe-cli">Agora CLI</a></Button>}
        </nav>}
      </div>
    </header>
    <div className="shell detail-layout">
      <div className="detail-main">{recipe.recipeUrl ? <>
        <section id="build" aria-labelledby="prompt-heading" className="recipe-start">
          <h2 id="prompt-heading" className="sr-only">{t("Build with your coding agent")}</h2>
          <details className="recipe-disclosure ag-disclosure"><summary>{t("View recipe prompt")}<ChevronDown size={15} aria-hidden="true" /></summary><CopyPrompt prompt={recipe.primaryPrompt} /></details>
          {recipe.cli && <details id="recipe-cli" className="recipe-disclosure ag-disclosure"><summary>{t("Start with Agora CLI")}<ChevronDown size={15} aria-hidden="true" /></summary><p className="recipe-cli-hint">{t("Clone this recipe and configure it with an Agora project.")}</p><CodePanel code={command} label="Agora CLI" /></details>}
        </section>
        <section aria-labelledby="recipe-markdown-heading" className="recipe-guide">
          <div className="recipe-guide__heading"><h2 id="recipe-markdown-heading" className="detail-title">{t("Implementation guide")}</h2><Button asChild variant="ghost" size="sm"><a href={recipe.recipeDocument.viewUrl} data-material="source" data-placement="reader" target="_blank" rel="noreferrer">{t("View on GitHub")}<ArrowUpRight aria-hidden="true" /></a></Button></div>
          {options.length > 2 && <DocumentLanguageSwitcher slug={slug} selected={selected.manual ? selected.key : "auto"} options={options} />}
          <p className="recipe-source-note">{t("Document language: {language}", { language: t(languageName) })}{!selected.manual && selected.language && selected.language !== locale ? ` · ${t("The requested language is unavailable; showing the available author version.")}` : ""}</p>
          <p className="recipe-source-note">{t("Shown as published by its author; website language does not translate the source guide.")}</p>
          {selected.manual && !selectedDocument.markdown && <p role="alert">{t("This guide version is unavailable")}. {t("No other author version has been selected automatically.")}</p>}
          {sections.length > 0 && <details className="mobile-guide-outline ag-disclosure"><summary>{t("In this guide")}<ChevronDown size={15} aria-hidden="true" /></summary><nav aria-label={t("Guide contents on mobile")}>{sections.map(section => <a key={section.id} href={`#${section.id}`}>{section.title}</a>)}</nav></details>}
          <RecipeDocument markdown={recipe.recipeDocument.markdown} rawUrl={recipe.recipeDocument.rawUrl}>
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
