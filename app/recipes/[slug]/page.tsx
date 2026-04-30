import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import {
  ArrowLeft,
  ArrowUpRight,
  ExternalLink,
  Github,
  FileText,
  Calendar,
  User,
  Layers,
} from "lucide-react"

import { recipes, getRecipe } from "@/lib/recipes"
import { Button } from "@/components/ui/button"
import { Markdown } from "@/components/markdown"
import { CopyPrompt } from "@/components/copy-prompt"
import { PlatformBadge } from "@/components/platform-badge"
import { Waveform } from "@/components/waveform"

type Params = { slug: string }

export function generateStaticParams(): Params[] {
  return recipes.map((r) => ({ slug: r.slug }))
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

  return (
    <article>
      {/* Hero */}
      <header className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-grid bg-grid-fade pointer-events-none" aria-hidden="true" />
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 h-[420px] w-[820px] rounded-full bg-primary/12 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <Link
            href="/#recipes"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            All recipes
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {recipe.platforms.map((p) => (
              <PlatformBadge key={p} platform={p} />
            ))}
            <span className="inline-flex items-center rounded-md border border-border bg-background/60 px-1.5 py-0.5 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              {recipe.difficulty}
            </span>
          </div>

          <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-balance leading-tight">
            {recipe.title}
          </h1>
          <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-2xl text-pretty leading-relaxed">
            {recipe.tagline}
          </p>

          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" className="gap-2 h-11">
              <Link href={recipe.demoUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Open live demo
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2 h-11">
              <Link href={recipe.githubUrl} target="_blank" rel="noreferrer">
                <Github className="h-4 w-4" aria-hidden="true" />
                Source on GitHub
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="gap-2 h-11">
              <Link href={recipe.agentMdRawUrl} target="_blank" rel="noreferrer">
                <FileText className="h-4 w-4" aria-hidden="true" />
                Raw Agent.md
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          {/* Animated waveform accent */}
          <div className="mt-8 h-10 max-w-md" aria-hidden="true">
            <Waveform bars={40} />
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 lg:gap-14">
          {/* Main column */}
          <div className="min-w-0 flex flex-col gap-8">
            <CopyPromptSection rawUrl={recipe.agentMdRawUrl} />

            <section aria-labelledby="agent-md-heading">
              <div className="flex items-center justify-between mb-4">
                <h2
                  id="agent-md-heading"
                  className="text-xl font-semibold tracking-tight"
                >
                  Agent.md
                </h2>
                <Link
                  href={recipe.agentMdRawUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
                >
                  view raw
                  <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              </div>
              <div className="rounded-xl border border-border bg-card px-5 sm:px-7 py-6">
                <Markdown source={recipe.agentMd} />
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-20 self-start flex flex-col gap-6">
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
                    className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-0.5 text-xs text-muted-foreground"
                  >
                    {u}
                  </span>
                ))}
              </div>
            </SidebarSection>

            <SidebarSection title="Capabilities">
              <div className="flex flex-wrap gap-1.5">
                {recipe.features.map((f) => (
                  <span
                    key={f}
                    className="inline-flex items-center rounded-full border border-primary/30 bg-primary/5 px-2.5 py-0.5 text-xs text-primary"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </SidebarSection>

            <RelatedRecipes currentSlug={recipe.slug} />
          </aside>
        </div>
      </div>
    </article>
  )
}

function CopyPromptSection({ rawUrl }: { rawUrl: string }) {
  return (
    <section aria-labelledby="prompt-heading" className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h2 id="prompt-heading" className="text-xl font-semibold tracking-tight">
          One-line prompt
        </h2>
        <span className="text-xs text-muted-foreground">
          Paste into Cursor, Claude Code, v0, or any AI coding agent
        </span>
      </div>
      <CopyPrompt rawUrl={rawUrl} />
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
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
    <div className="flex items-center justify-between gap-3 py-1.5 border-b border-border/60 last:border-b-0 text-sm">
      <span className="inline-flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </span>
      <span className="text-foreground">{value}</span>
    </div>
  )
}

function RelatedRecipes({ currentSlug }: { currentSlug: string }) {
  const current = getRecipe(currentSlug)
  if (!current) return null

  const scored = recipes
    .filter((r) => r.slug !== currentSlug)
    .map((r) => {
      const featureOverlap = r.features.filter((f) => current.features.includes(f)).length
      const useCaseOverlap = r.useCases.filter((u) => current.useCases.includes(u)).length
      return { recipe: r, score: featureOverlap * 2 + useCaseOverlap * 3 }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => s.recipe)

  if (scored.length === 0) return null

  return (
    <SidebarSection title="Related recipes">
      <ul className="flex flex-col gap-1.5">
        {scored.map((r) => (
          <li key={r.slug}>
            <Link
              href={`/recipes/${r.slug}`}
              className="group flex items-start justify-between gap-2 rounded-md px-2 -mx-2 py-1.5 hover:bg-muted/60 transition-colors"
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
