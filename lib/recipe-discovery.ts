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
  demoNote: string
  labels: string[]
  searchTerms: string[]
}

export type RecipeSummary = Omit<RecipeMeta, "cli"> & {
  slug: string
  showcase?: Showcase
  recommendedOrder?: number
  searchTerms?: string[]
  guideSearchText?: string
  searchExcerpt?: string
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
  platforms: string[]
  useCases: string[]
  capabilities: string[]
  materials: string[]
  previewOnly: boolean
  sort: "recommended" | "updated" | "title"
}

export const defaultFilters: DiscoveryFilters = {
  query: "", topic: "all", category: "all",
  platforms: [], useCases: [], capabilities: [], materials: [], previewOnly: false, sort: "recommended",
}

const filterParams = ["q", "topic", "category", "platform", "useCase", "capability", "demo", "sort", "material"]

export function readDiscoveryFilters(params: URLSearchParams): DiscoveryFilters {
  const values = (key: string) => [...new Set(params.getAll(key).filter(Boolean))]
  const topic = params.get("topic") ?? "all"
  const category = params.get("category") ?? "all"
  const sort = params.get("sort")
  return {
    query: params.get("q") ?? "",
    topic: quickTags.some(tag => tag.value === topic) ? topic : "all",
    category: ["voice-ai", "rtc"].includes(category) ? category : "all",
    platforms: values("platform"),
    useCases: values("useCase"),
    capabilities: values("capability"),
    materials: values("material").filter(value => ["demo", "video", "source", "recipe"].includes(value)),
    previewOnly: params.get("demo") === "1",
    sort: sort === "updated" || sort === "title" ? sort : "recommended",
  }
}

export function writeDiscoveryFilters(filters: DiscoveryFilters, current = new URLSearchParams()): URLSearchParams {
  const params = new URLSearchParams(current)
  for (const key of filterParams) params.delete(key)
  if (filters.query) params.set("q", filters.query)
  if (filters.topic !== "all") params.set("topic", filters.topic)
  if (filters.category !== "all") params.set("category", filters.category)
  for (const value of filters.platforms) params.append("platform", value)
  for (const value of filters.useCases) params.append("useCase", value)
  for (const value of filters.capabilities) params.append("capability", value)
  for (const value of filters.materials) params.append("material", value)
  if (filters.previewOnly) params.set("demo", "1")
  if (filters.sort !== "recommended") params.set("sort", filters.sort)
  return params
}

export function entryMaterials(entry: RecipeSummary): string[] {
  return [...(entry.demoUrl ? ["demo"] : []), ...(entry.showcase?.videoUrl || entry.media?.videoUrl ? ["video"] : []), ...(entry.mainRepoUrl ? ["source"] : []), ...(entry.recipeUrl ? ["recipe"] : [])]
}

function normalize(value: string) {
  return value.normalize("NFKD").replace(/(\p{Script=Latin})\p{M}+/gu, "$1").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim()
}

// Common recipe vocabulary, shared by query and document normalization.
const aliases = [
  ["transcription", "transcribe", "transcript", "transcripts", "speech to text", "stt", "语音转文字", "语音转写", "转写", "转录", "轉寫", "轉錄", "captions", "caption", "字幕", "文字起こし"],
  ["translation", "translate", "translator", "翻译", "翻譯", "翻訳"],
  ["tts", "text to speech", "speech synthesis", "语音合成"],
  ["tool calling", "function calling", "工具调用", "函数调用"],
  ["rag", "retrieval augmented generation", "knowledge base", "知识库", "检索增强"],
  ["crm", "customer relationship management", "客户关系管理", "客户管理"],
  ["assistant", "copilot", "助手"],
  ["meeting", "meetings", "会议", "會議", "会議"],
  ["podcast", "podcasts", "播客", "ポッドキャスト"],
  ["vision", "computer vision", "视觉"],
  ["sales", "selling", "销售"],
  ["voice", "speech", "语音", "語音", "音声"],
  ["video", "videos", "视频"],
  ["streaming", "stream", "直播"],
  ["commentary", "commentator", "解说"],
  ["agent", "agents", "智能体", "智能體", "エージェント"],
  ["voice agent", "voiceagent", "voice bot", "voicebot"],
  ["dumpling", "dumplings", "饺子", "餃子"],
  ["realtime", "real time", "实时", "實時", "リアルタイム"],
  ["irte2026", "irte 2026", "rte2026", "rte 2026"],
]
const aliasPatterns = aliases.flatMap(([canonical, ...terms]) => terms.map((term) => ({
  canonical,
  term,
  pattern: new RegExp(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(term) ? term : `(^| )${term}(?= |$)`, "gu"),
}))).sort((a, b) => b.term.length - a.term.length)
const stopWords = new Set("a an the to for of in on with and or is are be this that i me my you your can how do does it its we our want need looking find please using use 我 我想 我要 想要 想 要 找 个 一个 的 怎么 如何 请 有没有 可以 能 做 吗 有 帮 帮我 使用 用 の を は が に で と です ます したい ください".split(" "))

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

type SearchField = { text: string; words: string[]; weight: number; guide?: boolean }
const searchFields = new WeakMap<RecipeSummary, SearchField[]>()
function fieldsFor(recipe: RecipeSummary): SearchField[] {
  const cached = searchFields.get(recipe)
  if (cached) return cached
  const fields = [
    { value: [recipe.title, recipe.showcase?.title, recipe.showcase?.compactTitle], weight: 40 },
    { value: [recipe.slug, recipe.author, recipe.mainRepoUrl, ...recipe.tags, ...recipe.platforms, ...recipe.useCases, ...recipe.capabilities, ...(recipe.searchTerms ?? []), ...(recipe.showcase?.searchTerms ?? []), ...(recipe.showcase?.labels ?? [])], weight: 30 },
    { value: [recipe.tagline, recipe.description, recipe.showcase?.summary, recipe.showcase?.compactSummary], weight: 20 },
    { value: [recipe.guideSearchText], weight: 5, guide: true },
  ].map(({ value, weight, guide }) => {
    const raw = value.filter(Boolean).join(" ")
    const text = `${normalize(raw)} ${searchText(raw)}`
    return { text, words: [...new Set(text.split(" "))], weight, guide }
  })
  searchFields.set(recipe, fields)
  return fields
}

const segmenter = new Intl.Segmenter("zh", { granularity: "word" })
function queryTokens(query: string): string[] {
  const words = searchText(query).split(" ").flatMap(word => /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(word) ? [...segmenter.segment(word)].filter(part => part.isWordLike).map(part => part.segment) : [word])
  return [...new Set(words.filter(word => word && !stopWords.has(word)))]
}

function fieldScore({ text, words, weight, guide }: SearchField, token: string): number {
  const cjk = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(token)
  const exact = cjk ? text.includes(token) : words.some(word => word === token || token.length >= (guide ? 3 : 2) && word.startsWith(token))
  if (exact) return weight
  // Typo tolerance stays on concise metadata; arbitrary code/document words do
  // not create thousands of weak fuzzy matches as the visitor types.
  return !guide && words.some(word => closeWord(token, word)) ? weight * .3 : 0
}

function searchScore(recipe: RecipeSummary, tokens: string[]): number {
  if (!tokens.length) return 1
  let score = 0
  for (const token of tokens) {
    const best = Math.max(...fieldsFor(recipe).map(field => fieldScore(field, token)))
    if (!best) return 0
    score += best
  }
  const phrase = tokens.join(" ")
  const exactPhrase = fieldsFor(recipe).filter(field => field.text.includes(phrase))
  return score + (exactPhrase.length ? tokens.length * 40 + Math.max(...exactPhrase.map(field => field.weight)) : 0)
}

function withGuideExcerpt(recipe: RecipeSummary, tokens: string[]): RecipeSummary {
  if (!recipe.guideSearchText) return recipe
  const guideToken = tokens.find(token => !fieldsFor(recipe).some(field => !field.guide && fieldScore(field, token)))
  if (!guideToken) return recipe
  const lines = recipe.guideSearchText.split(/\n+/).map(line => line.trim()).filter(Boolean)
  const candidates = lines.map((line, index) => {
    const text = `${normalize(line)} ${searchText(line)}`
    return { line, index, count: text.includes(guideToken) ? tokens.filter(token => text.includes(token)).length : 0 }
  }).filter(line => line.count).sort((a, b) => b.count - a.count || Number(b.line.length >= 55) - Number(a.line.length >= 55))
  if (!candidates.length) return recipe
  const chosen = candidates[0]
  const paragraph = chosen.line.length < 55 ? `${chosen.line} — ${lines[chosen.index + 1] ?? ""}` : chosen.line
  const positions = tokens.map(token => paragraph.toLowerCase().indexOf(token)).filter(position => position >= 0)
  const match = positions.length ? Math.min(...positions) : 0
  let start = Math.max(0, match - 55)
  const boundary = paragraph.indexOf(" ", start)
  if (start && boundary >= 0 && boundary < match) start = boundary + 1
  let end = Math.min(paragraph.length, start + 187)
  const lastSpace = paragraph.lastIndexOf(" ", end)
  if (end < paragraph.length && lastSpace > start + 125) end = lastSpace
  const excerpt = paragraph.slice(start, end).trim()
  return { ...recipe, searchExcerpt: `${start ? "… " : ""}${excerpt}${paragraph.length > end ? "…" : ""}` }
}

export function discoverRecipes(recipes: RecipeSummary[], filters: DiscoveryFilters): RecipeSummary[] {
  const topic = quickTags.find((tag) => tag.value === filters.topic)
  const tokens = queryTokens(filters.query)
  return recipes
    .map((recipe) => ({ recipe, score: searchScore(recipe, tokens) }))
    .filter(({ recipe, score }) => {
      const topics = normalize([...recipe.useCases, ...recipe.capabilities, ...(recipe.showcase?.searchTerms ?? [])].join(" "))
      return score > 0 &&
        (filters.category === "all" || recipe.tags.includes(filters.category as "voice-ai" | "rtc")) &&
        (!filters.platforms.length || filters.platforms.some((platform) => recipe.platforms.includes(platform))) &&
        (!filters.useCases.length || filters.useCases.some((useCase) => recipe.useCases.includes(useCase))) &&
        (!filters.capabilities.length || filters.capabilities.every((capability) => recipe.capabilities.includes(capability))) &&
        (!filters.previewOnly || Boolean(recipe.showcase?.videoUrl || recipe.demoUrl)) &&
        (!filters.materials.length || filters.materials.every(material => entryMaterials(recipe).includes(material))) &&
        (!topic?.terms.length || topic.terms.some((term) => topics.includes(normalize(term))))
    })
    .sort((a, b) => {
      if (filters.sort === "title") return a.recipe.title.localeCompare(b.recipe.title)
      if (filters.sort === "updated") return b.recipe.updated.localeCompare(a.recipe.updated) || a.recipe.title.localeCompare(b.recipe.title)
      return b.score - a.score || (a.recipe.recommendedOrder ?? Infinity) - (b.recipe.recommendedOrder ?? Infinity) || b.recipe.updated.localeCompare(a.recipe.updated) || a.recipe.title.localeCompare(b.recipe.title)
    })
    .map(({ recipe }) => withGuideExcerpt(recipe, tokens))
}
