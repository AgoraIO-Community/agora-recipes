import { ArrowUpRight } from "lucide-react"
import type { Recipe } from "@/lib/recipes"
import { PlatformBadgeList } from "@/components/platform-badge"
import { Waveform } from "@/components/waveform"
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
      {/* Top visual */}
      <div className="relative h-28 border-b border-border bg-gradient-to-br from-muted/30 via-muted/10 to-background overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40" aria-hidden="true" />
        <div className="absolute inset-0 flex items-center px-6">
          <Waveform bars={28} className="h-12 opacity-70 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="absolute top-3 right-3">
          <PlatformBadgeList platforms={recipe.platforms} />
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center rounded-md bg-background/90 backdrop-blur px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground border border-border">
            {recipe.difficulty}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold leading-snug tracking-tight text-balance">
            {recipe.title}
          </h3>
          <ArrowUpRight
            className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
            aria-hidden="true"
          />
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {recipe.tagline}
        </p>

        <div className="mt-auto pt-3 flex flex-wrap gap-1.5">
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
