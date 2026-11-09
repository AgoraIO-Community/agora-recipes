"use client"

import { useAnalytics } from "@/components/analytics-provider"
import { useI18n } from "@/components/locale-provider"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent } from "react"
import { ArrowDownWideNarrow, Grid2X2, List, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react"
import { CatalogSearch } from "@/components/catalog-search"
import { RecipeCard } from "@/components/recipe-card"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SelectionIndicator } from "@/components/ui/selection-indicator"
import { useCatalogMotion } from "@/hooks/use-catalog-motion"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { IconButton } from "@/components/ui/icon-button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Disclosure, DisclosureTrigger, DisclosureContent } from "@/components/ui/disclosure"
import { Toolbar, ToolbarActions } from "@/components/ui/toolbar"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Sheet, SheetBody, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { catalogPositionKey, rememberCatalogPosition, replaceCatalogSearch, useCatalogSearch } from "@/hooks/use-catalog-location"
import { useIsMobile } from "@/hooks/use-mobile"
import { useGuideSearch } from "@/hooks/use-guide-search"
import { CATALOG_BATCH_SIZE, catalogVisibleCount, defaultFilters, discoverRecipes, legacyTopics, readDiscoveryFilters, writeDiscoveryFilters, type DiscoveryFilters, type RecipeSummary } from "@/lib/recipe-discovery"

const toggle = (values: string[], value: string) => values.includes(value) ? values.filter(item => item !== value) : [...values, value]
type FacetKey = "platforms" | "useCases" | "capabilities"

const sortLabel = (value: DiscoveryFilters["sort"], query: string) => value === "title" ? "A–Z" : value === "updated" ? "Recently updated" : value === "stars" ? "Most popular" : query.trim() ? "Most relevant" : "Recommended"

function CatalogSort({ value, query, onChange, className = "" }: { value: DiscoveryFilters["sort"]; query: string; onChange: (value: DiscoveryFilters["sort"]) => void; className?: string }) {
  const { t } = useI18n()
  const label = sortLabel(value, query)
  return <Select value={value} onValueChange={next => onChange(next as DiscoveryFilters["sort"])}>
    <Tooltip><TooltipTrigger asChild><SelectTrigger size="icon" className={`catalog-sort ${className}`} aria-label={t("Sort recipes")}><ArrowDownWideNarrow aria-hidden="true" /><SelectValue>{t(label)}</SelectValue></SelectTrigger></TooltipTrigger><TooltipContent>{t("Sort recipes")}: {t(label)}</TooltipContent></Tooltip>
    <SelectContent position="popper" align="end"><SelectGroup><SelectLabel className="sr-only">{t("Sort recipes")}</SelectLabel><SelectItem value="recommended">{t(query.trim() ? "Most relevant" : "Recommended")}</SelectItem><SelectItem value="updated">{t("Recently updated")}</SelectItem><SelectItem value="stars">{t("Most popular")}</SelectItem><SelectItem value="title">{t("A–Z")}</SelectItem></SelectGroup>
    </SelectContent>
  </Select>
}

function CatalogView({ value, onChange }: { value: DiscoveryFilters["view"]; onChange: (value: DiscoveryFilters["view"]) => void }) {
  const { t } = useI18n()
  return <ToggleGroup type="single" size="icon" spacing={1} className="catalog-view" aria-label={t("View recipes")} value={value} onValueChange={next => { if (next === "cards" || next === "list") onChange(next) }}>
    <SelectionIndicator value={value} />
    <ToggleGroupItem value="cards" aria-label={t("Card view")} title={t("Card view")}><Grid2X2 aria-hidden="true" /></ToggleGroupItem>
    <ToggleGroupItem value="list" aria-label={t("List view")} title={t("List view")}><List aria-hidden="true" /></ToggleGroupItem>
  </ToggleGroup>
}

function FilterFacet({ label, facet, options, recipes, filters, onChange, initiallyOpen = false }: {
  label: string; facet: FacetKey; options: string[]; recipes: RecipeSummary[];
  filters: DiscoveryFilters; onChange: (value: string) => void; initiallyOpen?: boolean;
}) {
  const { t } = useI18n()
  const [query, setQuery] = useState("")
  const [showAll, setShowAll] = useState(false)
  const counts = useMemo(() => {
    const candidates = discoverRecipes(recipes, { ...filters, [facet]: [] })
    return Object.fromEntries(options.map(value => [value, candidates.filter(recipe =>
      recipe[facet].includes(value) && (facet !== "capabilities" || filters.capabilities.every(selected => recipe.capabilities.includes(selected)))
    ).length]))
  }, [recipes, filters, options, facet])
  const matched = options.filter(value => `${value} ${t(value)}`.toLowerCase().includes(query.trim().toLowerCase()))
  // Changing a checkbox must not move its row beneath the pointer or focus.
  const order = useMemo(() => {
    const totals = Object.fromEntries(options.map(value => [value, recipes.filter(recipe => recipe[facet].includes(value)).length]))
    return [...options].sort((a, b) => totals[b] - totals[a] || a.localeCompare(b))
  }, [options, recipes, facet])
  const sorted = order.filter(value => matched.includes(value))
  const visible = query || showAll ? sorted : sorted.filter((value, index) => index < 6 || filters[facet].includes(value))

  return <Disclosure className="catalog-facet-group" open={initiallyOpen || undefined}>
    <DisclosureTrigger meta={filters[facet].length ? t("{count} selected", { count: filters[facet].length }) : options.length} onKeyDown={event => {
      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return
      const summaries = Array.from(event.currentTarget.parentElement!.parentElement!.querySelectorAll<HTMLElement>(".catalog-facet-group > summary"))
      const index = summaries.indexOf(event.currentTarget)
      const next = event.key === "Home" ? 0 : event.key === "End" ? summaries.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + summaries.length) % summaries.length
      event.preventDefault()
      summaries[next]?.focus()
    }}>{label}</DisclosureTrigger>
    <DisclosureContent asChild><fieldset>
      <legend className="sr-only">{label}</legend>
      <InputGroup className="facet-search"><InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon><InputGroupInput aria-label={t("Find {label}", { label })} type="search" placeholder={`${t("Find {label}", { label })}…`} value={query} onChange={event => setQuery(event.target.value)} />{query && <InputGroupAddon align="inline-end"><InputGroupButton size="icon-sm" aria-label={t("Clear search")} onClick={() => setQuery("")}><X aria-hidden="true" /></InputGroupButton></InputGroupAddon>}</InputGroup>
      <div className="facet-options">
        {visible.map(value => <Label key={value} className="facet-option" data-disabled={!counts[value] && !filters[facet].includes(value)} data-selected={filters[facet].includes(value)}>
          <Checkbox checked={filters[facet].includes(value)} disabled={!counts[value] && !filters[facet].includes(value)} onCheckedChange={() => onChange(value)} />
          <span>{t(value)}</span><span className="facet-option__count">{counts[value]}</span>
        </Label>)}
      </div>
      {!matched.length && <p className="catalog-facet-hint">{t("No matching options.")}</p>}
      {!query && matched.length > visible.length && <Button variant="ghost" size="sm" className="facet-show-more" onClick={() => setShowAll(true)}>{t("Show all {count}", { count: options.length })}</Button>}
      {!query && showAll && <Button variant="ghost" size="sm" className="facet-show-more" onClick={() => setShowAll(false)}>{t("Show fewer")}</Button>}
    </fieldset></DisclosureContent>
  </Disclosure>
}

export function RecipeExplorer({ recipes: catalogRecipes, embedded = false, topicSlug }: { recipes: RecipeSummary[]; embedded?: boolean; topicSlug?: string }) {
  const { t, locale } = useI18n()
  const capture = useAnalytics()
  const pendingSearch = useRef<string | null>(null)
  const pathname = usePathname()
  const mobile = useIsMobile()
  const search = useCatalogSearch()
  const params = useMemo(() => new URLSearchParams(search), [search])
  const filters = useMemo(() => readDiscoveryFilters(params), [params])
  const [query, setQuery] = useState(filters.query)
  const [previousQuery, setPreviousQuery] = useState(filters.query)
  // Back/forward and locale URLs replace the draft before a stale value paints.
  if (previousQuery !== filters.query) {
    setPreviousQuery(filters.query)
    setQuery(filters.query)
  }
  const [composing, setComposing] = useState(false)
  const queryTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const guides = useGuideSearch(query)
  const recipes = useMemo(() => guides.documents ? catalogRecipes.map(recipe => ({ ...recipe, guideSearchText: guides.documents![recipe.slug] })) : catalogRecipes, [catalogRecipes, guides.documents])
  const searching = composing || query !== filters.query || Boolean(filters.query.trim()) && guides.status !== "ready" && guides.status !== "error"
  const [advanced, setAdvanced] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const sentinel = useRef<HTMLDivElement>(null)
  const filterInvoker = useRef<HTMLButtonElement | null>(null)
  const filterTitle = useRef<HTMLHeadingElement>(null)
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
  const selectedCount = filters.platforms.length + filters.useCases.length + filters.capabilities.length + filters.materials.length + Number(filters.topic !== "all") + Number(filters.previewOnly)
  const compact = filters.view === "list"
  const visibleCount = catalogVisibleCount(params, filtered.length)
  const hasMore = visibleCount < filtered.length
  const visible = filtered.slice(0, visibleCount)

  useEffect(() => {
    const target = sentinel.current
    if (!hasMore || !target || searching) return
    const load = () => {
      const next = new URLSearchParams(window.location.search)
      const count = Math.min(visibleCount + CATALOG_BATCH_SIZE, filtered.length)
      next.set("loaded", String(count))
      next.delete("all")
      replaceCatalogSearch(next)
      capture("catalog_action", { action: "load_more", placement: topicSlug ? "topic_list" : "catalog", topic_slug: topicSlug, result_count: filtered.length })
    }
    if (typeof window.IntersectionObserver === "undefined") {
      const next = new URLSearchParams(window.location.search)
      next.set("loaded", String(filtered.length))
      replaceCatalogSearch(next)
      return
    }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); load() }
    }, { rootMargin: "0px 0px 400px 0px" })
    observer.observe(target)
    return () => observer.disconnect()
  }, [hasMore, visibleCount, filtered.length, searching, capture, topicSlug])

  useCatalogMotion(resultsRef, search, filters.query)
  const commitQuery = useCallback((value: string) => {
    clearTimeout(queryTimer.current)
    const current = new URLSearchParams(window.location.search)
    const latest = readDiscoveryFilters(current)
    if (latest.query === value) return
    pendingSearch.current = value
    const next = writeDiscoveryFilters({ ...latest, query: value }, current)
    next.delete("all")
    next.delete("loaded")
    replaceCatalogSearch(next)
  }, [])
  useEffect(() => {
    if (composing || query === filters.query) return
    queryTimer.current = setTimeout(() => commitQuery(query), 250)
    return () => clearTimeout(queryTimer.current)
  }, [query, filters.query, composing, commitQuery])
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        if (document.querySelector('[role="dialog"]')) return
        event.preventDefault()
        searchRef.current?.focus()
        searchRef.current?.select()
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
    if (document.activeElement === searchRef.current || searching) return
    try {
      const saved = JSON.parse(sessionStorage.getItem(catalogPositionKey(`${window.location.pathname}${search}#recipes`)) ?? "null")
      if (saved?.href === `${window.location.pathname}${search}#recipes` && Number.isFinite(saved.scroll)) {
        const frame = requestAnimationFrame(() => window.scrollTo({ top: saved.scroll, behavior: "instant" }))
        return () => cancelAnimationFrame(frame)
      }
    } catch { /* A fresh catalog remains usable when storage is unavailable. */ }
  }, [search, searching, filtered.length])

  useEffect(() => {
    if (searching || pendingSearch.current === null || pendingSearch.current !== filters.query) return
    const timer = setTimeout(() => {
      capture("catalog_action", { action: "search", placement: topicSlug ? "topic_list" : "catalog", topic_slug: topicSlug, result_count: filtered.length })
      pendingSearch.current = null
    }, 700)
    return () => clearTimeout(timer)
  }, [filters.query, filtered.length, capture, topicSlug, searching])

  function setFilters(next: DiscoveryFilters, action = "filter") {
    if (action !== "search" && action !== "view") capture("catalog_action", { action, placement: topicSlug ? "topic_list" : "catalog", topic_slug: topicSlug, result_count: discoverRecipes(recipes, next).length })
    const nextParams = writeDiscoveryFilters(next, params)
    if (action !== "view") {
      nextParams.delete("all")
      nextParams.delete("loaded")
    }
    replaceCatalogSearch(nextParams)
  }
  function update<K extends keyof DiscoveryFilters>(key: K, value: DiscoveryFilters[K]) {
    setFilters({ ...filters, [key]: value }, key === "query" ? "search" : key === "sort" ? "sort" : key === "view" ? "view" : "filter")
  }
  function updateQuery(value: string, immediate = false) {
    setQuery(value)
    if (immediate) { searchRef.current?.focus(); commitQuery(value) }
  }
  function facet(key: FacetKey, value: string) {
    update(key, toggle(filters[key], value))
  }
  function clearRefinements() {
    setFilters({ ...defaultFilters, category: filters.category, query: filters.query, sort: filters.sort, view: filters.view })
  }
  function captureNavigation(event: MouseEvent<HTMLElement>) {
    const link = (event.target as Element).closest("a")
    if (link && new URL(link.href, window.location.origin).pathname.includes("/recipes/")) rememberCatalogPosition()
  }
  const returnTo = `${pathname}${search}#recipes`
  const chips = [
    ...(filters.topic === "all" ? [] : [{ key: "topic", label: t(legacyTopics.find(tag => tag.value === filters.topic)?.label ?? filters.topic), remove: () => update("topic", "all") }]),
    ...filters.materials.map(value => ({ key: `material:${value}`, label: t({ demo: "Demo", video: "Video", source: "Source", recipe: "Recipe" }[value] ?? value), remove: () => update("materials", filters.materials.filter(material => material !== value)) })),
    ...(["platforms", "useCases", "capabilities"] as const).flatMap(key => filters[key].map(value => ({ key: `${key}:${value}`, label: t(value), remove: () => facet(key, value) }))),
    ...(filters.previewOnly ? [{ key: "demo", label: t("Has a demo"), remove: () => update("previewOnly", false) }] : []),
  ]

  return <section id="recipes" className={embedded ? "catalog catalog--embedded" : "catalog"} aria-label={embedded ? t("Topic entries") : undefined} aria-labelledby={embedded ? undefined : "recipes-heading"} onClickCapture={captureNavigation} onAuxClickCapture={captureNavigation}>
    <div className="shell catalog-masthead">
      {!embedded && <h1 id="recipes-heading">{t("Explore projects and recipes.")}</h1>}
      {!embedded && <p>{t("Voice AI and real-time apps, with working code.")}</p>}
      <CatalogSearch value={query} composing={composing} inputRef={searchRef} onChange={updateQuery} onComposition={setComposing} onSubmit={() => commitQuery(query)} onFocus={guides.preload} filterCount={selectedCount} onFilter={button => { filterInvoker.current = button; setAdvanced(true) }} />
    </div>
    <div ref={barRef} className="catalog-bar">
      <Toolbar className="shell catalog-toolbar" aria-label={t("Browse recipes")}>
        <ToggleGroup type="single" spacing={1} data-appearance="nav" className="ag-selection-group catalog-categories" aria-label={t("Recipe category")} value={filters.category} onValueChange={value => update("category", value || "all")}>
          <SelectionIndicator value={filters.category} />
          {[["all", "All"], ["voice-ai", "Voice AI"], ["rtc", "RTC"]].map(([value, label]) => <ToggleGroupItem key={value} value={value}>{t(label)}</ToggleGroupItem>)}
        </ToggleGroup>
        <ToolbarActions className="catalog-toolbar-actions">
        <div className="catalog-toolbar-view"><CatalogView value={filters.view} onChange={value => update("view", value)} /></div>
        <ButtonGroup aria-label={`${t("Sort recipes")}, ${t("Filters")}`}>
        {!mobile && <CatalogSort className="catalog-toolbar-sort" value={filters.sort} query={filters.query} onChange={value => update("sort", value)} />}
        <Sheet open={advanced} onOpenChange={setAdvanced}>
          <SheetTrigger asChild><IconButton variant="outline" count={selectedCount} className="catalog-filter-trigger" onClick={() => { filterInvoker.current = null }} label={selectedCount ? t("Filters, {count} active", { count: selectedCount }) : t("Filters")}><SlidersHorizontal aria-hidden="true" /></IconButton></SheetTrigger>
          <SheetContent closeLabel={t("Close filters")} side={mobile ? "bottom" : "right"} className="catalog-filter-sheet" aria-describedby={undefined} onOpenAutoFocus={event => { event.preventDefault(); filterTitle.current?.focus({ preventScroll: true }) }} onCloseAutoFocus={event => { if (filterInvoker.current?.isConnected) { event.preventDefault(); filterInvoker.current.focus() } }}>
            <SheetHeader actions={<div className="catalog-sheet-controls">
                <div className="catalog-sheet-view"><CatalogView value={filters.view} onChange={value => update("view", value)} /></div>
                <div className="catalog-sheet-sort"><CatalogSort value={filters.sort} query={filters.query} onChange={value => update("sort", value)} /></div>
              </div>}><SheetTitle ref={filterTitle} tabIndex={-1}>{t("Filters")}</SheetTitle></SheetHeader>
            <SheetBody className="catalog-filter-sheet__body">
              <fieldset className="catalog-category catalog-materials"><legend>{t("Available materials")}</legend><div className="facet-options">{[["demo", "Demo"], ["video", "Video"], ["source", "Source"], ["recipe", "Recipe"]].map(([value, label]) => <Label key={value} className="facet-option"><Checkbox checked={filters.materials.includes(value)} onCheckedChange={() => update("materials", toggle(filters.materials, value))} /><span>{t(label)}</span></Label>)}</div></fieldset>
              <FilterFacet label={t("Platforms & languages")} facet="platforms" options={options.platforms} recipes={recipes} filters={filters} onChange={value => facet("platforms", value)} initiallyOpen />
              <FilterFacet label={t("Use cases")} facet="useCases" options={options.useCases} recipes={recipes} filters={filters} onChange={value => facet("useCases", value)} />
              <FilterFacet label={t("Models & capabilities")} facet="capabilities" options={options.capabilities} recipes={recipes} filters={filters} onChange={value => facet("capabilities", value)} />
            </SheetBody>
            <SheetFooter>
              <IconButton label={t("Clear filters")} disabled={!selectedCount} onClick={clearRefinements}><RotateCcw aria-hidden="true" /></IconButton>
              <SheetClose asChild><Button className="catalog-filter-results" aria-label={filtered.length === 1 ? t("Show 1 result") : t("Show {count} results", { count: filtered.length })}><span key={filtered.length} className="ag-value-change">{filtered.length === 1 ? t("1 result") : t("{count} results", { count: filtered.length })}</span></Button></SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        </ButtonGroup>
        </ToolbarActions>
      </Toolbar>
    </div>
    <div className="shell">
      <div className="catalog-results-meta" data-compact={compact}>
        <h2 id="catalog-results-heading" aria-live="polite" aria-atomic="true">{searching ? t("Searching…") : filtered.length === 1 ? t("1 result") : t("{count} results", { count: filtered.length })}</h2>
        {(chips.length > 0 || filters.sort !== defaultFilters.sort) && <div className="catalog-selected" role="group" aria-label={t("Active conditions")}>
          {filters.sort !== defaultFilters.sort && <Button wrap variant="secondary" size="sm" onClick={() => update("sort", defaultFilters.sort)} aria-label={t("Reset sort")}><ArrowDownWideNarrow aria-hidden="true" />{t(sortLabel(filters.sort, filters.query))}<X aria-hidden="true" /></Button>}
          {chips.map(chip => <Button wrap variant="secondary" size="sm" key={chip.key} onClick={chip.remove} aria-label={t("Remove {label} filter", { label: chip.label })}>{chip.label}<X aria-hidden="true" /></Button>)}
          {chips.length > 0 && <IconButton size="icon-sm" label={t("Clear filters")} onClick={clearRefinements}><RotateCcw aria-hidden="true" /></IconButton>}
        </div>}
        {query && guides.status === "error" && <p className="catalog-search-status" role="status">{t("Searching project details only.")} <Button variant="link" size="sm" onClick={guides.retry}>{t("Retry guide search")}</Button></p>}
      </div>
      {filtered.length ? <>
        <div ref={resultsRef} aria-busy={searching} className={compact ? "recipe-results" : "catalog-cards"}>
          {compact ? visible.map(recipe => <RecipeCard key={recipe.slug} recipe={recipe} returnTo={returnTo} compact />) : <div className="showcase-grid">{visible.map(recipe => <RecipeCard key={recipe.slug} recipe={recipe} returnTo={returnTo} />)}</div>}
        </div>
        {filtered.length > CATALOG_BATCH_SIZE && <div ref={sentinel} className="catalog-load-status" role="status" aria-live="polite"><span className="sr-only">{hasMore ? t("Loading more projects…") : t("All {count} projects shown", { count: filtered.length })}</span></div>}
      </> : searching ? <div className="catalog-empty" aria-hidden="true" /> : <Empty className="catalog-empty"><EmptyHeader><EmptyTitle>{t("No matching recipes")}</EmptyTitle></EmptyHeader><Button variant="outline" onClick={() => { setFilters({ ...defaultFilters, view: filters.view }); searchRef.current?.focus() }}>{t("Clear search and filters")}</Button></Empty>}
    </div>
  </section>
}
