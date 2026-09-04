import { ArrowUpRight, BadgeCheck } from "lucide-react"
import type { Recipe } from "@/lib/recipes"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { PlatformBadgeList } from "@/components/platform-badge"
import { cn } from "@/lib/utils"

function getGithubOwner(repoUrl: string): string | null {
  try {
    const url = new URL(repoUrl)
    if (url.hostname !== "github.com") return null

    return url.pathname.split("/").filter(Boolean)[0] ?? null
  } catch {
    return null
  }
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const githubOwner = getGithubOwner(recipe.mainRepoUrl)
  const authorAvatarUrl = githubOwner
    ? `https://github.com/${githubOwner}.png?size=96`
    : null
  const isOfficialAuthor = recipe.author.trim().toLowerCase() === "agora"
  const authorRole = isOfficialAuthor ? "Official recipe" : "Community Contributor"

  return (
    <article
      className={cn(
        "relative h-full flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground transition-all",
        "group-hover:border-foreground/20 group-hover:shadow-lg group-hover:-translate-y-0.5",
        "group-focus-visible:border-foreground/30",
      )}
    >
      {/* Accent rail — animates in on hover, replaces the heavy top visual */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full"
      />

      <div className="flex-1 p-5 flex flex-col gap-4">
        {/* Top row: platforms + difficulty */}
        <div className="flex items-center justify-between gap-3">
          <PlatformBadgeList platforms={recipe.platforms} />
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {recipe.difficulty}
          </span>
        </div>

        {/* Title + arrow */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-brand text-base font-semibold leading-snug tracking-tight text-balance">
            {recipe.title}
          </h3>
          <ArrowUpRight
            className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
            aria-hidden="true"
          />
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {recipe.tagline}
        </p>

        <div className="mt-auto flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <Avatar className="size-9 border border-border bg-muted">
              {authorAvatarUrl && (
                <AvatarImage
                  src={authorAvatarUrl}
                  alt=""
                  referrerPolicy="no-referrer"
                />
              )}
              <AvatarFallback className="font-brand text-[11px] font-semibold text-muted-foreground">
                {getInitials(recipe.author)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 text-sm leading-tight">
              <p className="truncate text-foreground">
                <span className="text-muted-foreground">By </span>
                <span className="font-medium text-primary">{recipe.author}</span>
                <BadgeCheck
                  className="ml-1.5 inline size-3.5 align-[-2px] fill-primary text-primary-foreground"
                  aria-label={authorRole}
                />
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {authorRole}
              </p>
            </div>
          </div>

          {/* Capabilities */}
          <div className="border-t border-border/60 pt-3 flex flex-wrap gap-1.5">
            {recipe.capabilities.slice(0, 3).map((c) => (
              <span
                key={c}
                className="inline-flex items-center rounded-md border border-border bg-background px-1.5 py-0.5 text-[11px] text-muted-foreground"
              >
                {c}
              </span>
            ))}
            {recipe.capabilities.length > 3 && (
              <span className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] text-muted-foreground">
                +{recipe.capabilities.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
