"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent } from "react"
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react"
import { RecipeCard } from "@/components/recipe-card"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { SelectionIndicator } from "@/components/ui/selection-indicator"
import { useCatalogMotion } from "@/hooks/use-catalog-motion"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { catalogPositionKey, rememberCatalogPosition, replaceCatalogSearch, useCatalogSearch } from "@/hooks/use-catalog-location"
import { useIsMobile } from "@/hooks/use-mobile"
import { defaultFilters, discoverRecipes, quickTags, readDiscoveryFilters, writeDiscoveryFilters, type DiscoveryFilters, type RecipeSummary } from "@/lib/recipe-discovery"

const toggle = (values: string[], value: string) => values.includes(value) ? values.filter(item => item !== value) : [...values, value]
type FacetKey = "platforms" | "useCases" | "capabilities"

function CatalogSort({ value, query, onChange }: { value: DiscoveryFilters["sort"]; query: string; onChange: (value: DiscoveryFilters["sort"]) => void }) {
  const label = value === "title" ? "A–Z" : value === "updated" ? "Recently updated" : query.trim() ? "Most relevant" : "Recommended"
  return <Select value={value} onValueChange={next => onChange(next as DiscoveryFilters["sort"])}>
    <SelectTrigger className="catalog-sort" aria-label="Sort recipes"><SelectValue>{label}</SelectValue></SelectTrigger>
    <SelectContent position="popper" align="end"><SelectGroup><SelectLabel className="sr-only">Sort recipes</SelectLabel><SelectItem value="recommended">{query.trim() ? "Most relevant" : "Recommended"}</SelectItem><SelectItem value="updated">Recently updated</SelectItem><SelectItem value="title">A–Z</SelectItem></SelectGroup></SelectContent>
  </Select>
}

function FilterFacet({ label, hint, facet, options, recipes, filters, onChange, initiallyOpen = false }: {
  label: string; hint: string; facet: FacetKey; options: string[]; recipes: RecipeSummary[];
  filters: DiscoveryFilters; onChange: (value: string) => void; initiallyOpen?: boolean;
}) {
  const [query, setQuery] = useState("")
  const [showAll, setShowAll] = useState(false)
  const counts = useMemo(() => {
    const candidates = discoverRecipes(recipes, { ...filters, [facet]: [] })
    return Object.fromEntries(options.map(value => [value, candidates.filter(recipe =>
      recipe[facet].includes(value) && (facet !== "capabilities" || filters.capabilities.every(selected => recipe.capabilities.includes(selected)))
    ).length]))
  }, [recipes, filters, options, facet])
  const matched = options.filter(value => value.toLowerCase().includes(query.trim().toLowerCase()))
  const sorted = [...matched].sort((a, b) => Number(filters[facet].includes(b)) - Number(filters[facet].includes(a)) || (counts[b] - counts[a]) || a.localeCompare(b))
  const visible = query || showAll ? sorted : sorted.filter(value => counts[value] || filters[facet].includes(value)).slice(0, Math.max(6, filters[facet].length))

  return <details className="catalog-facet-group ag-disclosure" open={initiallyOpen || undefined}>
    <summary>{label}<span>{filters[facet].length ? `${filters[facet].length} selected` : options.length}<ChevronDown size={15} aria-hidden="true" /></span></summary>
    <fieldset>
      <legend className="sr-only">{label}</legend>
      <p className="catalog-facet-hint">{hint}</p>
      <InputGroup className="facet-search"><InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon><InputGroupInput aria-label={`Find ${label.toLowerCase()}`} type="search" placeholder={`Find ${label.toLowerCase()}…`} value={query} onChange={event => setQuery(event.target.value)} /></InputGroup>
      <div className="facet-options">
        {visible.map(value => <label key={value} className="facet-option" data-disabled={!counts[value] && !filters[facet].includes(value)}>
          <Checkbox checked={filters[facet].includes(value)} disabled={!counts[value] && !filters[facet].includes(value)} onCheckedChange={() => onChange(value)} />
          <span>{value}</span><span className="facet-option__count">{counts[value]}</span>
        </label>)}
      </div>
      {!matched.length && <p className="catalog-facet-hint">No matching options.</p>}
      {!query && matched.length > visible.length && <Button variant="ghost" size="sm" className="facet-show-more" onClick={() => setShowAll(true)}>Show all {options.length}</Button>}
      {!query && showAll && <Button variant="ghost" size="sm" className="facet-show-more" onClick={() => setShowAll(false)}>Show fewer</Button>}
    </fieldset>
  </details>
}

export function RecipeExplorer({ recipes }: { recipes: RecipeSummary[] }) {
  const mobile = useIsMobile()
  const search = useCatalogSearch()
  const params = useMemo(() => new URLSearchParams(search), [search])
  const filters = useMemo(() => readDiscoveryFilters(params), [params])
  const [advanced, setAdvanced] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const filtered = useMemo(() => discoverRecipes(recipes, filters), [recipes, filters])
  const options = useMemo(() => {
    const platforms = [...new Set(recipes.flatMap(recipe => recipe.platforms))].sort()
    return {
      platforms,
      useCases: [...new Set(recipes.flatMap(recipe => recipe.useCases))].sort(),
      // Languages and frameworks already have their own technology filter.
      capabilities: [...new Set(recipes.flatMap(recipe => recipe.capabilities))].filter(value => !platforms.includes(value)).sort(),
    }
  }, [recipes])
  const selectedCount = filters.platforms.length + filters.useCases.length + filters.capabilities.length + Number(filters.category !== "all") + Number(filters.previewOnly)
  const hasFilters = Boolean(filters.query.trim() || filters.topic !== "all" || selectedCount)
  const compact = hasFilters || filters.sort !== "recommended"
  const expanded = params.get("all") === "1"
  const leading = compact ? filtered : filtered.slice(0, 6)
  const remaining = compact ? [] : filtered.slice(6)

  useCatalogMotion(resultsRef, search, filters.query)
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        if (document.querySelector('[role="dialog"]')) return
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    document.addEventListener("keydown", shortcut)
    return () => document.removeEventListener("keydown", shortcut)
  }, [])

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
    if (search !== window.location.search) return
    try {
      const saved = JSON.parse(sessionStorage.getItem(catalogPositionKey) ?? "null")
      if (saved?.href === `${window.location.pathname}${search}#recipes` && Number.isFinite(saved.scroll)) {
        const frame = requestAnimationFrame(() => window.scrollTo({ top: saved.scroll, behavior: "instant" }))
        return () => cancelAnimationFrame(frame)
      }
    } catch { /* A fresh catalog remains usable when storage is unavailable. */ }
  }, [search])

  function setFilters(next: DiscoveryFilters) {
    const nextParams = writeDiscoveryFilters(next, params)
    nextParams.delete("all")
    replaceCatalogSearch(nextParams)
  }
  function update<K extends keyof DiscoveryFilters>(key: K, value: DiscoveryFilters[K]) {
    setFilters({ ...filters, [key]: value })
  }
  function facet(key: FacetKey, value: string) {
    update(key, toggle(filters[key], value))
  }
  function captureNavigation(event: MouseEvent<HTMLElement>) {
    const link = (event.target as Element).closest("a")
    if (link && new URL(link.href, window.location.origin).pathname.startsWith("/recipes/")) rememberCatalogPosition()
  }
  const chips = [
    ...(filters.topic === "all" ? [] : [{ key: "topic", label: quickTags.find(tag => tag.value === filters.topic)?.label ?? filters.topic, remove: () => update("topic", "all") }]),
    ...(filters.category === "all" ? [] : [{ key: "category", label: filters.category === "rtc" ? "RTC" : "Voice AI", remove: () => update("category", "all") }]),
    ...(["platforms", "useCases", "capabilities"] as const).flatMap(key => filters[key].map(value => ({ key: `${key}:${value}`, label: value, remove: () => facet(key, value) }))),
    ...(filters.previewOnly ? [{ key: "demo", label: "Has a demo", remove: () => update("previewOnly", false) }] : []),
  ]

  return <section id="recipes" className="catalog" aria-labelledby="recipes-heading" onClickCapture={captureNavigation}>
    <div className="shell catalog-masthead">
      <h1 id="recipes-heading">Start with a recipe.</h1>
      <p>Voice AI and real-time apps, with working code.</p>
      <form role="search" className="catalog-search" onSubmit={event => event.preventDefault()}>
        <label htmlFor="recipe-search" className="sr-only">Search recipes, descriptions, or authors</label>
        <InputGroup><InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon><InputGroupInput ref={searchRef} id="recipe-search" type="search" placeholder="Search recipes, capabilities…" aria-keyshortcuts="Meta+K Control+K" autoComplete="off" value={filters.query} onKeyDown={event => { if (event.key === "Escape") event.currentTarget.blur() }} onChange={event => update("query", event.target.value)} />
          <InputGroupAddon align="inline-end">{filters.query ? <InputGroupButton size="icon-sm" aria-label="Clear search" onClick={() => update("query", "")}><X aria-hidden="true" /></InputGroupButton> : <kbd className="catalog-search__shortcut" aria-hidden="true">⌘ K</kbd>}</InputGroupAddon>
        </InputGroup>
      </form>
    </div>
    <div ref={barRef} className="catalog-bar">
      <div className="shell catalog-toolbar">
        <div className="catalog-topics-scroll">
          <ToggleGroup type="single" spacing={1} data-appearance="nav" className="catalog-topics ag-selection-group" aria-label="Quick topic filters" value={filters.topic} onValueChange={value => update("topic", value || "all")}>
            <SelectionIndicator value={filters.topic} />
            {quickTags.map(tag => <ToggleGroupItem key={tag.value} value={tag.value}>{tag.value === "all" ? "All topics" : tag.label}</ToggleGroupItem>)}
          </ToggleGroup>
        </div>
        <div className="catalog-toolbar-actions">
        <Sheet open={advanced} onOpenChange={setAdvanced}>
          <SheetTrigger asChild><Button variant="outline" className="catalog-filter-trigger" aria-label={selectedCount ? `Filters, ${selectedCount} active` : "Filters"}><SlidersHorizontal aria-hidden="true" />Filters{selectedCount > 0 && <Badge>{selectedCount}</Badge>}</Button></SheetTrigger>
          <SheetContent side={mobile ? "bottom" : "right"} className="catalog-filter-sheet">
            <SheetHeader><SheetTitle>Refine recipes</SheetTitle><SheetDescription>Find the right starting point for your project.</SheetDescription></SheetHeader>
            <div className="catalog-filter-sheet__body ag-reading-plane">
              <div className="catalog-sheet-sort"><span>Sort by</span><CatalogSort value={filters.sort} query={filters.query} onChange={value => update("sort", value)} /></div>
              <fieldset className="catalog-category"><legend>Category</legend>
                <ToggleGroup type="single" spacing={1} className="ag-selection-group" aria-label="Recipe category" value={filters.category} onValueChange={value => update("category", value || "all")}>
                  <SelectionIndicator value={filters.category} />
                  {[["all", "All"], ["voice-ai", "Voice AI"], ["rtc", "RTC"]].map(([value, label]) => <ToggleGroupItem key={value} value={value}>{label}</ToggleGroupItem>)}
                </ToggleGroup>
              </fieldset>
              <label className="facet-option catalog-demo-option"><Checkbox checked={filters.previewOnly} onCheckedChange={checked => update("previewOnly", checked === true)} /><span>Has a demo</span><span className="facet-option__count">Video or live app</span></label>
              <FilterFacet label="Platforms & languages" hint="Matches any selected technology." facet="platforms" options={options.platforms} recipes={recipes} filters={filters} onChange={value => facet("platforms", value)} initiallyOpen />
              <FilterFacet label="Use cases" hint="Matches any selected use case." facet="useCases" options={options.useCases} recipes={recipes} filters={filters} onChange={value => facet("useCases", value)} />
              <FilterFacet label="Models & capabilities" hint="Matches every selected capability." facet="capabilities" options={options.capabilities} recipes={recipes} filters={filters} onChange={value => facet("capabilities", value)} />
            </div>
            <SheetFooter>
              <Button variant="ghost" disabled={!selectedCount && filters.topic === "all"} onClick={() => setFilters({ ...defaultFilters, query: filters.query, sort: filters.sort })}>Reset filters</Button>
              <SheetClose asChild><Button>Show {filtered.length} {filtered.length === 1 ? "recipe" : "recipes"}</Button></SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        <div className="catalog-toolbar-sort"><CatalogSort value={filters.sort} query={filters.query} onChange={value => update("sort", value)} /></div>
        </div>
      </div>
    </div>
    <div className="shell">
      {chips.length > 0 && <div className="catalog-selected" role="group" aria-label="Selected filters">
        {chips.map(chip => <Button variant="secondary" size="sm" key={chip.key} onClick={chip.remove} aria-label={`Remove ${chip.label} filter`}>{chip.label}<X aria-hidden="true" /></Button>)}
        <Button variant="ghost" size="sm" onClick={() => setFilters({ ...defaultFilters, query: filters.query })}>Clear filters</Button>
      </div>}
      <div className="catalog-results-meta" data-compact={compact}>
        <h2 id="catalog-results-heading" aria-live="polite" aria-atomic="true">{compact ? `${filtered.length} ${filtered.length === 1 ? "recipe" : "recipes"}` : "Explore recipes"}{!compact && <span>{recipes.length} recipes</span>}</h2>
      </div>
      {filtered.length ? <>
        <div ref={resultsRef} className={compact ? "recipe-results" : "showcase-grid"}>{leading.map(recipe => <RecipeCard key={recipe.slug} recipe={recipe} compact={compact} />)}</div>
        {remaining.length > 0 && <details className="catalog-continuation" open={expanded} onToggle={event => {
          const open = event.currentTarget.open
          if (open === expanded) return
          const next = new URLSearchParams(params)
          if (open) next.set("all", "1"); else next.delete("all")
          replaceCatalogSearch(next)
        }}>
          <summary className="ag-button ag-button-outline ag-control-lg"><span>{expanded ? "Show fewer recipes" : `Explore ${remaining.length} more recipes`}</span><ChevronDown aria-hidden="true" /></summary>
          <div className="recipe-results catalog-rest">{remaining.map(recipe => <RecipeCard key={recipe.slug} recipe={recipe} compact />)}</div>
        </details>}
      </> : <Empty className="catalog-empty"><EmptyHeader><EmptyTitle>No matching recipes</EmptyTitle><EmptyDescription>Try a broader search or remove a filter above.</EmptyDescription></EmptyHeader><Button variant="outline" onClick={() => setFilters(defaultFilters)}>Clear search and filters</Button></Empty>}
    </div>
  </section>
}
