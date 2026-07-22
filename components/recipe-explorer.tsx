"use client"

import * as React from "react"
import Link from "next/link"
import {
  AudioLines,
  RadioTower,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react"
import type { Recipe, FilterOptionsByTag, RecipeTag } from "@/lib/recipes"
import { Button } from "@/components/ui/button"
import { AgoraLogo } from "@/components/agora-logo"
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
  {
    tag: "voice-ai",
    label: "Voice AI",
    description: "Agents & automation",
    icon: AudioLines,
  },
  {
    tag: "rtc",
    label: "RTC",
    description: "Voice, video & streaming",
    icon: RadioTower,
  },
] as const

function toggle<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
}

type Props = {
  recipes: Recipe[]
  filterOptionsByTag: FilterOptionsByTag
}

export function RecipeExplorer({ recipes, filterOptionsByTag }: Props) {
  const sectionRef = React.useRef<HTMLElement>(null)
  const resultsRef = React.useRef<HTMLDivElement>(null)
  const [activeTag, setActiveTag] = React.useState<RecipeTag>("voice-ai")
  const [filters, setFilters] = React.useState<Filters>(EMPTY_FILTERS)
  const [showAdvanced, setShowAdvanced] = React.useState(false)

  const activeRecipeType = RECIPE_TYPES.find(({ tag }) => tag === activeTag)!
  const taggedRecipes = React.useMemo(
    () => recipes.filter((recipe) => recipe.tags.includes(activeTag)),
    [activeTag, recipes],
  )
  const filterOptions = filterOptionsByTag[activeTag]
  const hasAdvancedFilterOptions =
    filterOptions.useCases.length > 0 || filterOptions.capabilities.length > 0

  function preserveDockedScrollRange() {
    const section = sectionRef.current
    if (
      !section ||
      !document.documentElement.hasAttribute("data-recipe-nav-active")
    ) {
      return
    }

    const lockedHeight = Number.parseFloat(section.style.minHeight) || 0
    section.style.minHeight = `${Math.max(lockedHeight, section.offsetHeight)}px`
    section.setAttribute("data-scroll-range-locked", "")
  }

  function updateFilters(next: React.SetStateAction<Filters>) {
    preserveDockedScrollRange()
    setFilters(next)
  }

  function selectRecipeType(tag: RecipeTag) {
    if (tag === activeTag) return
    preserveDockedScrollRange()
    setActiveTag(tag)
    setFilters(EMPTY_FILTERS)
    setShowAdvanced(false)
  }

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

  React.useLayoutEffect(() => {
    const section = sectionRef.current
    const results = resultsRef.current
    if (!section) return

    if (activeTag === "voice-ai" && totalActive === 0) {
      section.style.removeProperty("min-height")
      section.removeAttribute("data-scroll-range-locked")
      section.removeAttribute("data-pin-results")
      return
    }

    if (section.hasAttribute("data-scroll-range-locked") && results) {
      section.toggleAttribute(
        "data-pin-results",
        results.offsetHeight < window.innerHeight - 72,
      )
    }
  }, [activeTag, filtered.length, totalActive])

  return (
    <section
      ref={sectionRef}
      id="recipes"
      aria-labelledby="recipes-heading"
      className="mx-auto max-w-7xl scroll-mt-16 px-4 pb-16 sm:scroll-mt-20 sm:px-6 lg:px-8"
    >
      <span
        className="recipe-toolbar__sentinel -mb-px block h-px"
        aria-hidden="true"
      />
      <header className="recipe-toolbar sticky top-14 z-50 -mx-4 mb-5 sm:-mx-6 lg:-mx-8">
        <div className="recipe-toolbar__shell px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="recipe-toolbar__brand items-center gap-2.5 font-medium tracking-tight"
            aria-label="Agora Recipes home"
          >
            <AgoraLogo className="h-6 w-6 shrink-0 text-primary" />
            <span className="recipe-toolbar__brand-copy hidden items-baseline gap-1.5 sm:inline-flex">
              <span className="text-foreground">Agora</span>
              <span className="text-sm text-muted-foreground/80">/ Recipes</span>
            </span>
          </Link>
          <div className="recipe-toolbar__panel relative isolate overflow-hidden rounded-2xl border border-border/80 bg-card px-5 py-5 shadow-sm sm:px-6 sm:py-6">
        <div
          className="recipe-toolbar__decoration pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary/15 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="recipe-toolbar__decoration pointer-events-none absolute inset-0 bg-grid opacity-30 [mask-image:linear-gradient(to_right,transparent,black_75%)]"
          aria-hidden="true"
        />

        <div className="recipe-toolbar__layout relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="recipe-toolbar__intro max-w-md">
            <div className="recipe-toolbar__eyebrow mb-2 inline-flex items-center gap-1.5 overflow-hidden font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-primary">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              Recipe library
            </div>
            <h2
              id="recipes-heading"
              className="recipe-toolbar__title font-brand text-2xl font-semibold tracking-tight text-balance sm:text-3xl"
            >
              Browse Recipes:
            </h2>
            <p className="recipe-toolbar__description mt-1.5 overflow-hidden text-sm text-muted-foreground text-pretty sm:text-base">
              Choose a product, then find a working sample by platform, use case,
              or capability.
            </p>
          </div>

          <fieldset
            className="recipe-toolbar__types grid w-full grid-cols-2 gap-1.5 rounded-2xl border border-border/80 bg-muted/70 p-1.5 shadow-inner lg:w-auto"
          >
            <legend className="sr-only">Recipe type</legend>
            {RECIPE_TYPES.map(({ tag, label, description, icon: Icon }) => {
              const active = tag === activeTag
              const count = recipes.filter((recipe) => recipe.tags.includes(tag)).length
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => selectRecipeType(tag)}
                  aria-pressed={active}
                  aria-label={label}
                  className={cn(
                    "recipe-toolbar__type-button group/type relative flex min-w-0 items-center gap-2 rounded-xl border px-2.5 py-2.5 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-muted motion-reduce:transition-none sm:gap-3 sm:px-3.5 lg:min-w-60",
                    active
                      ? "border-primary/30 bg-background text-foreground shadow-lg shadow-primary/10"
                      : "border-transparent text-muted-foreground opacity-60 hover:bg-background/60 hover:text-foreground hover:opacity-100",
                  )}
                >
                  {active && (
                    <span
                      className="animate-pulse-soft pointer-events-none absolute inset-1 rounded-xl bg-primary/20 blur-lg"
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={cn(
                      "recipe-toolbar__type-icon relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-300 sm:h-10 sm:w-10",
                      active
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                        : "bg-background text-muted-foreground group-hover/type:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" aria-hidden="true" />
                  </span>
                  <span className="recipe-toolbar__type-copy relative min-w-0 flex-1">
                    <span className="recipe-toolbar__type-label block truncate text-sm font-semibold">
                      {label}
                    </span>
                    <span className="recipe-toolbar__type-description hidden truncate text-xs text-muted-foreground sm:block">
                      {description}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "recipe-toolbar__type-count relative hidden min-w-6 shrink-0 items-center justify-center rounded-full px-1.5 py-0.5 font-mono text-[10px] font-medium sm:inline-flex",
                      active
                        ? "bg-primary/10 text-primary"
                        : "bg-background text-muted-foreground",
                    )}
                    aria-label={`${count} recipes`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </fieldset>
        </div>
          </div>

          {/* Search + recipe facets */}
          <form
            aria-label="Filter recipes"
            className="recipe-toolbar__filters flex flex-col gap-3"
            onSubmit={(event) => event.preventDefault()}
          >
        <div className="recipe-toolbar__primary flex flex-col gap-2 sm:flex-row">
          <label className="recipe-toolbar__search relative flex-1">
            <span className="sr-only">Search recipes</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              value={filters.query}
              onChange={(e) =>
                updateFilters((f) => ({ ...f, query: e.target.value }))
              }
              placeholder="Search recipes"
              className={cn(
                "h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm",
                "placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring/50 transition-colors",
              )}
            />
          </label>

          {(filterOptions.platforms.length > 0 || hasAdvancedFilterOptions) && (
            <div className="recipe-toolbar__facet-controls flex min-w-0 items-center gap-2">
              {filterOptions.platforms.length > 0 && (
                <fieldset
                  className="recipe-toolbar__quick-filters min-w-0 max-w-full overflow-x-auto rounded-lg border border-border bg-background"
                >
                  <legend className="sr-only">Filter by platform</legend>
                  <div className="inline-flex h-10 items-center p-0.5">
                    {filterOptions.platforms.map((p) => {
                      const active = filters.platforms.includes(p)
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() =>
                            updateFilters((f) => ({
                              ...f,
                              platforms: toggle(f.platforms, p),
                            }))
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
                </fieldset>
              )}
              {hasAdvancedFilterOptions && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="recipe-toolbar__more-filters h-10 shrink-0 gap-1.5"
                  aria-label="Filters"
                  aria-expanded={showAdvanced}
                  aria-controls="advanced-recipe-filters"
                  onClick={() => setShowAdvanced((v) => !v)}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="recipe-toolbar__filters-label">Filters</span>
                  {totalActive > 0 && (
                    <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                      {totalActive}
                    </span>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Advanced filter row */}
        {showAdvanced && hasAdvancedFilterOptions && (
          <div
            id="advanced-recipe-filters"
            className="recipe-toolbar__advanced rounded-xl border border-border bg-card/95 p-4 flex flex-col gap-4"
          >
            {filterOptions.useCases.length > 0 && (
              <FilterGroup
                label="Use case"
                options={filterOptions.useCases}
                selected={filters.useCases}
                onToggle={(v) =>
                  updateFilters((f) => ({
                    ...f,
                    useCases: toggle(f.useCases, v),
                  }))
                }
              />
            )}
            {filterOptions.capabilities.length > 0 && (
              <FilterGroup
                label="Capability"
                hint="Recipes must include all selected capabilities"
                options={filterOptions.capabilities}
                selected={filters.capabilities}
                onToggle={(v) =>
                  updateFilters((f) => ({
                    ...f,
                    capabilities: toggle(f.capabilities, v),
                  }))
                }
              />
            )}
            {totalActive > 0 && (
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => updateFilters(EMPTY_FILTERS)}
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  Clear all
                </Button>
              </div>
            )}
          </div>
        )}
          </form>
        </div>
      </header>

      <div ref={resultsRef} className="recipe-results">
        {/* Result meta */}
        <div className="flex items-center justify-between mb-5 text-sm text-muted-foreground">
          <p aria-live="polite">
            Showing <span className="text-foreground font-medium">{filtered.length}</span>{" "}
            of {taggedRecipes.length} recipes
          </p>
          {totalActive > 0 && !showAdvanced && (
            <button
              type="button"
              onClick={() => updateFilters(EMPTY_FILTERS)}
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
              onClick={() => updateFilters(EMPTY_FILTERS)}
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
      </div>
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
    <fieldset className="flex flex-col gap-2">
      <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </legend>
      {hint && <p className="-mt-1 text-xs text-muted-foreground/80">{hint}</p>}
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
    </fieldset>
  )
}
