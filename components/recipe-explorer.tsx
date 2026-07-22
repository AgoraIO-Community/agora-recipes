"use client"

import * as React from "react"
import Link from "next/link"
import { Search, X, SlidersHorizontal } from "lucide-react"
import type { Recipe, FilterOptions, RecipeTag } from "@/lib/recipes"
import { Button } from "@/components/ui/button"
import { RecipeCard } from "@/components/recipe-card"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { cn } from "@/lib/utils"

type Filters = {
  query: string
  platforms: string[]
  useCases: string[]
  capabilities: string[]
}

const EMPTY_FILTERS: Filters = {
  query: "",
  platforms: [],
  useCases: [],
  capabilities: [],
}

const RECIPE_TYPES = [
  { tag: "voice-ai", label: "Voice AI" },
  { tag: "rtc", label: "RTC" },
] as const satisfies ReadonlyArray<{ tag: RecipeTag; label: string }>

function toggle<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
}

type Props = {
  recipes: Recipe[]
  filterOptions: FilterOptions
}

export function RecipeExplorer({ recipes, filterOptions }: Props) {
  const [activeTag, setActiveTag] = React.useState<RecipeTag>("voice-ai")
  const [filters, setFilters] = React.useState<Filters>(EMPTY_FILTERS)
  const [showAdvanced, setShowAdvanced] = React.useState(false)

  const activeRecipeType = RECIPE_TYPES.find(({ tag }) => tag === activeTag)!
  const taggedRecipes = React.useMemo(
    () => recipes.filter((recipe) => recipe.tags.includes(activeTag)),
    [activeTag, recipes],
  )

  const filtered = React.useMemo(() => {
    const q = filters.query.trim().toLowerCase()
    return taggedRecipes.filter((r) => {
      if (q) {
        const haystack =
          `${r.title} ${r.tagline} ${r.description} ${r.capabilities.join(" ")} ${r.useCases.join(" ")}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (filters.platforms.length && !filters.platforms.some((p) => r.platforms.includes(p))) {
        return false
      }
      if (filters.useCases.length && !filters.useCases.some((u) => r.useCases.includes(u))) {
        return false
      }
      if (
        filters.capabilities.length &&
        !filters.capabilities.every((c) => r.capabilities.includes(c))
      ) {
        return false
      }
      return true
    })
  }, [filters, taggedRecipes])

  const totalActive =
    filters.platforms.length +
    filters.useCases.length +
    filters.capabilities.length +
    (filters.query ? 1 : 0)

  return (
    <section
      id="recipes"
      aria-labelledby="recipes-heading"
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16"
    >
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2
            id="recipes-heading"
            className="font-brand text-2xl sm:text-3xl font-semibold tracking-tight text-balance"
          >
            Browse Recipes:
          </h2>
          <div
            role="group"
            aria-label="Recipe type"
            className="inline-flex h-9 items-center rounded-lg border border-border bg-muted/50 p-0.5"
          >
            {RECIPE_TYPES.map(({ tag, label }) => {
              const active = tag === activeTag
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(tag)}
                  aria-pressed={active}
                  className={cn(
                    "h-full rounded-md px-3 text-sm transition-colors",
                    active
                      ? "bg-foreground text-background font-medium shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
        <p className="text-muted-foreground text-pretty max-w-2xl">
          Find working samples by platform, use case, or capability.
        </p>
      </div>

      {/* Search + platform pills */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <label className="relative flex-1">
            <span className="sr-only">Search recipes</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              value={filters.query}
              onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
              placeholder="Search recipes, e.g. 'translation' or 'function calling'"
              className={cn(
                "h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm",
                "placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring/50 transition-colors",
              )}
            />
          </label>

          <div className="flex items-center gap-2">
            <div
              role="group"
              aria-label="Filter by platform"
              className="inline-flex h-10 items-center rounded-lg border border-border bg-background p-0.5"
            >
              {filterOptions.platforms.map((p) => {
                const active = filters.platforms.includes(p)
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() =>
                      setFilters((f) => ({ ...f, platforms: toggle(f.platforms, p) }))
                    }
                    aria-pressed={active}
                    className={cn(
                      "h-full px-3 text-sm rounded-md transition-colors",
                      active
                        ? "bg-foreground text-background font-medium"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {p}
                  </button>
                )
              })}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-10 gap-1.5"
              aria-expanded={showAdvanced}
              onClick={() => setShowAdvanced((v) => !v)}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              Filters
              {totalActive > 0 && (
                <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                  {totalActive}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Advanced filter row */}
        {showAdvanced && (
          <div className="rounded-xl border border-border bg-card/50 p-4 flex flex-col gap-4">
            <FilterGroup
              label="Use case"
              options={filterOptions.useCases}
              selected={filters.useCases}
              onToggle={(v) =>
                setFilters((f) => ({ ...f, useCases: toggle(f.useCases, v) }))
              }
            />
            <FilterGroup
              label="Capability"
              hint="Recipes must include all selected capabilities"
              options={filterOptions.capabilities}
              selected={filters.capabilities}
              onToggle={(v) =>
                setFilters((f) => ({ ...f, capabilities: toggle(f.capabilities, v) }))
              }
            />
            {totalActive > 0 && (
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setFilters(EMPTY_FILTERS)}
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  Clear all
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Result meta */}
      <div className="flex items-center justify-between mb-5 text-sm text-muted-foreground">
        <p aria-live="polite">
          Showing <span className="text-foreground font-medium">{filtered.length}</span>{" "}
          of {taggedRecipes.length} recipes
        </p>
        {totalActive > 0 && !showAdvanced && (
          <button
            type="button"
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" aria-hidden="true" />
            Reset filters
          </button>
        )}
      </div>

      {taggedRecipes.length === 0 ? (
        <Empty className="border border-dashed rounded-xl">
          <EmptyHeader>
            <EmptyTitle>No {activeRecipeType.label} recipes yet</EmptyTitle>
            <EmptyDescription>
              {activeRecipeType.label} recipes will appear here as they are added.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : filtered.length === 0 ? (
        <Empty className="border border-dashed rounded-xl">
          <EmptyHeader>
            <EmptyTitle>No recipes match your filters</EmptyTitle>
            <EmptyDescription>
              Try removing a capability or broadening your search.
            </EmptyDescription>
          </EmptyHeader>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters(EMPTY_FILTERS)}
          >
            Clear filters
          </Button>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((recipe) => (
            <Link
              key={recipe.slug}
              href={`/recipes/${recipe.slug}`}
              className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
            >
              <RecipeCard recipe={recipe} />
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

function FilterGroup({
  label,
  hint,
  options,
  selected,
  onToggle,
}: {
  label: string
  hint?: string
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </h3>
        {hint && <span className="text-xs text-muted-foreground/80">{hint}</span>}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = selected.includes(opt)
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              aria-pressed={active}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:text-foreground hover:border-foreground/30",
              )}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}
