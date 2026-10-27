import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ArrowUpRight, ChevronDown } from "lucide-react"
import { getAllRecipes, getRecipe, getRelatedRecipes } from "@/lib/recipes"
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
import { Badge } from "@/components/ui/badge"

type Params = { slug: string }

export function generateStaticParams(): Params[] {
  return getAllRecipes().map(recipe => ({ slug: recipe.slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const recipe = getRecipe(slug)
  if (!recipe) return { title: "Recipe not found" }
  return {
    title: recipe.title,
    description: recipe.tagline,
    alternates: { canonical: `/recipes/${slug}`, types: { "text/markdown": `/recipes/${slug}/index.md` } },
    openGraph: { title: recipe.title, description: recipe.tagline, type: "article" },
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
    const id = title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-")
    if (id && !sections.some(section => section.id === id)) sections.push({ title, id })
  }
  return sections.slice(0, 8)
}

export default async function RecipePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const recipe = getRecipe(slug)
  if (!recipe) notFound()
  const summary = getRecipeSummaries().find(entry => entry.slug === slug)!
  const related = getRelatedRecipes(slug, 3)
  const sections = guideSections(recipe.recipeDocument.markdown)
  const command = `agora init my-${slug} --recipe ${slug}`

  return <article className="recipe-detail">
    <header className="detail-hero">
      <div className="shell">
        <RecipeBackLink />
        <div className={summary.showcase ? "detail-overview detail-overview--media" : "detail-overview"}>
          <div className="detail-overview__content">
            <h1 className="hero-title">{recipe.title}</h1>
            <p className="detail-description">{recipe.tagline}</p>
            <div className="detail-meta"><Badge variant="outline">{recipe.platforms.join(" / ")}</Badge><Badge variant="outline">{recipe.difficulty}</Badge><RecipeAuthor name={recipe.author} /></div>
            <div className="detail-actions">
              <CopyTextButton text={recipe.primaryPrompt} label="Copy recipe prompt" subject="Recipe prompt" primary />
              {recipe.demoUrl && <Button asChild variant="outline"><a href={recipe.demoUrl} target="_blank" rel="noreferrer" aria-label="Try demo (opens in a new tab)">Try demo<ArrowUpRight aria-hidden="true" /></a></Button>}
              <Button asChild variant="ghost"><a href={recipe.mainRepoUrl} target="_blank" rel="noreferrer" aria-label="Source on GitHub (opens in a new tab)">GitHub<ArrowUpRight aria-hidden="true" /></a></Button>
            </div>
            <p className="detail-agent-hint">Paste the prompt into Cursor, Claude Code, or your coding agent.</p>
          </div>
          <RecipePreview recipe={summary} />
        </div>
        <nav className="detail-jump-nav" aria-label="Recipe sections">
          <Button asChild variant="ghost" size="sm"><a href="#build">Build with agent</a></Button><Button asChild variant="ghost" size="sm"><a href="#recipe-markdown-heading">Implementation guide</a></Button>{recipe.cli && <Button asChild variant="ghost" size="sm"><a href="#recipe-cli">Agora CLI</a></Button>}
        </nav>
      </div>
    </header>
    <div className="shell detail-layout">
      <div className="detail-main">
        <section id="build" aria-labelledby="prompt-heading" className="recipe-start">
          <h2 id="prompt-heading" className="sr-only">Build with your coding agent</h2>
          <details className="recipe-disclosure ag-disclosure"><summary>View recipe prompt<ChevronDown size={15} aria-hidden="true" /></summary><CopyPrompt prompt={recipe.primaryPrompt} /></details>
          {recipe.cli && <details id="recipe-cli" className="recipe-disclosure ag-disclosure"><summary>Start with Agora CLI<ChevronDown size={15} aria-hidden="true" /></summary><p className="recipe-cli-hint">Clone this recipe and configure it with an Agora project.</p><CodePanel code={command} label="Agora CLI" /></details>}
        </section>
        <section aria-labelledby="recipe-markdown-heading" className="recipe-guide">
          <div className="recipe-guide__heading"><h2 id="recipe-markdown-heading" className="detail-title">Implementation guide</h2><Button asChild variant="ghost" size="sm"><a href={recipe.recipeDocument.viewUrl} target="_blank" rel="noreferrer">View on GitHub<ArrowUpRight aria-hidden="true" /></a></Button></div>
          {sections.length > 0 && <details className="mobile-guide-outline ag-disclosure"><summary>In this guide<ChevronDown size={15} aria-hidden="true" /></summary><nav aria-label="Guide contents on mobile">{sections.map(section => <a key={section.id} href={`#${section.id}`}>{section.title}</a>)}</nav></details>}
          <RecipeDocument markdown={recipe.recipeDocument.markdown} rawUrl={recipe.recipeDocument.rawUrl}>
            {recipe.recipeDocument.markdown ? <Markdown source={recipe.recipeDocument.markdown} sourceUrl={recipe.recipeDocument.viewUrl} headingOffset={1} /> : <div className="recipe-document-error"><h3>The guide couldn’t be loaded</h3><p>You can still copy the recipe prompt or open the implementation on GitHub.</p><a href={recipe.recipeUrl} target="_blank" rel="noreferrer">Open source guide<ArrowUpRight size={14} aria-hidden="true" /></a></div>}
          </RecipeDocument>
        </section>
      </div>
      <aside className="detail-rail" aria-label="Recipe information">
        {sections.length > 0 && <RecipeOutline sections={sections} />}
        <section className="recipe-about" aria-labelledby="recipe-about-heading"><h2 id="recipe-about-heading">About this recipe</h2><dl><div><dt>Author</dt><dd><RecipeAuthor name={recipe.author} /></dd></div><div><dt>Updated</dt><dd>{new Date(recipe.updated).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</dd></div><div><dt>Difficulty</dt><dd>{recipe.difficulty}</dd></div></dl></section>
        <details className="recipe-metadata ag-disclosure"><summary>Topics & capabilities<ChevronDown size={14} aria-hidden="true" /></summary><div className="recipe-metadata__tags">{[...new Set([...recipe.useCases, ...recipe.capabilities])].map(value => <Badge key={value} variant="outline">{value}</Badge>)}</div></details>
        {related.length > 0 && <section className="related-recipes"><h2>Related recipes</h2>{related.map(entry => <Link prefetch={false} key={entry.slug} href={`/recipes/${entry.slug}`}>{entry.title}<ArrowUpRight size={14} aria-hidden="true" /></Link>)}</section>}
      </aside>
    </div>
  </article>
}
