"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react"
import type { Recipe, FilterOptionsByTag, RecipeTag } from "@/lib/recipes"
import { RecipeCard } from "@/components/recipe-card"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type Filters = { query: string; platforms: string[]; useCases: string[]; capabilities: string[] }
const EMPTY: Filters = { query: "", platforms: [], useCases: [], capabilities: [] }
const TYPES = [{ tag: "voice-ai", label: "Voice AI" }, { tag: "rtc", label: "RTC" }] as const
const VISIBLE_PLATFORMS = ["iOS", "Android", "Flutter", "Go", "Python", "React Native", "TypeScript"]
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
  const options = filterOptionsByTag[tag]
  const platforms = VISIBLE_PLATFORMS.filter(platform => options.platforms.includes(platform))
  const otherPlatforms = options.platforms.filter(platform => !VISIBLE_PLATFORMS.includes(platform))
  const tagged = useMemo(() => recipes.filter(recipe => recipe.tags.includes(tag)),[recipes,tag])
  const filtered = useMemo(() => tagged.filter(recipe => {
    if (filters.query.trim() && !searchText(recipe).includes(filters.query.trim().toLowerCase())) return false
    if (filters.platforms.length && !filters.platforms.some(value => recipe.platforms.includes(value))) return false
    if (filters.useCases.length && !filters.useCases.some(value => recipe.useCases.includes(value))) return false
    return filters.capabilities.every(value => recipe.capabilities.includes(value))
  }),[tagged,filters])
  const count = filters.platforms.length + filters.useCases.length + filters.capabilities.length
  useEffect(() => {
    if (!advanced) return
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { setAdvanced(false); filterButton.current?.focus() } }
    document.addEventListener("keydown",onKey)
    return () => document.removeEventListener("keydown",onKey)
  },[advanced])
  function facet(key: "platforms" | "useCases" | "capabilities", value: string) { setFilters(current => ({ ...current,[key]: toggle(current[key],value) })) }
  return <section id="recipes" className="catalog" aria-labelledby="recipes-heading">
    <h2 id="recipes-heading" className="sr-only">Recipe library</h2>
    <div className="catalog-bar">
      <div className="shell catalog-bar__inner">
        <form role="search" className="catalog-search" onSubmit={event => event.preventDefault()}>
          <Search size={20} strokeWidth={1} aria-hidden="true" />
          <label htmlFor="recipe-search" className="sr-only">Search recipes, authors, or GitHub handles</label>
          <input id="recipe-search" type="search" placeholder="Search recipes, authors, or GitHub handles" value={filters.query} onChange={event => setFilters(current => ({...current,query: event.target.value}))} />
        </form>
        <div className="catalog-types" role="group" aria-label="Recipe type">
          {TYPES.map(type => <button key={type.tag} type="button" className="underline-tab" aria-pressed={tag === type.tag} onClick={() => { setTag(type.tag); setFilters(EMPTY); setAdvanced(false) }}>{type.label}<span>{recipes.filter(recipe => recipe.tags.includes(type.tag)).length}</span></button>)}
        </div>
      </div>
    </div>
    <div className="shell">
      <div className="catalog-facets">
        <div className="platform-filters" role="group" aria-label="Filter by platform">
          <span>Platform</span>
          {platforms.map(platform => <button type="button" className="filter-chip" key={platform} aria-pressed={filters.platforms.includes(platform)} onClick={() => facet("platforms",platform)}>{platform}</button>)}
          {otherPlatforms.length > 0 && <DropdownMenu><DropdownMenuTrigger asChild><button type="button" className="filter-chip gap-2">More{filters.platforms.some(platform => otherPlatforms.includes(platform)) && ` (${filters.platforms.filter(platform => otherPlatforms.includes(platform)).length})`}<ChevronDown size={16} aria-hidden="true" /></button></DropdownMenuTrigger><DropdownMenuContent align="end">{otherPlatforms.map(platform => <DropdownMenuCheckboxItem key={platform} checked={filters.platforms.includes(platform)} onCheckedChange={() => facet("platforms", platform)}>{platform}</DropdownMenuCheckboxItem>)}</DropdownMenuContent></DropdownMenu>}
        </div>
        <button type="button" ref={filterButton} className="action action-secondary" aria-expanded={advanced} aria-controls="advanced-recipe-filters" onClick={() => setAdvanced(!advanced)}>{advanced ? <X size={16} aria-hidden="true" /> : <SlidersHorizontal size={16} aria-hidden="true" />}Filters{count > 0 && ` (${count})`}</button>
      </div>
      {advanced && <div id="advanced-recipe-filters" className="catalog-advanced">
        {(["useCases","capabilities"] as const).map(key => <fieldset key={key}>
          <legend className="eyebrow">{key === "useCases" ? "Use cases" : "Capabilities"}</legend>
          {key === "capabilities" && <p className="mb-3 text-[13px] text-muted-foreground">Recipes must match every selected capability.</p>}
          <div className="flex flex-wrap gap-2">{options[key].map(value => <button type="button" key={value} className="filter-chip" aria-pressed={filters[key].includes(value)} onClick={() => facet(key,value)}>{value}</button>)}</div>
        </fieldset>)}
      </div>}
      <div className="catalog-results-meta">
        <p role="status">Showing <span className="text-foreground">{filtered.length}</span> of {tagged.length} recipes</p>
        {(count > 0 || filters.query) && <button type="button" className="text-action" onClick={() => setFilters(EMPTY)}><X size={16} aria-hidden="true" />Clear filters</button>}
      </div>
      {filtered.length ? <div className="recipe-grid">{filtered.map(recipe => <Link key={recipe.slug} href={`/recipes/${recipe.slug}`}><RecipeCard recipe={recipe} /></Link>)}</div> : <div className="empty-recipes"><h3>{tagged.length ? "No recipes match" : `No ${tag === "rtc" ? "RTC" : "Voice AI"} recipes yet`}</h3><p>{tagged.length ? "Try a different search or remove a filter." : "Recipes will appear here as they are added."}</p>{tagged.length > 0 && <button type="button" className="text-action" onClick={() => setFilters(EMPTY)}>Clear filters</button>}</div>}
    </div>
  </section>
}
