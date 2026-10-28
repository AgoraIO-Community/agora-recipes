"use client"

import { useAnalytics } from "@/components/analytics-provider"
import { useI18n } from "@/components/locale-provider"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent } from "react"
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
import { useGuideSearch } from "@/hooks/use-guide-search"
import { defaultFilters, discoverRecipes, quickTags, readDiscoveryFilters, writeDiscoveryFilters, type DiscoveryFilters, type RecipeSummary } from "@/lib/recipe-discovery"

const toggle = (values: string[], value: string) => values.includes(value) ? values.filter(item => item !== value) : [...values, value]
type FacetKey = "platforms" | "useCases" | "capabilities"

function CatalogSort({ value, query, onChange }: { value: DiscoveryFilters["sort"]; query: string; onChange: (value: DiscoveryFilters["sort"]) => void }) {
  const { t } = useI18n()
  const label = value === "title" ? "A–Z" : value === "updated" ? "Recently updated" : query.trim() ? "Most relevant" : "Recommended"
  return <Select value={value} onValueChange={next => onChange(next as DiscoveryFilters["sort"])}>
    <SelectTrigger className="catalog-sort" aria-label={t("Sort recipes")}><SelectValue>{t(label)}</SelectValue></SelectTrigger>
    <SelectContent position="popper" align="end"><SelectGroup><SelectLabel className="sr-only">{t("Sort recipes")}</SelectLabel><SelectItem value="recommended">{t(query.trim() ? "Most relevant" : "Recommended")}</SelectItem><SelectItem value="updated">{t("Recently updated")}</SelectItem><SelectItem value="title">{t("A–Z")}</SelectItem></SelectGroup></SelectContent>
  </Select>
}

function FilterFacet({ label, hint, facet, options, recipes, filters, onChange, initiallyOpen = false }: {
  label: string; hint: string; facet: FacetKey; options: string[]; recipes: RecipeSummary[];
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

  return <details className="catalog-facet-group ag-disclosure" open={initiallyOpen || undefined}>
    <summary onKeyDown={event => {
      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return
      const summaries = Array.from(event.currentTarget.parentElement!.parentElement!.querySelectorAll<HTMLElement>(".catalog-facet-group > summary"))
      const index = summaries.indexOf(event.currentTarget)
      const next = event.key === "Home" ? 0 : event.key === "End" ? summaries.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + summaries.length) % summaries.length
      event.preventDefault()
      summaries[next]?.focus()
    }}>{label}<span>{filters[facet].length ? t("{count} selected", { count: filters[facet].length }) : options.length}<ChevronDown size={15} aria-hidden="true" /></span></summary>
    <fieldset>
      <legend className="sr-only">{label}</legend>
      <p className="catalog-facet-hint">{hint}</p>
      <InputGroup className="facet-search"><InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon><InputGroupInput aria-label={t("Find {label}", { label })} type="search" placeholder={`${t("Find {label}", { label })}…`} value={query} onChange={event => setQuery(event.target.value)} />{query && <InputGroupAddon align="inline-end"><InputGroupButton size="icon-sm" aria-label={t("Clear search")} onClick={() => setQuery("")}><X aria-hidden="true" /></InputGroupButton></InputGroupAddon>}</InputGroup>
      <div className="facet-options">
        {visible.map(value => <label key={value} className="facet-option" data-disabled={!counts[value] && !filters[facet].includes(value)} data-selected={filters[facet].includes(value)}>
          <Checkbox checked={filters[facet].includes(value)} disabled={!counts[value] && !filters[facet].includes(value)} onCheckedChange={() => onChange(value)} />
          <span>{t(value)}</span><span className="facet-option__count">{counts[value]}</span>
        </label>)}
      </div>
      {!matched.length && <p className="catalog-facet-hint">{t("No matching options.")}</p>}
      {!query && matched.length > visible.length && <Button variant="ghost" size="sm" className="facet-show-more" onClick={() => setShowAll(true)}>{t("Show all {count}", { count: options.length })}</Button>}
      {!query && showAll && <Button variant="ghost" size="sm" className="facet-show-more" onClick={() => setShowAll(false)}>{t("Show fewer")}</Button>}
    </fieldset>
  </details>
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
  const selectedCount = filters.platforms.length + filters.useCases.length + filters.capabilities.length + filters.materials.length + Number(filters.category !== "all") + Number(filters.previewOnly)
  const hasFilters = Boolean(filters.query.trim() || filters.topic !== "all" || selectedCount)
  const compact = hasFilters || filters.sort !== "recommended"
  const expanded = params.get("all") === "1"
  const featuredCount = Math.max(6, filtered.filter(recipe => recipe.recommendedOrder !== undefined).length)
  const leading = compact ? filtered : filtered.slice(0, featuredCount)
  const remaining = compact ? [] : filtered.slice(featuredCount)

  useCatalogMotion(resultsRef, search, filters.query)
  const commitQuery = useCallback((value: string) => {
    clearTimeout(queryTimer.current)
    const current = new URLSearchParams(window.location.search)
    const latest = readDiscoveryFilters(current)
    if (latest.query === value) return
    pendingSearch.current = value
    const next = writeDiscoveryFilters({ ...latest, query: value }, current)
    next.delete("all")
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
    if (document.activeElement === searchRef.current) return
    try {
      const saved = JSON.parse(sessionStorage.getItem(catalogPositionKey(`${window.location.pathname}${search}#recipes`)) ?? "null")
      if (saved?.href === `${window.location.pathname}${search}#recipes` && Number.isFinite(saved.scroll)) {
        const frame = requestAnimationFrame(() => window.scrollTo({ top: saved.scroll, behavior: "instant" }))
        return () => cancelAnimationFrame(frame)
      }
    } catch { /* A fresh catalog remains usable when storage is unavailable. */ }
  }, [search])

  useEffect(() => {
    if (searching || pendingSearch.current === null || pendingSearch.current !== filters.query) return
    const timer = setTimeout(() => {
      capture("catalog_action", { action: "search", placement: topicSlug ? "topic_list" : "catalog", topic_slug: topicSlug, result_count: filtered.length })
      pendingSearch.current = null
    }, 700)
    return () => clearTimeout(timer)
  }, [filters.query, filtered.length, capture, topicSlug, searching])

  function setFilters(next: DiscoveryFilters, action = "filter") {
    if (action !== "search") capture("catalog_action", { action, placement: topicSlug ? "topic_list" : "catalog", topic_slug: topicSlug, result_count: discoverRecipes(recipes, next).length })
    const nextParams = writeDiscoveryFilters(next, params)
    nextParams.delete("all")
    replaceCatalogSearch(nextParams)
  }
  function update<K extends keyof DiscoveryFilters>(key: K, value: DiscoveryFilters[K]) {
    setFilters({ ...filters, [key]: value }, key === "query" ? "search" : key === "sort" ? "sort" : "filter")
  }
  function updateQuery(value: string, immediate = false) {
    setQuery(value)
    if (immediate) { searchRef.current?.focus(); commitQuery(value) }
  }
  function facet(key: FacetKey, value: string) {
    update(key, toggle(filters[key], value))
  }
  function captureNavigation(event: MouseEvent<HTMLElement>) {
    const link = (event.target as Element).closest("a")
    if (link && new URL(link.href, window.location.origin).pathname.includes("/recipes/")) rememberCatalogPosition()
  }
  const returnTo = `${pathname}${search}#recipes`
  const chips = [
    ...(filters.topic === "all" ? [] : [{ key: "topic", label: t(quickTags.find(tag => tag.value === filters.topic)?.label ?? filters.topic), remove: () => update("topic", "all") }]),
    ...(filters.category === "all" ? [] : [{ key: "category", label: filters.category === "rtc" ? "RTC" : "Voice AI", remove: () => update("category", "all") }]),
    ...filters.materials.map(value => ({ key: `material:${value}`, label: t({ demo: "Demo", video: "Video", source: "Source", recipe: "Recipe" }[value] ?? value), remove: () => update("materials", filters.materials.filter(material => material !== value)) })),
    ...(["platforms", "useCases", "capabilities"] as const).flatMap(key => filters[key].map(value => ({ key: `${key}:${value}`, label: t(value), remove: () => facet(key, value) }))),
    ...(filters.previewOnly ? [{ key: "demo", label: t("Has a demo"), remove: () => update("previewOnly", false) }] : []),
  ]

  return <section id="recipes" className={embedded ? "catalog catalog--embedded" : "catalog"} aria-label={embedded ? t("Topic entries") : undefined} aria-labelledby={embedded ? undefined : "recipes-heading"} onClickCapture={captureNavigation} onAuxClickCapture={captureNavigation}>
    <div className="shell catalog-masthead">
      {!embedded && <h1 id="recipes-heading">{t("Explore projects and recipes.")}</h1>}
      {!embedded && <p>{t("Voice AI and real-time apps, with working code.")}</p>}
      <form role="search" className="catalog-search" onSubmit={event => { event.preventDefault(); if (!composing) commitQuery(query) }}>
        <label htmlFor="recipe-search" className="sr-only">{t("Search projects, guides, or authors")}</label>
        <InputGroup><InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon><InputGroupInput ref={searchRef} id="recipe-search" type="search" placeholder={t("Search projects, guides, or authors…")} aria-keyshortcuts="Meta+K Control+K" autoComplete="off" value={query} onFocus={guides.preload} onCompositionStart={() => setComposing(true)} onCompositionEnd={event => { setComposing(false); setQuery(event.currentTarget.value) }} onKeyDown={event => { if (!event.nativeEvent.isComposing && event.key === "Escape") { if (query) { event.preventDefault(); updateQuery("", true) } else event.currentTarget.blur() } }} onChange={event => updateQuery(event.target.value)} />
          <InputGroupAddon align="inline-end">{query ? <InputGroupButton size="icon-sm" aria-label={t("Clear search")} onClick={() => updateQuery("", true)}><X aria-hidden="true" /></InputGroupButton> : <kbd className="catalog-search__shortcut" aria-hidden="true">⌘ K</kbd>}</InputGroupAddon>
        </InputGroup>
      </form>
    </div>
    <div ref={barRef} className="catalog-bar">
      <div className="shell catalog-toolbar">
        <div className="catalog-topics-scroll">
          <ToggleGroup type="single" spacing={1} data-appearance="nav" className="catalog-topics ag-selection-group" aria-label={t("Quick filters")} value={filters.topic} onValueChange={value => update("topic", value || "all")}>
            <SelectionIndicator value={filters.topic} />
            {quickTags.map(tag => <ToggleGroupItem key={tag.value} value={tag.value}>{t(tag.value === "all" ? "All" : tag.label)}</ToggleGroupItem>)}
          </ToggleGroup>
        </div>
        <div className="catalog-toolbar-actions">
        <Sheet open={advanced} onOpenChange={setAdvanced}>
          <SheetTrigger asChild><Button variant="outline" className="catalog-filter-trigger" aria-label={selectedCount ? t("Filters, {count} active", { count: selectedCount }) : t("Filters")}><SlidersHorizontal aria-hidden="true" />{t("Filters")}{selectedCount > 0 && <Badge>{selectedCount}</Badge>}</Button></SheetTrigger>
          <SheetContent side={mobile ? "bottom" : "right"} className="catalog-filter-sheet">
            <SheetHeader><SheetTitle>{t("Refine recipes")}</SheetTitle><SheetDescription>{t("Find the right starting point for your project.")}</SheetDescription></SheetHeader>
            <div className="catalog-filter-sheet__body ag-reading-plane">
              <div className="catalog-sheet-sort"><span>{t("Sort by")}</span><CatalogSort value={filters.sort} query={filters.query} onChange={value => update("sort", value)} /></div>
              <fieldset className="catalog-category"><legend>{t("Category")}</legend>
                <ToggleGroup type="single" spacing={1} className="ag-selection-group" aria-label={t("Recipe category")} value={filters.category} onValueChange={value => update("category", value || "all")}>
                  <SelectionIndicator value={filters.category} />
                  {[["all", "All"], ["voice-ai", "Voice AI"], ["rtc", "RTC"]].map(([value, label]) => <ToggleGroupItem key={value} value={value}>{t(label)}</ToggleGroupItem>)}
                </ToggleGroup>
              </fieldset>
              <label className="facet-option catalog-demo-option"><Checkbox checked={filters.previewOnly} onCheckedChange={checked => update("previewOnly", checked === true)} /><span>{t("Has a demo")}</span><span className="facet-option__count">{t("Video or live app")}</span></label>
              <fieldset className="catalog-category catalog-materials"><legend>{t("Available materials")}</legend><p className="catalog-facet-hint">{t("Matches every selected material.")}</p><div className="facet-options">{[["demo", "Demo"], ["video", "Video"], ["source", "Source"], ["recipe", "Recipe"]].map(([value, label]) => <label key={value} className="facet-option"><Checkbox checked={filters.materials.includes(value)} onCheckedChange={() => update("materials", toggle(filters.materials, value))} /><span>{t(label)}</span></label>)}</div></fieldset>
              <FilterFacet label={t("Platforms & languages")} hint={t("Matches any selected technology.")} facet="platforms" options={options.platforms} recipes={recipes} filters={filters} onChange={value => facet("platforms", value)} initiallyOpen />
              <FilterFacet label={t("Use cases")} hint={t("Matches any selected use case.")} facet="useCases" options={options.useCases} recipes={recipes} filters={filters} onChange={value => facet("useCases", value)} />
              <FilterFacet label={t("Models & capabilities")} hint={t("Matches every selected capability.")} facet="capabilities" options={options.capabilities} recipes={recipes} filters={filters} onChange={value => facet("capabilities", value)} />
            </div>
            <SheetFooter>
              <Button variant="ghost" disabled={!selectedCount && filters.topic === "all"} onClick={() => setFilters({ ...defaultFilters, query: filters.query, sort: filters.sort })}>{t("Reset filters")}</Button>
              <SheetClose asChild><Button className="catalog-filter-results"><span key={filtered.length} className="ag-value-change">{filtered.length === 1 ? t("Show 1 result") : t("Show {count} results", { count: filtered.length })}</span></Button></SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
        <div className="catalog-toolbar-sort"><CatalogSort value={filters.sort} query={filters.query} onChange={value => update("sort", value)} /></div>
        </div>
      </div>
    </div>
    <div className="shell">
      {chips.length > 0 && <div className="catalog-selected" role="group" aria-label={t("Selected filters")}>
        {chips.map(chip => <Button variant="secondary" size="sm" key={chip.key} onClick={chip.remove} aria-label={t("Remove {label} filter", { label: chip.label })}>{chip.label}<X aria-hidden="true" /></Button>)}
        <Button variant="ghost" size="sm" onClick={() => setFilters({ ...defaultFilters, query: filters.query })}>{t("Clear filters")}</Button>
      </div>}
      <div className="catalog-results-meta" data-compact={compact}>
        <h2 id="catalog-results-heading" aria-live="polite" aria-atomic="true">{searching ? t("Searching…") : compact ? filtered.length === 1 ? t("1 result") : t("{count} results", { count: filtered.length }) : t("Explore the collection")}{!compact && !searching && <span>{recipes.length === 1 ? t("1 entry") : t("{count} entries", { count: recipes.length })}</span>}</h2>
        {query && guides.status === "error" && <p className="catalog-search-status" role="status">{t("Searching project details only.")} <Button variant="link" size="sm" onClick={guides.retry}>{t("Retry guide search")}</Button></p>}
      </div>
      {filtered.length ? <>
        <div ref={resultsRef} aria-busy={searching} className={compact ? "recipe-results" : "showcase-grid"}>{leading.map(recipe => <RecipeCard key={recipe.slug} recipe={recipe} returnTo={returnTo} compact={compact} />)}</div>
        {remaining.length > 0 && <details className="catalog-continuation" open={expanded} onToggle={event => {
          const open = event.currentTarget.open
          if (open === expanded) return
          capture("catalog_action", { action: open ? "expand" : "collapse", placement: topicSlug ? "topic_list" : "catalog", topic_slug: topicSlug })
          const next = new URLSearchParams(params)
          if (open) next.set("all", "1"); else next.delete("all")
          replaceCatalogSearch(next)
        }}>
          <summary className="ag-button ag-button-outline ag-control-lg"><span>{expanded ? t("Show fewer recipes") : t("Explore {count} more recipes", { count: remaining.length })}</span><ChevronDown aria-hidden="true" /></summary>
          {expanded && <div className="recipe-results catalog-rest">{remaining.map(recipe => <RecipeCard key={recipe.slug} recipe={recipe} returnTo={returnTo} compact />)}</div>}
        </details>}
      </> : searching ? <div className="catalog-empty" aria-hidden="true" /> : <Empty className="catalog-empty"><EmptyHeader><EmptyTitle>{t("No matching recipes")}</EmptyTitle><EmptyDescription>{t("Try a broader search or remove a filter above.")}</EmptyDescription></EmptyHeader><Button variant="outline" onClick={() => { setFilters(defaultFilters); searchRef.current?.focus() }}>{t("Clear search and filters")}</Button></Empty>}
    </div>
  </section>
}
