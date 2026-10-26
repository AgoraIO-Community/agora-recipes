"use client"

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react"
import type { Recipe, FilterOptionsByTag, RecipeTag } from "@/lib/recipes"
import { RecipeCard } from "@/components/recipe-card"
import { AgoraLogo } from "@/components/agora-logo"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type Filters = { query: string; platforms: string[]; useCases: string[]; capabilities: string[] }
const EMPTY: Filters = { query: "", platforms: [], useCases: [], capabilities: [] }
const RECIPE_BATCH_SIZE = 12
const TYPES = [{ tag: "voice-ai", label: "Voice AI" }, { tag: "rtc", label: "RTC" }] as const
const toggle = (values: string[], value: string) => values.includes(value) ? values.filter(item => item !== value) : [...values,value]

function searchText(recipe: Recipe) {
  let owner = ""
  try { const url = new URL(recipe.mainRepoUrl); if (url.hostname === "github.com") owner = url.pathname.split("/").filter(Boolean)[0] || "" } catch {}
  return [recipe.title, recipe.tagline, recipe.description, recipe.author, owner, `@${owner}`, ...recipe.platforms, ...recipe.capabilities, ...recipe.useCases].join(" ").toLowerCase()
}

export function RecipeExplorer({ recipes, filterOptionsByTag }: { recipes: Recipe[]; filterOptionsByTag: FilterOptionsByTag }) {
  const [tag,setTag] = useState<RecipeTag>("voice-ai")
  const [filters,setFilters] = useState<Filters>(EMPTY)
  const [advanced,setAdvanced] = useState(false)
  const filterButton = useRef<HTMLButtonElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<HTMLDivElement>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const [pagination, setPagination] = useState({ key: "", limit: RECIPE_BATCH_SIZE })
  const [merged, setMerged] = useState(false)
  const keepSticky = useRef(false)
  const options = filterOptionsByTag[tag]
  const tagged = useMemo(() => recipes.filter(recipe => recipe.tags.includes(tag)),[recipes,tag])
  const filtered = useMemo(() => tagged.filter(recipe => {
    if (filters.query.trim() && !searchText(recipe).includes(filters.query.trim().toLowerCase())) return false
    if (filters.platforms.length && !filters.platforms.some(value => recipe.platforms.includes(value))) return false
    if (filters.useCases.length && !filters.useCases.some(value => recipe.useCases.includes(value))) return false
    return filters.capabilities.every(value => recipe.capabilities.includes(value))
  }),[tagged,filters])
  const resultsKey = JSON.stringify([tag, filters])
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
  const count = filters.platforms.length + filters.useCases.length + filters.capabilities.length
  useEffect(() => {
    const header = document.querySelector(".site-header")
    const bar = barRef.current
    if (!header || !bar) return
    const measure = () => {
      const height = header.getBoundingClientRect().height
      bar.style.setProperty("--catalog-header-height", `${height}px`)
      const next = !!markerRef.current && markerRef.current.getBoundingClientRect().top <= height
      setMerged(next)
      header.setAttribute("data-catalog-merged", String(next))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(header)
    window.addEventListener("scroll", measure, { passive: true })
    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", measure)
      header.removeAttribute("data-catalog-merged")
    }
  }, [])
  useLayoutEffect(() => {
    if (!keepSticky.current) return
    keepSticky.current = false
    const frame = requestAnimationFrame(() => {
      const bar = barRef.current
      const header = document.querySelector(".site-header")
      if (!bar || !header) return
      const offset = bar.getBoundingClientRect().top - (header.getAttribute("data-catalog-merged") === "true" ? 0 : header.getBoundingClientRect().height)
      if (offset < -1) window.scrollBy({ top: offset, behavior: "instant" })
    })
    return () => cancelAnimationFrame(frame)
  }, [filters, tag, advanced])
  function rememberStickyPosition() {
    const bar = barRef.current
    const header = document.querySelector(".site-header")
    keepSticky.current = !!bar && !!header && bar.getBoundingClientRect().top <= header.getBoundingClientRect().height + 1
  }
  useEffect(() => {
    if (!advanced) return
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { setAdvanced(false); filterButton.current?.focus() } }
    document.addEventListener("keydown",onKey)
    return () => document.removeEventListener("keydown",onKey)
  },[advanced])
  function facet(key: "platforms" | "useCases" | "capabilities", value: string) { setFilters(current => ({ ...current,[key]: toggle(current[key],value) })) }
  return <section id="recipes" className="catalog" aria-labelledby="recipes-heading" onClickCapture={rememberStickyPosition} onInputCapture={rememberStickyPosition} onChangeCapture={rememberStickyPosition}>
    <h2 id="recipes-heading" className="sr-only">Recipe library</h2>
    <div ref={markerRef} className="catalog-marker" aria-hidden="true" />
    <div ref={barRef} className="catalog-bar" data-merged={merged}>
      <div className="shell catalog-bar__inner">
        <Link href="/" className="catalog-brand" aria-label="Agora Recipes home"><AgoraLogo /></Link>
        <div className="catalog-types" role="group" aria-label="Recipe type">
          {TYPES.map(type => <button key={type.tag} type="button" className="catalog-filter" aria-pressed={tag === type.tag} onClick={() => { setTag(type.tag); setFilters(EMPTY); setAdvanced(false) }}>{type.label}<span>{recipes.filter(recipe => recipe.tags.includes(type.tag)).length}</span></button>)}
        </div>
        <form role="search" className="catalog-search" onSubmit={event => event.preventDefault()}>
          <Search size={20} strokeWidth={1} aria-hidden="true" />
          <label htmlFor="recipe-search" className="sr-only">Search recipes, authors, or GitHub handles</label>
          <input id="recipe-search" type="search" placeholder="Search recipes, authors, or GitHub handles" value={filters.query} onChange={event => setFilters(current => ({...current,query: event.target.value}))} />
        </form>
        <div className="platform-filters">
          <DropdownMenu><DropdownMenuTrigger asChild><button type="button" className="catalog-filter" aria-label={`Filter by platform: ${filters.platforms.length ? filters.platforms.join(", ") : "All platforms"}`} data-active={filters.platforms.length > 0 || undefined}>{filters.platforms.length === 1 ? filters.platforms[0] : filters.platforms.length ? `Platforms (${filters.platforms.length})` : "All platforms"}<ChevronDown size={16} aria-hidden="true" /></button></DropdownMenuTrigger><DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem checked={filters.platforms.length === 0} onCheckedChange={() => { rememberStickyPosition(); setFilters(current => ({ ...current, platforms: [] })) }}>All platforms</DropdownMenuCheckboxItem>
            {options.platforms.map(platform => <DropdownMenuCheckboxItem key={platform} checked={filters.platforms.includes(platform)} onCheckedChange={() => { rememberStickyPosition(); facet("platforms", platform) }}>{platform}</DropdownMenuCheckboxItem>)}
          </DropdownMenuContent></DropdownMenu>
          <button type="button" ref={filterButton} className="catalog-filter" aria-label={`Filters${count > 0 ? ` (${count})` : ""}`} data-active={advanced || count > 0 || undefined} aria-expanded={advanced} aria-controls="advanced-recipe-filters" onClick={() => setAdvanced(!advanced)}>{advanced ? <X size={16} strokeWidth={1.5} aria-hidden="true" /> : <SlidersHorizontal size={16} strokeWidth={1.5} aria-hidden="true" />}<span className="catalog-filter-label">Filters{count > 0 && ` (${count})`}</span></button>
        </div>
      </div>
    </div>
    <div className="shell">
      {advanced && <div id="advanced-recipe-filters" className="catalog-advanced">
        {(["useCases","capabilities"] as const).map(key => <fieldset key={key}>
          <legend className="eyebrow">{key === "useCases" ? "Use cases" : "Capabilities"}</legend>
          {key === "capabilities" && <p className="mb-3 text-[13px] text-muted-foreground">Recipes must match every selected capability.</p>}
          <div className="flex flex-wrap gap-x-7">{options[key].map(value => <button type="button" key={value} className="catalog-filter" aria-pressed={filters[key].includes(value)} onClick={() => facet(key,value)}>{value}</button>)}</div>
        </fieldset>)}
      </div>}
      <div className="catalog-results-meta">
        <p role="status">Showing <span className="text-foreground">{visibleRecipes.length}</span> of {filtered.length} recipes{filtered.length !== tagged.length && ` matching your filters (${tagged.length} total)`}</p>
        {(count > 0 || filters.query) && <button type="button" className="text-action" onClick={() => setFilters(EMPTY)}><X size={16} aria-hidden="true" />Clear filters</button>}
      </div>
      {filtered.length ? <div className="recipe-grid">{visibleRecipes.map(recipe => <Link key={recipe.slug} href={`/recipes/${recipe.slug}`}><RecipeCard recipe={recipe} /></Link>)}</div> : <div className="empty-recipes"><h3>{tagged.length ? "No recipes match" : `No ${tag === "rtc" ? "RTC" : "Voice AI"} recipes yet`}</h3><p>{tagged.length ? "Try a different search or remove a filter." : "Recipes will appear here as they are added."}</p>{tagged.length > 0 && <button type="button" className="text-action" onClick={() => setFilters(EMPTY)}>Clear filters</button>}</div>}
      {hasMore && <div ref={loadMoreRef} className="catalog-load-more" aria-hidden="true">Scroll for more recipes</div>}
    </div>
  </section>
}
