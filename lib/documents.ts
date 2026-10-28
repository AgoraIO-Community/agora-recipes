import type { CatalogEntry, RecipeDocument } from "./recipes"

export type DocumentLanguages = {
  originalLanguage?: string
  versions: Record<string, RecipeDocument & { language: string; verifiedBy: "author-navigation" | "maintainer" }>
}

export function selectDocument(entry: CatalogEntry, locale: string, manual?: string) {
  const languages = entry.documentLanguages
  const original = { key: "original", language: languages?.originalLanguage, document: entry.recipeDocument }
  const versions = Object.entries(languages?.versions ?? {}).map(([key, document]) => ({ key, language: document.language, document }))
  const all = [original, ...versions]
  if (manual) return { ...(all.find(version => version.key === manual || version.language === manual) ?? { key: manual, language: manual, document: undefined }), manual: true }
  const available = all.filter(version => version.document.markdown && !version.document.fetchError)
  return { ...(available.find(version => version.language === locale) ?? available.find(version => version.language === "en") ?? original), manual: false }
}

export function documentLanguageName(language?: string): string {
  return ({ en: "English", "zh-Hans": "简体中文", "zh-Hant": "繁體中文", ja: "日本語", zh: "中文" } as Record<string, string>)[language ?? ""] ?? language ?? "Language not specified"
}

export function documentPath(slug: string, key?: string): string {
  return `/recipes/${slug}${key ? `/guide/${encodeURIComponent(key)}` : ""}`
}
