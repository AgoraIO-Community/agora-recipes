"use client"

import * as React from "react"
import Link from "next/link"
import {
  AudioLines,
  ChevronDown,
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type Filters = {
  query: string
  platforms: string[]
  useCases: string[]
  capabilities: string[]
}

type AdvancedFilterTab = "useCases" | "capabilities"

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

const VISIBLE_PLATFORMS = [
  "iOS",
  "Android",
  "Flutter",
  "Go",
  "Python",
  "React Native",
  "TypeScript",
]

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
  const advancedFiltersRef = React.useRef<HTMLDivElement>(null)
  const filtersButtonRef = React.useRef<HTMLButtonElement>(null)
  const [activeTag, setActiveTag] = React.useState<RecipeTag>("voice-ai")
  const [filters, setFilters] = React.useState<Filters>(EMPTY_FILTERS)
  const [showAdvanced, setShowAdvanced] = React.useState(false)
  const [advancedFilterTab, setAdvancedFilterTab] =
    React.useState<AdvancedFilterTab>("useCases")

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
      !document.documentElement.matches(
        "[data-recipe-nav-folded], [data-recipe-nav-active]",
      )
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
    setAdvancedFilterTab("useCases")
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
  const activeFacetCount =
    filters.platforms.length +
    filters.useCases.length +
    filters.capabilities.length
  const visiblePlatforms = VISIBLE_PLATFORMS.filter((platform) =>
    filterOptions.platforms.includes(platform),
  )
  const overflowPlatforms = filterOptions.platforms.filter(
    (platform) => !VISIBLE_PLATFORMS.includes(platform),
  )
  const activeOverflowPlatforms = overflowPlatforms.filter((platform) =>
    filters.platforms.includes(platform),
  )

  React.useEffect(() => {
    if (!showAdvanced) return

    function handlePointerDown(event: PointerEvent) {
      const target = event.target
      if (!(target instanceof Node)) return
      if (
        filtersButtonRef.current?.contains(target) ||
        advancedFiltersRef.current?.contains(target)
      ) {
        return
      }
      setShowAdvanced(false)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return
      setShowAdvanced(false)
      filtersButtonRef.current?.focus()
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [showAdvanced])

  function toggleAdvancedFilters() {
    if (!showAdvanced) setAdvancedFilterTab("useCases")
    setShowAdvanced((open) => !open)
  }

  function handleFilterTabKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
  ) {
    let nextTab: AdvancedFilterTab | undefined
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      nextTab = advancedFilterTab === "useCases" ? "capabilities" : "useCases"
    } else if (event.key === "Home") {
      nextTab = "useCases"
    } else if (event.key === "End") {
      nextTab = "capabilities"
    }

    if (!nextTab) return
    event.preventDefault()
    setAdvancedFilterTab(nextTab)
    document.getElementById(`recipe-filter-tab-${nextTab}`)?.focus()
  }

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
              Choose between building for Human-to-AI or Human-to-Human, and
              filter by use case or features.
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
                  className="recipe-toolbar__quick-filters min-w-0 max-w-full rounded-lg border border-border bg-background"
                >
                  <legend className="sr-only">Filter by platform</legend>
                  <div className="inline-flex h-10 items-center p-0.5">
                    {visiblePlatforms.map((p) => {
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
                            "h-full whitespace-nowrap px-3 text-sm rounded-md transition-colors",
                            active
                              ? "bg-foreground text-background font-medium"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {p}
                        </button>
                      )
                    })}
                    {overflowPlatforms.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className={cn(
                              "inline-flex h-full items-center gap-1 whitespace-nowrap rounded-md px-3 text-sm transition-colors",
                              activeOverflowPlatforms.length
                                ? "bg-foreground text-background font-medium"
                                : "text-muted-foreground hover:text-foreground",
                            )}
                          >
                            More
                            {activeOverflowPlatforms.length > 0 && (
                              <span className="ml-0.5 text-xs">
                                {activeOverflowPlatforms.length}
                              </span>
                            )}
                            <ChevronDown
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          {overflowPlatforms.map((p) => (
                            <DropdownMenuCheckboxItem
                              key={p}
                              checked={filters.platforms.includes(p)}
                              onCheckedChange={() =>
                                updateFilters((f) => ({
                                  ...f,
                                  platforms: toggle(f.platforms, p),
                                }))
                              }
                            >
                              {p}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </fieldset>
              )}
              {hasAdvancedFilterOptions && (
                <Button
                  ref={filtersButtonRef}
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    "recipe-toolbar__more-filters h-10 shrink-0 gap-1.5 overflow-hidden transition-colors",
                    showAdvanced && "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
                  )}
                  aria-label={showAdvanced ? "Close filters" : "Open filters"}
                  aria-expanded={showAdvanced}
                  aria-controls="advanced-recipe-filters"
                  onClick={toggleAdvancedFilters}
                >
                  <span className="relative h-3.5 w-3.5 shrink-0" aria-hidden="true">
                    <SlidersHorizontal
                      className={cn(
                        "absolute inset-0 h-3.5 w-3.5 transition-opacity duration-200 motion-reduce:transition-none",
                        showAdvanced ? "opacity-0" : "opacity-100",
                      )}
                    />
                    <X
                      className={cn(
                        "absolute inset-0 h-3.5 w-3.5 transition-opacity duration-200 motion-reduce:transition-none",
                        showAdvanced ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </span>
                  <span className="recipe-toolbar__filters-label grid text-left">
                    <span
                      className={cn(
                        "[grid-area:1/1] transition-opacity duration-200 motion-reduce:transition-none",
                        showAdvanced ? "opacity-0" : "opacity-100",
                      )}
                    >
                      Filters
                    </span>
                    <span
                      aria-hidden={!showAdvanced}
                      className={cn(
                        "[grid-area:1/1] transition-opacity duration-200 motion-reduce:transition-none",
                        showAdvanced ? "opacity-100" : "opacity-0",
                      )}
                    >
                      Close
                    </span>
                  </span>
                  {activeFacetCount > 0 && !showAdvanced && (
                    <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                      {activeFacetCount}
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
            ref={advancedFiltersRef}
            id="advanced-recipe-filters"
            className="recipe-toolbar__advanced flex max-h-[min(24rem,calc(100vh-6rem))] flex-col gap-3 overflow-y-auto rounded-xl border border-border bg-card/95 p-4 shadow-lg shadow-foreground/5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-sm font-medium text-muted-foreground">
                  Filter by:
                </span>
                <div
                  role="tablist"
                  aria-label="Recipe filter category"
                  className="inline-flex rounded-lg border border-border bg-background p-1"
                >
                  <FilterTab
                    id="recipe-filter-tab-useCases"
                    controls="recipe-filter-panel-useCases"
                    selected={advancedFilterTab === "useCases"}
                    count={filters.useCases.length}
                    onClick={() => setAdvancedFilterTab("useCases")}
                    onKeyDown={handleFilterTabKeyDown}
                  >
                    Use case
                  </FilterTab>
                  <FilterTab
                    id="recipe-filter-tab-capabilities"
                    controls="recipe-filter-panel-capabilities"
                    selected={advancedFilterTab === "capabilities"}
                    count={filters.capabilities.length}
                    onClick={() => setAdvancedFilterTab("capabilities")}
                    onKeyDown={handleFilterTabKeyDown}
                  >
                    Capabilities
                  </FilterTab>
                </div>
              </div>

              {activeFacetCount > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-1.5"
                  onClick={() =>
                    updateFilters((current) => ({
                      ...current,
                      platforms: [],
                      useCases: [],
                      capabilities: [],
                    }))
                  }
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  Clear filters
                </Button>
              )}
            </div>

            <div
              id="recipe-filter-panel-useCases"
              role="tabpanel"
              aria-labelledby="recipe-filter-tab-useCases"
              hidden={advancedFilterTab !== "useCases"}
            >
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
            </div>
            <div
              id="recipe-filter-panel-capabilities"
              role="tabpanel"
              aria-labelledby="recipe-filter-tab-capabilities"
              hidden={advancedFilterTab !== "capabilities"}
            >
              <FilterGroup
                label="Capability"
                hint="Recipes must match every selected capability."
                options={filterOptions.capabilities}
                selected={filters.capabilities}
                onToggle={(v) =>
                  updateFilters((f) => ({
                    ...f,
                    capabilities: toggle(f.capabilities, v),
                  }))
                }
              />
            </div>
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

function FilterTab({
  id,
  controls,
  selected,
  count,
  onClick,
  onKeyDown,
  children,
}: {
  id: string
  controls: string
  selected: boolean
  count: number
  onClick: () => void
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void
  children: React.ReactNode
}) {
  return (
    <button
      id={id}
      type="button"
      role="tab"
      aria-selected={selected}
      aria-controls={controls}
      tabIndex={selected ? 0 : -1}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
        selected
          ? "bg-foreground text-background shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
      {count > 0 && (
        <span
          className={cn(
            "inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px]",
            selected
              ? "bg-background/20 text-background"
              : "bg-primary/10 text-primary",
          )}
        >
          {count}
        </span>
      )}
    </button>
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
    <fieldset>
      <legend className="sr-only">Filter by {label.toLowerCase()}</legend>
      {hint && <p className="mb-2 text-xs text-muted-foreground">{hint}</p>}
      <div className="flex max-h-56 flex-wrap gap-1.5 overflow-y-auto pr-1">
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
                  : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground",
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
