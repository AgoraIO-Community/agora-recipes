import type { CatalogEntry } from "./recipes"

type Crumb = { name: string; path: string }
const schema = "https://schema.org"
const languages = new Set(["TypeScript", "JavaScript", "Python", "Go", "Rust", "Swift", "Kotlin", "Java", "C", "C#", "C++", "Dart"])
const url = (origin: string, path: string) => new URL(path, origin).href

export function serializeStructuredData(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029")
}

export function websiteSchema(origin: string) {
  return { "@context": schema, "@type": "WebSite", "@id": url(origin, "/#website"), url: url(origin, "/"), name: "Agora Recipes", alternateName: "Agora Voice AI Recipes" }
}

export function breadcrumbSchema(origin: string, crumbs: Crumb[]) {
  return { "@context": schema, "@type": "BreadcrumbList", itemListElement: crumbs.map((crumb, index) => ({ "@type": "ListItem", position: index + 1, name: crumb.name, item: url(origin, crumb.path) })) }
}

export function directorySchema(origin: string, path: string, title: string, entries: { title: string; path: string }[]) {
  return { "@context": schema, "@type": "CollectionPage", "@id": url(origin, path), url: url(origin, path), name: title,
    mainEntity: { "@type": "ItemList", numberOfItems: entries.length, itemListElement: entries.map((entry, index) => ({ "@type": "ListItem", position: index + 1, name: entry.title, url: url(origin, entry.path) })) } }
}

export function recipeSchema(origin: string, path: string, entry: CatalogEntry, modified: string, language?: string) {
  const pageUrl = url(origin, path)
  const codeId = url(origin, `/recipes/${entry.slug}#source-code`)
  const author = { "@type": entry.author === "Agora" ? "Organization" : "Person", name: entry.author }
  const guide = Boolean(entry.recipeUrl && entry.recipeDocument.markdown && !entry.recipeDocument.fetchError)
  const page = { "@type": guide ? "TechArticle" : "WebPage", "@id": pageUrl, url: pageUrl, name: entry.title, headline: entry.title,
    description: entry.description, author, dateModified: modified,
    ...(language && guide ? { inLanguage: language } : {}),
    ...(entry.mainRepoUrl ? { about: { "@id": codeId } } : {}) }
  return { "@context": schema, "@graph": [page, ...(entry.mainRepoUrl ? [{ "@type": "SoftwareSourceCode", "@id": codeId, name: entry.title, codeRepository: entry.mainRepoUrl,
    author, programmingLanguage: entry.platforms.filter(value => languages.has(value)) }] : [])] }
}
