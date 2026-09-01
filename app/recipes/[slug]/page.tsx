import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import type * as React from "react"
import {
  ArrowLeft,
  ArrowUpRight,
  Github,
  FileText,
  Calendar,
  User,
  Layers,
  LinkIcon,
  Linkedin,
  MessageSquare,
  Play,
  Twitter,
  Youtube,
} from "lucide-react"

import {
  getAllRecipes,
  getRecipe,
  getRelatedRecipes,
} from "@/lib/recipes"
import type { RecipePreviewLink } from "@/lib/recipes"
import { Button } from "@/components/ui/button"
import { CopyPrompt } from "@/components/copy-prompt"
import { CopyMarkdownButton } from "@/components/copy-markdown-button"
import { Markdown } from "@/components/markdown"
import { PlatformBadge } from "@/components/platform-badge"

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

          <h1 className="font-brand mt-4 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-balance leading-tight">
            {recipe.title}
          </h1>
          <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-2xl text-pretty leading-relaxed">
            {recipe.tagline}
          </p>

          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" className="gap-2 h-11">
              <Link href={recipe.mainRepoUrl} target="_blank" rel="noreferrer">
                <Github className="h-4 w-4" aria-hidden="true" />
                Source on GitHub
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2 h-11">
              <Link
                href={recipe.recipeDocument.rawUrl}
                target="_blank"
                rel="noreferrer"
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
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10 lg:gap-14">
          {/* Main column */}
          <div className="min-w-0 flex flex-col gap-8">
            <CopyPromptSection
              prompt={recipe.primaryPrompt}
            />

            <RecipeMarkdownSection
              markdown={recipe.recipeDocument.markdown}
              rawUrl={recipe.recipeDocument.rawUrl}
              fetchError={recipe.recipeDocument.fetchError}
            />

            <PreviewLinksSection links={recipe.previewLinks ?? []} />
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
                {recipe.capabilities.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center rounded-full border border-primary/30 bg-primary/5 px-2.5 py-0.5 text-xs text-primary"
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
            )}
          </aside>
        </div>
      </div>
    </article>
  )
}

function PreviewLinksSection({ links }: { links: RecipePreviewLink[] }) {
  if (links.length === 0) return null

  return (
    <section aria-labelledby="preview-links-heading" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2
          id="preview-links-heading"
          className="font-brand text-xl font-semibold tracking-tight"
        >
          Demos and posts
        </h2>
        <p className="text-sm text-muted-foreground">
          Videos, launches, and community discussions for this recipe.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <PreviewLinkCard key={`${link.url}-${link.title}`} link={link} />
        ))}
      </div>
    </section>
  )
}

function PreviewLinkCard({ link }: { link: RecipePreviewLink }) {
  const embedUrl = getYoutubeEmbedUrl(link.url)
  const host = getHostName(link.url)
  const label = getPreviewLinkLabel(link)

  if (embedUrl) {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-card sm:col-span-2">
        <div className="aspect-video bg-muted">
          <iframe
            className="h-full w-full"
            src={embedUrl}
            title={link.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{link.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{host}</p>
          </div>
          <Button asChild size="sm" variant="outline" className="gap-2">
            <Link href={link.url} target="_blank" rel="noreferrer">
              Open
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const Icon = getPreviewLinkIcon(link)

  return (
    <Link
      href={link.url}
      target="_blank"
      rel="noreferrer"
      className="group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-foreground/20 hover:bg-muted/30"
    >
      {link.imageUrl && (
        <span className="block aspect-video overflow-hidden border-b border-border bg-muted">
          <img
            src={link.imageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </span>
      )}
      <span className="flex min-h-28 items-start gap-3 p-4">
        <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground group-hover:text-foreground">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-3">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </span>
            <ArrowUpRight
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
              aria-hidden="true"
            />
          </span>
          <span className="mt-2 block text-sm font-medium leading-snug text-foreground">
            {link.title}
          </span>
          {link.description && (
            <span className="mt-2 line-clamp-2 block text-xs leading-relaxed text-muted-foreground">
              {link.description}
            </span>
          )}
          <span className="mt-2 block break-all text-xs text-muted-foreground">
            {host}
          </span>
        </span>
      </span>
    </Link>
  )
}

function RecipeMarkdownSection({
  markdown,
  rawUrl,
  fetchError,
}: {
  markdown: string
  rawUrl: string
  fetchError?: string
}) {
  return (
    <section aria-labelledby="recipe-markdown-heading" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2
            id="recipe-markdown-heading"
            className="font-brand text-xl font-semibold tracking-tight"
          >
            Recipe
          </h2>
          <p className="text-sm text-muted-foreground">
            Rendered from the configured recipe markdown.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline" className="gap-2">
            <Link href={rawUrl} target="_blank" rel="noreferrer">
              <FileText className="h-4 w-4" aria-hidden="true" />
              Raw
            </Link>
          </Button>
          <CopyMarkdownButton markdown={markdown} />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card px-5 py-5">
        {markdown ? (
          <Markdown source={markdown} />
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
      </div>
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
        <h2 id="prompt-heading" className="font-brand text-xl font-semibold tracking-tight">
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

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function getYoutubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.replace(/^www\./, "").replace(/^m\./, "")
    let videoId: string | null = null

    if (hostname === "youtu.be") {
      videoId = parsed.pathname.split("/").filter(Boolean)[0] ?? null
    }

    if (
      hostname === "youtube.com" ||
      hostname === "youtube-nocookie.com"
    ) {
      if (parsed.pathname === "/watch") {
        videoId = parsed.searchParams.get("v")
      } else if (
        parsed.pathname.startsWith("/shorts/") ||
        parsed.pathname.startsWith("/embed/")
      ) {
        videoId = parsed.pathname.split("/").filter(Boolean)[1] ?? null
      }
    }

    if (!videoId || !/^[a-zA-Z0-9_-]+$/.test(videoId)) return null
    return `https://www.youtube-nocookie.com/embed/${videoId}`
  } catch {
    return null
  }
}

function getHostName(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

function getPreviewLinkLabel(link: RecipePreviewLink): string {
  const type = getPreviewLinkType(link)
  const labels: Record<NonNullable<RecipePreviewLink["type"]>, string> = {
    youtube: "YouTube",
    linkedin: "LinkedIn",
    x: "X",
    reddit: "Reddit",
    demo: "Demo",
    article: "Article",
    other: "Link",
  }

  return labels[type]
}

function getPreviewLinkIcon(
  link: RecipePreviewLink,
): React.ComponentType<{ className?: string }> {
  const type = getPreviewLinkType(link)
  const icons: Record<
    NonNullable<RecipePreviewLink["type"]>,
    React.ComponentType<{ className?: string }>
  > = {
    youtube: Youtube,
    linkedin: Linkedin,
    x: Twitter,
    reddit: MessageSquare,
    demo: Play,
    article: FileText,
    other: LinkIcon,
  }

  return icons[type]
}

function getPreviewLinkType(
  link: RecipePreviewLink,
): NonNullable<RecipePreviewLink["type"]> {
  if (link.type) return link.type

  try {
    const hostname = new URL(link.url).hostname.replace(/^www\./, "")
    if (hostname === "youtu.be" || hostname.endsWith("youtube.com")) {
      return "youtube"
    }
    if (hostname.endsWith("linkedin.com")) return "linkedin"
    if (hostname === "x.com" || hostname === "twitter.com") return "x"
    if (hostname.endsWith("reddit.com")) return "reddit"
  } catch {
    return "other"
  }

  return "other"
}
