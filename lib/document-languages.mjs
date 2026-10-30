// Site-owned interpretation only. Author filenames, URLs, and text are unchanged.
const aliases = {
  en: "en", english: "en", "en-us": "en", "en-gb": "en",
  "zh-hans": "zh-Hans", "zh-cn": "zh-Hans", "zh-sg": "zh-Hans", "简体中文": "zh-Hans", "简体": "zh-Hans", "simplified chinese": "zh-Hans",
  "zh-hant": "zh-Hant", "zh-tw": "zh-Hant", "zh-hk": "zh-Hant", "繁體中文": "zh-Hant", "繁体中文": "zh-Hant", "traditional chinese": "zh-Hant",
  ja: "ja", jp: "ja", "ja-jp": "ja", japanese: "ja", "日本語": "ja",
  hi: "hi", hindi: "hi", "हिन्दी": "hi", "हिंदी": "hi",
  es: "es", spanish: "es", español: "es",
  pt: "pt", portuguese: "pt", português: "pt", "pt-br": "pt-BR", "português (brasil)": "pt-BR", "brazilian portuguese": "pt-BR",
  zh: "zh", chinese: "zh", "中文": "zh",
}

/** @param {string | undefined} value */
export function normalizeDocumentLocale(value) {
  if (!value) return undefined
  const label = value.replace(/<[^>]+>|[*_]|\p{Regional_Indicator}/gu, "").trim().toLowerCase()
  if (Object.hasOwn(aliases, label)) return aliases[label]
  if (!/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(label)) return undefined
  try { return Intl.getCanonicalLocales(label)[0] } catch { return undefined }
}

const navigationLanguages = new Set(["en", "zh", "zh-Hans", "zh-Hant", "ja", "hi", "es", "pt", "pt-BR"])
function navigationText(markdown) {
  let fence = ""
  const lines = []
  for (const line of markdown.split("\n")) {
    const marker = line.match(/^\s{0,3}(`{3,}|~{3,})/)
    if (marker) { if (!fence) fence = marker[1]; else if (fence[0] === marker[1][0] && marker[1].length >= fence.length) fence = ""; continue }
    if (!fence && !/^(?: {4}|\t)/.test(line)) lines.push(line)
  }
  return lines.join("\n").slice(0, 6000)
}

/** @param {string} markdown @param {string} viewUrl */
export function authorLanguageLinks(markdown, viewUrl) {
  const navigation = navigationText(markdown)
  const links = [...navigation.matchAll(/(?<!!)\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)].map(match => [match[1], match[2]])
  for (const match of navigation.matchAll(/<a\s[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) links.push([match[2], match[1]])
  return links.flatMap(([label, href]) => {
    const language = normalizeDocumentLocale(label)
    if (!navigationLanguages.has(language)) return []
    try {
      const url = new URL(href, viewUrl)
      if (url.protocol !== "https:" || url.username || url.password || !/\.md$/i.test(url.pathname)) return []
      url.hash = ""; url.search = ""
      return [{ language, url: url.href }]
    } catch { return [] }
  })
}

/** @param {string} a @param {string} b */
export function sameGithubGuide(a, b) {
  const parts = value => new URL(value).pathname.match(/^\/([^/]+\/[^/]+)\/blob\/([^/]+)\/(.+\.md)$/i)
  try {
    if (new URL(a).hostname !== "github.com" || new URL(b).hostname !== "github.com") return false
    const left = parts(a), right = parts(b)
    const stem = value => value.split("/").pop().replace(/\.md$/i, "").replace(/[._-](?:en|zh(?:[-_](?:cn|tw|hk|hans|hant))?|ja|jp|hi|es|pt(?:[-_](?:br|pt))?)$/i, "").toLowerCase()
    return Boolean(left && right && left[1] === right[1] && left[2] === right[2] && stem(left[3]) === stem(right[3]))
  } catch { return false }
}

/** @param {Record<string, unknown>} options */
export async function discoverDocumentLanguages({ sourceUrl, markdown, mapping = {}, fetchDocument }) {
  const versions = {}
  let originalLanguage = normalizeDocumentLocale(mapping.originalLanguage)
  const links = authorLanguageLinks(markdown, sourceUrl)
  // A current-language marker beside the author's version links also identifies
  // the submitted original, even when an alternate file is temporarily missing.
  for (const line of navigationText(markdown).split("\n")) {
    if (!authorLanguageLinks(line, sourceUrl).length) continue
    const marker = [...line.matchAll(/\*\*([^*]+)\*\*/g)].map(match => normalizeDocumentLocale(match[1])).find(language => navigationLanguages.has(language))
    originalLanguage ??= marker
  }
  for (const link of links.slice(0, 8)) {
    if (link.url === sourceUrl) { originalLanguage ??= link.language; continue }
    if (!sameGithubGuide(sourceUrl, link.url) || versions[link.language]) continue
    const document = await fetchDocument(link.url)
    if (document.fetchError || !document.markdown) continue
    const reciprocal = authorLanguageLinks(document.markdown, link.url).find(back => back.url === sourceUrl)
    if (!reciprocal || (originalLanguage && originalLanguage !== reciprocal.language)) continue
    originalLanguage ??= reciprocal.language
    versions[link.language] = { ...document, language: link.language, verifiedBy: "author-navigation" }
  }
  for (const [label, url] of Object.entries(mapping.versions ?? {})) {
    const language = normalizeDocumentLocale(label)
    if (!language) throw new Error(`[documents] Unsupported language mapping: ${label}`)
    const parsed = new URL(String(url))
    if (parsed.protocol !== "https:" || parsed.username || parsed.password) throw new Error("[documents] Language versions require public HTTPS source URLs without credentials")
    if (url === sourceUrl) { originalLanguage = language; continue }
    versions[language] = { ...await fetchDocument(url), language, verifiedBy: "maintainer" }
  }
  return { ...(originalLanguage ? { originalLanguage } : {}), versions }
}
