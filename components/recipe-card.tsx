import { ArrowUpRight } from "lucide-react"
import type { Recipe } from "@/lib/recipes"
import { PlatformBadgeList } from "@/components/platform-badge"
import { cn } from "@/lib/utils"

export function RecipeCard({ recipe }: { recipe: Recipe }) {
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
          <h3 className="text-base font-semibold leading-snug tracking-tight text-balance">
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

        {/* Features */}
        <div className="mt-auto pt-3 border-t border-border/60 flex flex-wrap gap-1.5">
          {recipe.features.slice(0, 3).map((f) => (
            <span
              key={f}
              className="inline-flex items-center rounded-md border border-border bg-background px-1.5 py-0.5 text-[11px] text-muted-foreground"
            >
              {f}
            </span>
          ))}
          {recipe.features.length > 3 && (
            <span className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] text-muted-foreground">
              +{recipe.features.length - 3}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
