"use client"

import { useMemo, useState } from "react"
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react"
import { RecipeCard } from "@/components/recipe-card"
import { Button } from "@/components/agent-ui/button"
import { Input } from "@/components/agent-ui/input"
import { GlassSurface } from "@/components/agent-ui/glass-surface"
import { Field, FieldLabel } from "@/components/ui/field"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { defaultFilters, discoverRecipes, quickTags, type DiscoveryFilters, type RecipeSummary } from "@/lib/recipe-discovery"

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <Field className="gap-2">
      <FieldLabel>{label}</FieldLabel>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="catalog-filter-select" aria-label={label}><SelectValue /></SelectTrigger>
        <SelectContent className="catalog-select-menu" collisionPadding={12}><SelectGroup><SelectItem value="all">All {label.toLowerCase()}</SelectItem>{options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectGroup></SelectContent>
      </Select>
    </Field>
  )
}

export function RecipeExplorer({ recipes }: { recipes: RecipeSummary[] }) {
  const [filters, setFilters] = useState<DiscoveryFilters>(defaultFilters)
  const filtered = useMemo(() => discoverRecipes(recipes, filters), [recipes, filters])
  const options = useMemo(() => ({
    platforms: [...new Set(recipes.flatMap((recipe) => recipe.platforms))].sort(),
    useCases: [...new Set(recipes.flatMap((recipe) => recipe.useCases))].sort(),
    capabilities: [...new Set(recipes.flatMap((recipe) => recipe.capabilities))].sort(),
  }), [recipes])
  const advancedCount = [filters.category, filters.platform, filters.useCase, filters.capability].filter((value) => value !== "all").length + Number(filters.previewOnly)
  const hasFilters = Boolean(filters.query.trim() || filters.topic !== "all" || advancedCount)
  const leading = hasFilters ? filtered : filtered.slice(0, 6)
  const remaining = hasFilters ? [] : filtered.slice(6)

  function update<K extends keyof DiscoveryFilters>(key: K, value: DiscoveryFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  return (
    <div className="showcase-home agent-ui">
      <section className="showcase-container catalog-intro" aria-labelledby="showcase-title">
        <h1 id="showcase-title">Explore Agora recipes.</h1>
        <p>Voice AI & real-time demos, with code.</p>
      </section>

      <div className="showcase-container catalog-search-sticky">
        <div className="catalog-controls">
          <GlassSurface material="liquid" className="catalog-search">
          <Field className="gap-0">
            <FieldLabel htmlFor="recipe-search" className="sr-only">Search all recipes</FieldLabel>
            <div className="catalog-search-field">
              <Search aria-hidden="true" />
              <Input id="recipe-search" type="search" placeholder="Search recipes…" value={filters.query} onChange={(event) => update("query", event.target.value)} autoComplete="off" />
              {filters.query && <Button variant="ghost" size="icon" aria-label="Clear search" onClick={() => update("query", "")}><X aria-hidden="true" /></Button>}
            </div>
          </Field>
          </GlassSurface>
          <div className="discovery-quick-tags" role="group" aria-label="Quick topic filters">
            {quickTags.map((tag) => <Button key={tag.value} variant="ghost" className="quick-tag" aria-label={tag.label} aria-pressed={filters.topic === tag.value} onClick={() => update("topic", tag.value)}>{tag.value === "all" ? "All" : tag.label}</Button>)}
          </div>
        </div>
      </div>

      <section id="recipes" className="showcase-container catalog-results" aria-labelledby="recipes-title">
        <div className="discovery-results-heading">
          <h2 id="recipes-title" aria-live="polite" aria-atomic="true">{filtered.length} {filtered.length === 1 ? "recipe" : "recipes"}</h2>
          <div className="catalog-result-controls">
            <Popover>
              <PopoverTrigger asChild><Button variant="ghost" className="catalog-filter-trigger"><SlidersHorizontal aria-hidden="true" /><span>Filters{advancedCount > 0 && ` (${advancedCount})`}</span></Button></PopoverTrigger>
              <PopoverContent align="end" sideOffset={8} collisionPadding={12} className="agent-ui catalog-filter-panel" data-material="solid">
                <FilterSelect label="Categories" value={filters.category} options={["voice-ai", "rtc"]} onChange={(value) => update("category", value)} />
                <FilterSelect label="Platforms" value={filters.platform} options={options.platforms} onChange={(value) => update("platform", value)} />
                <FilterSelect label="Use cases" value={filters.useCase} options={options.useCases} onChange={(value) => update("useCase", value)} />
                <FilterSelect label="Capabilities" value={filters.capability} options={options.capabilities} onChange={(value) => update("capability", value)} />
                <div className="catalog-filter-footer">
                  <label className="catalog-preview-filter"><Checkbox checked={filters.previewOnly} onCheckedChange={(checked) => update("previewOnly", checked === true)} /> Has a demo</label>
                  {advancedCount > 0 && <Button variant="link" onClick={() => setFilters((current) => ({ ...current, category: "all", platform: "all", useCase: "all", capability: "all", previewOnly: false }))}>Reset</Button>}
                </div>
              </PopoverContent>
            </Popover>
            <Select value={filters.sort} onValueChange={(value) => update("sort", value as DiscoveryFilters["sort"])}>
              <SelectTrigger className="catalog-sort" aria-label="Sort recipes"><SelectValue /></SelectTrigger>
              <SelectContent className="catalog-select-menu" collisionPadding={12}><SelectGroup><SelectItem value="recommended">Recommended</SelectItem><SelectItem value="updated">Recently updated</SelectItem><SelectItem value="title">A–Z</SelectItem></SelectGroup></SelectContent>
            </Select>
          </div>
        </div>

        {filtered.length ? (
          <>
            <div className="showcase-grid">{leading.map((recipe) => <RecipeCard key={recipe.slug} recipe={recipe} />)}</div>
            {remaining.length > 0 && <details className="catalog-continuation">
              <summary>
                <span className="catalog-peek" aria-hidden="true">{remaining.slice(0, 3).map((recipe) => <span className="catalog-peek-card" key={recipe.slug}><strong>{recipe.title}</strong><span className="catalog-peek-author">{recipe.author}</span></span>)}</span>
                <span className="catalog-continuation-label">{remaining.length} more recipes <ChevronDown aria-hidden="true" /></span>
              </summary>
              <div className="showcase-grid catalog-rest">{remaining.map((recipe) => <RecipeCard key={recipe.slug} recipe={recipe} />)}</div>
            </details>}
          </>
        ) : (
          <Empty className="catalog-empty"><EmptyHeader><EmptyTitle>No recipes found.</EmptyTitle><EmptyDescription>Try another keyword or clear your filters.</EmptyDescription></EmptyHeader><Button variant="outline" onClick={() => setFilters(defaultFilters)}>Clear search and filters</Button></Empty>
        )}
      </section>
    </div>
  )
}
