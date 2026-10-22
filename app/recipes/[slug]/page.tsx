import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import type * as React from "react"
import {
  ArrowLeft,
  ArrowUpRight,
  FileText,
  Calendar,
  User,
  Layers,
} from "lucide-react"

import {
  getAllRecipes,
  getRecipe,
  getRelatedRecipes,
  type Recipe,
} from "@/lib/recipes"
import { Button } from "@/components/ui/button"
import { CopyPrompt } from "@/components/copy-prompt"
import { RecipeDocument } from "@/components/recipe-document"
import { CodePanel } from "@/components/code-panel"
import { Markdown } from "@/components/markdown"

type Params = { slug: string }

export function generateStaticParams(): Params[] {
  return getAllRecipes().map((r) => ({ slug: r.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const recipe = getRecipe(slug)
  if (!recipe) return { title: "Recipe not found" }
  return {
    title: recipe.title,
    description: recipe.tagline,
    openGraph: {
      title: recipe.title,
      description: recipe.tagline,
      type: "article",
    },
  }
}

export default async function RecipePage({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug } = await params
  const recipe = getRecipe(slug)
  if (!recipe) notFound()

  const related = getRelatedRecipes(recipe.slug, 3)

  return (
    <article className="recipe-detail">
      {/* Hero */}
      <header className="detail-hero">
        <div className="shell">
          <Link
            href="/#recipes"
            className="inline-flex min-h-[46px] items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            All recipes
          </Link>

          <p className="detail-meta">{recipe.platforms.join(" / ")} · {recipe.difficulty}</p>

          <h1 className="hero-title">
            {recipe.title}
          </h1>
          <p className="mt-5 text-base text-muted-foreground max-w-[55ch] text-pretty">
            {recipe.tagline}
          </p>

          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" className="gap-2 h-11">
              <Link href={recipe.mainRepoUrl} target="_blank" rel="noreferrer" aria-label="Source on GitHub (opens in a new tab)">
                Source on GitHub
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2 h-11">
              <Link
                href={recipe.recipeDocument.rawUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="View raw recipe (opens in a new tab)"
              >
                <FileText className="h-4 w-4" aria-hidden="true" />
                View raw recipe
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="shell detail-layout">
          {/* Main column */}
          <div className="detail-main">
            {recipe.cli ? <CliCommandSection slug={recipe.slug} /> : null}

            <CopyPromptSection
              prompt={recipe.primaryPrompt}
            />

            <RecipeMarkdownSection
              markdown={recipe.recipeDocument.markdown}
              sourceUrl={recipe.recipeDocument.viewUrl}
              fetchError={recipe.recipeDocument.fetchError}
            />
          </div>

          {/* Sidebar */}
          <aside className="detail-rail" aria-label="About this recipe">
            <SidebarSection title="About">
              <SidebarRow icon={User} label="Author" value={recipe.author} />
              <SidebarRow
                icon={Calendar}
                label="Updated"
                value={formatDate(recipe.updated)}
              />
              <SidebarRow
                icon={Layers}
                label="Difficulty"
                value={recipe.difficulty}
              />
            </SidebarSection>

            <SidebarSection title="Use cases">
              <div className="flex flex-wrap gap-1.5">
                {recipe.useCases.map((u) => (
                  <span
                    key={u}
                    className="metadata-chip"
                  >
                    {u}
                  </span>
                ))}
              </div>
            </SidebarSection>

            <SidebarSection title="Capabilities">
              <div className="flex flex-wrap gap-1.5">
                {recipe.capabilities.map((c) => (
                  <span
                    key={c}
                    className="metadata-chip"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </SidebarSection>

            {related.length > 0 && (
              <SidebarSection title="Related recipes">
                <ul className="flex flex-col gap-1.5">
                  {related.map((r) => (
                    <li key={r.slug}>
                      <Link
                        href={`/recipes/${r.slug}`}
                         className="group flex min-h-[46px] items-center justify-between gap-2 py-2 hover:text-[var(--signal-text)] transition-colors"
                      >
                        <span className="text-sm leading-snug">{r.title}</span>
                        <ArrowUpRight
                          className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </SidebarSection>
            )}
            <HowToUseRecipeSection recipe={recipe} />
          </aside>
      </div>
    </article>
  )
}

function HowToUseRecipeSection({ recipe }: { recipe: Recipe }) {
  const linkClassName = "text-[var(--signal-text)] underline underline-offset-4 hover:text-foreground"
  return (
    <SidebarSection title="How to use this recipe">
      <ol className="list-decimal space-y-3 pl-4 text-[13px] leading-relaxed text-muted-foreground">
        <li>
          Copy the <Link href="#prompt-heading" className={linkClassName}>recipe prompt</Link>
          {" "}into your coding agent, or clone the{" "}
          <Link href={recipe.mainRepoUrl} target="_blank" rel="noreferrer" className={linkClassName}>
            source repo
          </Link>.
        </li>
        <li>
          Follow the <Link href="#recipe-markdown-heading" className={linkClassName}>guide</Link>
          {" "}to install the required packages and add your Agora App ID and any
          API keys listed in the recipe.
        </li>
        <li>Run the example, test it, then customize it for your app.</li>
      </ol>
    </SidebarSection>
  )
}

function CliCommandSection({ slug }: { slug: string }) {
  const command = `agora init my-${slug} --recipe ${slug}`

  return (
    <section aria-labelledby="cli-command-heading" className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2
          id="cli-command-heading"
          className="scroll-mt-20 detail-title"
        >
          Use with Agora CLI
        </h2>
        <p className="text-base text-muted-foreground">
          Clone the recipe and configure it with an Agora project.
        </p>
      </div>
      <CodePanel code={command} label="Agora CLI" />
    </section>
  )
}

function RecipeMarkdownSection({
  markdown,
  sourceUrl,
  fetchError,
}: {
  markdown: string
  sourceUrl: string
  fetchError?: string
}) {
  return (
    <section aria-labelledby="recipe-markdown-heading" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2
            id="recipe-markdown-heading"
          className="scroll-mt-20 detail-title"
          >
            Recipe
          </h2>
          <p className="text-sm text-muted-foreground">
            Rendered from the configured recipe markdown.
          </p>
        </div>
      </div>

      <RecipeDocument markdown={markdown}>
        {markdown ? (
          <Markdown source={markdown} sourceUrl={sourceUrl} headingOffset={1} />
        ) : (
          <div className="text-sm text-muted-foreground">
            <p>Recipe markdown is not available in the generated artifact.</p>
            {fetchError && (
              <p className="mt-2 font-mono text-xs text-destructive break-words">
                {fetchError}
              </p>
            )}
          </div>
        )}
      </RecipeDocument>
    </section>
  )
}

function CopyPromptSection({
  prompt,
}: {
  prompt: string
}) {
  return (
    <section aria-labelledby="prompt-heading" className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h2 id="prompt-heading" className="scroll-mt-20 detail-title">
          Recipe prompt
        </h2>
        <span className="text-xs text-muted-foreground">
          Paste into Cursor, Claude Code, v0, or your coding agent
        </span>
      </div>
      <CopyPrompt prompt={prompt} />
    </section>
  )
}

function SidebarSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-2.5">
      <h3 className="eyebrow">
        {title}
      </h3>
      <div>{children}</div>
    </section>
  )
}

function SidebarRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="detail-row">
      <span className="inline-flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </span>
      <span className="text-foreground">{value}</span>
    </div>
  )
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
