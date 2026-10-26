"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react"
import { RecipeCard } from "@/components/recipe-card"
import { GlassSurface } from "@/components/agent-ui/glass-surface"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { defaultFilters, discoverRecipes, quickTags, type DiscoveryFilters, type RecipeSummary } from "@/lib/recipe-discovery"

const VISIBLE_PLATFORMS = ["Web", "iOS", "Android", "Flutter", "Python", "TypeScript", "Go", "React Native"]
const RECIPE_BATCH_SIZE = 12
const toggle = (values: string[], value: string) => values.includes(value) ? values.filter(item => item !== value) : [...values, value]

export function RecipeExplorer({ recipes }: { recipes: RecipeSummary[] }) {
  const [filters, setFilters] = useState<DiscoveryFilters>(defaultFilters)
  const [advanced, setAdvanced] = useState(false)
  const filterButton = useRef<HTMLButtonElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const [pagination, setPagination] = useState({ key: "", limit: RECIPE_BATCH_SIZE })
  const keepSticky = useRef(false)
  const filtered = useMemo(() => discoverRecipes(recipes, filters), [recipes, filters])
  const options = useMemo(() => ({
    platforms: [...new Set(recipes.flatMap(recipe => recipe.platforms))].sort(),
    useCases: [...new Set(recipes.flatMap(recipe => recipe.useCases))].sort(),
    capabilities: [...new Set(recipes.flatMap(recipe => recipe.capabilities))].sort(),
  }), [recipes])
  const platforms = VISIBLE_PLATFORMS.filter(platform => options.platforms.includes(platform))
  const otherPlatforms = options.platforms.filter(platform => !VISIBLE_PLATFORMS.includes(platform))
  const otherSelected = filters.platforms.filter(platform => otherPlatforms.includes(platform)).length
  const advancedCount = filters.useCases.length + filters.capabilities.length + Number(filters.category !== "all") + Number(filters.previewOnly)
  const hasFilters = Boolean(filters.query.trim() || filters.topic !== "all" || filters.platforms.length || advancedCount || filters.previewOnly)
  const resultsKey = JSON.stringify(filters)
  const visibleLimit = pagination.key === resultsKey ? pagination.limit : RECIPE_BATCH_SIZE
  const visibleRecipes = filtered.slice(0, visibleLimit)
  const hasMore = visibleRecipes.length < filtered.length
  useEffect(() => {
    const sentinel = loadMoreRef.current
    if (!hasMore || !sentinel) return
    if (!("IntersectionObserver" in window)) {
      setPagination({ key: resultsKey, limit: filtered.length })
      return
    }
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return
      observer.disconnect()
      setPagination({ key: resultsKey, limit: Math.min(visibleLimit + RECIPE_BATCH_SIZE, filtered.length) })
    }, { rootMargin: "0px 0px 400px 0px" })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [resultsKey, visibleLimit, filtered.length, hasMore])

  // Keep search directly below the site navigation, including its mobile menu.
  useEffect(() => {
    const header = document.querySelector(".site-header")
    const bar = barRef.current
    if (!bar) return
    const measure = () => bar.style.setProperty("--catalog-header-height", `${header?.getBoundingClientRect().height ?? 0}px`)
    measure()
    const observer = new ResizeObserver(measure)
    if (header) observer.observe(header)
    return () => observer.disconnect()
  }, [])
  useLayoutEffect(() => {
    if (!keepSticky.current) return
    keepSticky.current = false
    const frame = requestAnimationFrame(() => {
      const bar = barRef.current
      const header = document.querySelector(".site-header")
      if (!bar) return
      const offset = bar.getBoundingClientRect().top - (header?.getBoundingClientRect().height ?? 0)
      if (offset < -1) window.scrollBy({ top: offset, behavior: "instant" })
    })
    return () => cancelAnimationFrame(frame)
  }, [filters, advanced])
  useEffect(() => {
    if (!advanced) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setAdvanced(false); filterButton.current?.focus() }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [advanced])
  function rememberStickyPosition() {
    const bar = barRef.current
    const header = document.querySelector(".site-header")
    keepSticky.current = !!bar && getComputedStyle(bar).position === "sticky" && bar.getBoundingClientRect().top <= (header?.getBoundingClientRect().height ?? 0) + 1
  }
  function update<K extends keyof DiscoveryFilters>(key: K, value: DiscoveryFilters[K]) {
    setFilters(current => ({ ...current, [key]: value }))
  }
  function facet(key: "platforms" | "useCases" | "capabilities", value: string) {
    setFilters(current => ({ ...current, [key]: toggle(current[key], value) }))
  }

  return <section id="recipes" className="catalog" aria-labelledby="recipes-heading" onClickCapture={rememberStickyPosition} onInputCapture={rememberStickyPosition} onChangeCapture={rememberStickyPosition}>
    <h1 id="recipes-heading" className="sr-only">Agora Recipes</h1>
    <div ref={barRef} className="catalog-bar">
      <div className="shell catalog-bar__inner">
        <GlassSurface material="liquid" className="catalog-search">
        <form role="search" className="catalog-search__field" onSubmit={event => event.preventDefault()}>
          <Search size={20} strokeWidth={1.5} aria-hidden="true" />
          <label htmlFor="recipe-search" className="sr-only">Search recipes, descriptions, or authors</label>
          <input id="recipe-search" type="search" placeholder="Search recipes, capabilities…" autoComplete="off" value={filters.query} onChange={event => update("query", event.target.value)} />
          {filters.query && <button type="button" className="icon-button catalog-clear" aria-label="Clear search" onClick={() => update("query", "")}><X size={16} aria-hidden="true" /></button>}
        </form>
        </GlassSurface>
        <div className="catalog-topics" role="group" aria-label="Quick topic filters">
          {quickTags.map(tag => <button type="button" className="catalog-filter" key={tag.value} aria-pressed={filters.topic === tag.value} onClick={() => update("topic", tag.value)}>{tag.value === "all" ? "All topics" : tag.label}</button>)}
        </div>
      </div>
    </div>
    <div className="shell">
      <div className="catalog-facets">
        <span className="platform-label" id="platform-label">Platform</span>
        <div className="platform-filters" role="group" aria-labelledby="platform-label">
          <button type="button" className="catalog-filter" aria-pressed={!filters.platforms.length} onClick={() => update("platforms", [])}>All</button>
          {platforms.map(platform => <button type="button" className="catalog-filter" key={platform} aria-pressed={filters.platforms.includes(platform)} onClick={() => facet("platforms", platform)}>{platform}</button>)}
          {otherPlatforms.length > 0 && <DropdownMenu>
            <DropdownMenuTrigger asChild><button type="button" className="catalog-filter" data-active={otherSelected > 0 || undefined}>More{otherSelected > 0 && ` (${otherSelected})`}<ChevronDown size={14} aria-hidden="true" /></button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="catalog-platform-menu">{otherPlatforms.map(platform => <DropdownMenuCheckboxItem key={platform} checked={filters.platforms.includes(platform)} onSelect={event => event.preventDefault()} onCheckedChange={() => { rememberStickyPosition(); facet("platforms", platform) }}>{platform}</DropdownMenuCheckboxItem>)}</DropdownMenuContent>
          </DropdownMenu>}
        </div>
        <button type="button" ref={filterButton} className="catalog-filter" data-active={advanced || advancedCount > 0 || filters.sort !== "recommended" || undefined} aria-expanded={advanced} aria-controls="advanced-recipe-filters" onClick={() => setAdvanced(!advanced)}><SlidersHorizontal size={16} aria-hidden="true" />Filters{advancedCount > 0 && ` (${advancedCount})`}</button>
      </div>
      {advanced && <div id="advanced-recipe-filters" className="catalog-advanced">
        <div className="catalog-result-controls">
          <button type="button" className="catalog-filter" aria-pressed={filters.previewOnly} onClick={() => update("previewOnly", !filters.previewOnly)}>Has a demo</button>
          <label className="catalog-sort"><span className="sr-only">Sort recipes</span><select value={filters.sort} onChange={event => update("sort", event.target.value as DiscoveryFilters["sort"])}><option value="recommended">Recommended</option><option value="updated">Recently updated</option><option value="title">A–Z</option></select><ChevronDown size={14} aria-hidden="true" /></label>
        </div>
        <fieldset><legend>Recipe type</legend><div className="flex flex-wrap gap-x-7">{[["all", "All types"], ["voice-ai", "Voice AI"], ["rtc", "RTC"]].map(([value, label]) => <button type="button" key={value} className="catalog-filter" aria-pressed={filters.category === value} onClick={() => update("category", value)}>{label}</button>)}</div></fieldset>
        {(["useCases", "capabilities"] as const).map(key => <fieldset key={key}>
          <legend>{key === "useCases" ? "Use cases" : "Capabilities"}</legend>
          {key === "capabilities" && <p className="mt-2 text-[13px] text-muted-foreground">Matches every selected capability.</p>}
          <div className="flex flex-wrap gap-x-7">{options[key].map(value => <button type="button" key={value} className="catalog-filter" aria-pressed={filters[key].includes(value)} onClick={() => facet(key, value)}>{value}</button>)}</div>
        </fieldset>)}
      </div>}
      <div className="catalog-results-meta" data-filtered={hasFilters || filters.sort !== "recommended"}>
        <p role="status" aria-atomic="true">Showing <span className="text-foreground">{visibleRecipes.length}</span> of {filtered.length} {filtered.length === 1 ? "recipe" : "recipes"}<span className="catalog-sort-status"> · {filters.sort === "recommended" ? "Recommended first" : filters.sort === "updated" ? "Recently updated" : "A–Z"}</span></p>
        {(hasFilters || filters.sort !== "recommended") && <button type="button" className="text-action catalog-reset" onClick={() => setFilters(defaultFilters)}>Clear filters</button>}
      </div>
      {filtered.length ? <>
        <div className="showcase-grid">{visibleRecipes.map(recipe => <RecipeCard key={recipe.slug} recipe={recipe} />)}</div>
        {hasMore && <div ref={loadMoreRef} className="catalog-load-more" aria-hidden="true">Scroll for more recipes</div>}
      </> : <div className="empty-recipes"><h3>No recipes match</h3><p>Try another keyword or remove a filter.</p><button type="button" className="text-action" onClick={() => setFilters(defaultFilters)}>Clear search and filters</button></div>}
    </div>
  </section>
}
