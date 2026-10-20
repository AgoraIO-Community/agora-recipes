import type { RecipeMeta } from "./recipes"

export type Showcase = {
  slug: string
  title: string
  compactTitle?: string
  compactSummary?: string
  summary: string
  thumbnail: string
  thumbnailAlt: string
  thumbnailSource: string
  thumbnailScale?: number
  thumbnailOrigin?: string
  videoUrl?: string
  videoDuration?: string
  demoUrl?: string
  demoNote: string
  labels: string[]
  searchTerms: string[]
}

export type RecipeSummary = Omit<RecipeMeta, "cli"> & {
  slug: string
  showcase?: Showcase
  recommendedOrder?: number
}

export const quickTags = [
  { value: "all", label: "All topics", terms: [] },
  { value: "voice", label: "Voice agents", terms: ["voice agent", "conversational ai"] },
  { value: "video", label: "Video calling", terms: ["video calling", "live video"] },
  { value: "tools", label: "Tool calling", terms: ["tool calling"] },
  { value: "transcription", label: "Transcription", terms: ["transcription", "stt", "speech-to-text"] },
  { value: "translation", label: "Translation", terms: ["translation", "translator"] },
] as const

export type DiscoveryFilters = {
  query: string
  topic: string
  category: string
  platform: string
  useCase: string
  capability: string
  previewOnly: boolean
  sort: "recommended" | "updated" | "title"
}

export const defaultFilters: DiscoveryFilters = {
  query: "", topic: "all", category: "all",
  platform: "all", useCase: "all", capability: "all", previewOnly: false, sort: "recommended",
}

function normalize(value: string) {
  return value.normalize("NFKD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim()
}

// Common recipe vocabulary, shared by query and document normalization.
const aliases = [
  ["transcription", "transcribe", "transcript", "transcripts", "speech to text", "stt", "语音转文字", "语音转写", "转写", "转录"],
  ["translation", "translate", "translator", "翻译"],
  ["tts", "text to speech", "speech synthesis", "语音合成"],
  ["tool calling", "function calling", "工具调用", "函数调用"],
  ["rag", "retrieval augmented generation", "knowledge base", "知识库", "检索增强"],
  ["crm", "customer relationship management", "客户关系管理", "客户管理"],
  ["assistant", "copilot", "助手"],
  ["meeting", "meetings", "会议"],
  ["podcast", "podcasts", "播客"],
  ["vision", "computer vision", "视觉"],
  ["sales", "selling", "销售"],
  ["voice", "speech", "语音"],
  ["video", "videos", "视频"],
  ["streaming", "stream", "直播"],
  ["commentary", "commentator", "解说"],
]
const aliasPatterns = aliases.flatMap(([canonical, ...terms]) => terms.map((term) => ({
  canonical,
  term,
  pattern: new RegExp(/[\u3400-\u9fff]/u.test(term) ? term : `(^| )${term}(?= |$)`, "gu"),
}))).sort((a, b) => b.term.length - a.term.length)
const stopWords = new Set("a an the to for of in on with and or is are be this that i me my you your can how do does".split(" "))

function searchText(value: string) {
  let text = normalize(value)
  for (const { pattern, canonical } of aliasPatterns) {
    text = text.replace(pattern, (match, prefix) => `${typeof prefix === "string" ? prefix : " "}${canonical} `)
  }
  return text.replace(/\s+/g, " ").trim()
}

// Bounded edit distance also accepts adjacent transpositions such as pyhton.
function closeWord(query: string, word: string) {
  if (!/^[a-z]{4,32}$/.test(query) || !/^[a-z]+$/.test(word)) return false
  const limit = query.length >= 8 ? 2 : 1
  if (Math.abs(query.length - word.length) > limit) return false
  let previous = Array.from({ length: word.length + 1 }, (_, index) => index)
  let beforePrevious = previous
  for (let i = 1; i <= query.length; i++) {
    const row = [i]
    for (let j = 1; j <= word.length; j++) {
      row[j] = Math.min(row[j - 1] + 1, previous[j] + 1, previous[j - 1] + Number(query[i - 1] !== word[j - 1]))
      if (i > 1 && j > 1 && query[i - 1] === word[j - 2] && query[i - 2] === word[j - 1]) {
        row[j] = Math.min(row[j], beforePrevious[j - 2] + 1)
      }
    }
    if (Math.min(...row) > limit) return false
    beforePrevious = previous
    previous = row
  }
  return previous[word.length] <= limit
}

function searchScore(recipe: RecipeSummary, tokens: string[]): number {
  if (!tokens.length) return 1
  const fields = [
    { value: [recipe.title, recipe.showcase?.title, recipe.showcase?.compactTitle], weight: 40 },
    { value: [recipe.slug, recipe.author, recipe.mainRepoUrl, ...recipe.tags, ...recipe.platforms, ...recipe.useCases, ...recipe.capabilities, ...(recipe.showcase?.searchTerms ?? []), ...(recipe.showcase?.labels ?? [])], weight: 30 },
    { value: [recipe.tagline, recipe.description, recipe.showcase?.summary, recipe.showcase?.compactSummary], weight: 20 },
  ].map(({ value, weight }) => {
    const text = searchText(value.filter(Boolean).join(" "))
    return { text, words: [...new Set(text.split(" "))], weight }
  })
  let score = 0
  for (const token of tokens) {
    let best = 0
    for (const { text, words, weight } of fields) {
      const exact = token.length <= 2 ? words.includes(token) : token.length === 3 ? words.some((word) => word.startsWith(token)) : text.includes(token)
      if (exact) best = Math.max(best, weight)
      else if (best < weight * .3 && words.some((word) => closeWord(token, word))) best = Math.max(best, weight * .3)
    }
    if (!best) return 0
    score += best
  }
  return score
}

export function discoverRecipes(recipes: RecipeSummary[], filters: DiscoveryFilters): RecipeSummary[] {
  const topic = quickTags.find((tag) => tag.value === filters.topic)
  const tokens = [...new Set(searchText(filters.query).split(" ").filter((token) => token && !stopWords.has(token)))]
  return recipes
    .map((recipe) => ({ recipe, score: searchScore(recipe, tokens) }))
    .filter(({ recipe, score }) => {
      const topics = normalize([...recipe.useCases, ...recipe.capabilities, ...(recipe.showcase?.searchTerms ?? [])].join(" "))
      return score > 0 &&
        (filters.category === "all" || recipe.tags.includes(filters.category as "voice-ai" | "rtc")) &&
        (filters.platform === "all" || recipe.platforms.includes(filters.platform)) &&
        (filters.useCase === "all" || recipe.useCases.includes(filters.useCase)) &&
        (filters.capability === "all" || recipe.capabilities.includes(filters.capability)) &&
        (!filters.previewOnly || Boolean(recipe.showcase?.videoUrl || recipe.showcase?.demoUrl)) &&
        (!topic?.terms.length || topic.terms.some((term) => topics.includes(normalize(term))))
    })
    .sort((a, b) => {
      if (filters.sort === "title") return a.recipe.title.localeCompare(b.recipe.title)
      if (filters.sort === "updated") return b.recipe.updated.localeCompare(a.recipe.updated) || a.recipe.title.localeCompare(b.recipe.title)
      return b.score - a.score || (a.recipe.recommendedOrder ?? Infinity) - (b.recipe.recommendedOrder ?? Infinity) || b.recipe.updated.localeCompare(a.recipe.updated) || a.recipe.title.localeCompare(b.recipe.title)
    })
    .map(({ recipe }) => recipe)
}
