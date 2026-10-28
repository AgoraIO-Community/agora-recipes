import "server-only"
import fs from "node:fs"
import path from "node:path"
import type { DocumentLanguages } from "./documents"
import type { Showcase } from "./recipe-discovery"

const CONTENT_DIR = path.join(process.cwd(), "content", "recipes")
const GENERATED_DIR = path.join(process.cwd(), "content", "generated", "recipes")

const PLATFORM_ORDER = ["Web", "iOS", "Android"] as const

export type Difficulty = "Beginner" | "Intermediate" | "Advanced"
export type RecipeTag = "voice-ai" | "rtc"

export type RecipeDocument = {
  rawUrl: string
  viewUrl: string
  markdown: string
  fetchError?: string
}

type GeneratedRecipeArtifact = {
  schemaVersion: number
  slug: string
  generatedAt: string
  source: {
    mainRepoUrl: string
    recipeUrl: string
    recipeRawUrl: string
  }
  recipeDocument: RecipeDocument
  documentLanguages?: DocumentLanguages
  primaryPrompt: string
}

export type RecipeMeta = {
  title: string
  tagline: string
  description: string
  tags: RecipeTag[]
  platforms: string[]
  useCases: string[]
  capabilities: string[]
  mainRepoUrl?: string
  recipeUrl?: string
  demoUrl?: string
  media?: Partial<Omit<Showcase, "slug">>
  author: string
  updated: string
  difficulty?: Difficulty
  cli?: RecipeCLIConfig
}

export type RecipeCLIConfig = {
  projectType: string
  env: {
    examplePath: string
    targetPath: string
    appIdKey: string
    appCertificateKey: string
  }
  installCommand?: string
  runCommand?: string
}

export type CatalogEntry = RecipeMeta & {
  slug: string
  generatedAt?: string
  recipeDocument: RecipeDocument
  documentLanguages?: DocumentLanguages
  primaryPrompt: string
}

export type Recipe = CatalogEntry & { mainRepoUrl: string; recipeUrl: string; difficulty: Difficulty }

export function hasRecipe(entry: CatalogEntry): entry is Recipe {
  return Boolean(entry.recipeUrl)
}

export type FilterOptions = {
  platforms: string[]
  useCases: string[]
  capabilities: string[]
}

export type FilterOptionsByTag = Record<RecipeTag, FilterOptions>

const REQUIRED_STRING_FIELDS: (keyof RecipeMeta)[] = [
  "title",
  "tagline",
  "description",
  "author",
  "updated",
]

const REQUIRED_ARRAY_FIELDS: (keyof RecipeMeta)[] = [
  "tags",
  "platforms",
  "useCases",
  "capabilities",
]

const VALID_DIFFICULTIES: Difficulty[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
]

const VALID_RECIPE_TAGS: RecipeTag[] = ["voice-ai", "rtc"]

function assertValidMeta(slug: string, meta: unknown): asserts meta is RecipeMeta {
  if (!meta || typeof meta !== "object") {
    throw new Error(`[recipes] ${slug}/recipe.json is not a JSON object`)
  }

  const m = meta as Record<string, unknown>

  for (const field of REQUIRED_STRING_FIELDS) {
    if (typeof m[field] !== "string" || (m[field] as string).trim().length === 0) {
      throw new Error(
        `[recipes] ${slug}/recipe.json is missing required string field "${field}"`,
      )
    }
  }

  for (const field of REQUIRED_ARRAY_FIELDS) {
    if (!Array.isArray(m[field]) || !(m[field] as unknown[]).every(value => typeof value === "string" && value.trim().length > 0)) {
      throw new Error(
        `[recipes] ${slug}/recipe.json field "${field}" must be an array`,
      )
    }
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(m.updated)) || !Number.isFinite(Date.parse(String(m.updated))) || new Date(String(m.updated)).toISOString().slice(0, 10) !== m.updated) throw new Error(`[recipes] ${slug}/recipe.json updated must be a valid YYYY-MM-DD date`)

  const tags = m.tags as unknown[]
  if (
    tags.length === 0 ||
    !tags.every((tag) => VALID_RECIPE_TAGS.includes(tag as RecipeTag))
  ) {
    throw new Error(
      `[recipes] ${slug}/recipe.json tags must be a non-empty array containing only ${VALID_RECIPE_TAGS.join(
        ", ",
      )}`,
    )
  }

  if ((m.recipeUrl || m.difficulty !== undefined) && !VALID_DIFFICULTIES.includes(m.difficulty as Difficulty)) {
    throw new Error(
      `[recipes] ${slug}/recipe.json difficulty must be one of ${VALID_DIFFICULTIES.join(
        ", ",
      )}`,
    )
  }

  for (const field of ["mainRepoUrl", "recipeUrl", "demoUrl"] as const) {
    if (m[field] === undefined) continue
    let valid = false
    try {
      const url = new URL(m[field] as string)
      valid = typeof m[field] === "string" && url.protocol === "https:" && !url.username && !url.password
    } catch { /* A malformed material link is a content error. */ }
    if (!valid) throw new Error(`[recipes] ${slug}/recipe.json ${field} must be an absolute HTTPS URL without credentials`)
  }
  if (m.recipeUrl && !m.mainRepoUrl) {
    const match = String(m.recipeUrl).match(/^https:\/\/github\.com\/([^/]+\/[^/]+)\/blob\//)
    if (!match) throw new Error(`[recipes] ${slug}/recipe.json needs mainRepoUrl for a guide outside GitHub`)
    m.mainRepoUrl = `https://github.com/${match[1]}`
  }
  if (m.media !== undefined) {
    if (!m.media || typeof m.media !== "object" || Array.isArray(m.media)) throw new Error(`[recipes] ${slug}/recipe.json media must be an object`)
    const media = m.media as Record<string, unknown>
    for (const field of ["title", "compactTitle", "summary", "compactSummary", "thumbnailAlt", "videoDuration", "demoNote", "thumbnailOrigin"]) {
      if (media[field] !== undefined && typeof media[field] !== "string") throw new Error(`[recipes] ${slug}/recipe.json media.${field} must be a string`)
    }
    for (const field of ["labels", "searchTerms"]) {
      if (media[field] !== undefined && (!Array.isArray(media[field]) || !(media[field] as unknown[]).every(value => typeof value === "string"))) throw new Error(`[recipes] ${slug}/recipe.json media.${field} must be an array of strings`)
    }
    if (media.thumbnailScale !== undefined && (typeof media.thumbnailScale !== "number" || !Number.isFinite(media.thumbnailScale) || media.thumbnailScale <= 0)) throw new Error(`[recipes] ${slug}/recipe.json media.thumbnailScale must be positive`)

    for (const field of ["videoUrl", "thumbnailSource"] as const) {
      if (media[field] === undefined) continue
      let valid = false
      try { const url = new URL(String(media[field])); valid = typeof media[field] === "string" && url.protocol === "https:" && !url.username && !url.password } catch {}
      if (!valid) throw new Error(`[recipes] ${slug}/recipe.json media.${field} must be an absolute HTTPS URL without credentials`)
    }
    if (media.thumbnail !== undefined) {
      let valid = false
      if (typeof media.thumbnail === "string") {
        try {
          const url = new URL(media.thumbnail, "https://catalog.invalid")
          const local = media.thumbnail.startsWith("/") && !media.thumbnail.startsWith("//") && url.origin === "https://catalog.invalid"
          valid = (local || media.thumbnail.startsWith("https://")) && url.protocol === "https:" && !url.username && !url.password
        } catch { /* A malformed image reference is a content error. */ }
      }
      if (!valid) throw new Error(`[recipes] ${slug}/recipe.json media.thumbnail must be a local path or HTTPS URL without credentials`)
    }
  }
  if (!m.recipeUrl && !m.mainRepoUrl && !m.demoUrl && !(m.media as Record<string, unknown> | undefined)?.videoUrl) throw new Error(`[recipes] ${slug}/recipe.json needs a Demo, video, source repository, or recipe`)

  if (m.cli !== undefined) {
    if (!m.recipeUrl) throw new Error(`[recipes] ${slug}/recipe.json cli requires a recipeUrl`)
    if (!m.cli || typeof m.cli !== "object") {
      throw new Error(`[recipes] ${slug}/recipe.json field "cli" must be an object`)
    }
    const cli = m.cli as Record<string, unknown>
    const env = cli.env as Record<string, unknown> | undefined
    if (typeof cli.projectType !== "string" || !env) {
      throw new Error(
        `[recipes] ${slug}/recipe.json cli requires projectType and env`,
      )
    }
    for (const field of [
      "examplePath",
      "targetPath",
      "appIdKey",
      "appCertificateKey",
    ]) {
      if (typeof env[field] !== "string" || env[field].length === 0) {
        throw new Error(
          `[recipes] ${slug}/recipe.json cli.env is missing "${field}"`,
        )
      }
    }
  }
}

function githubViewUrlToRawUrl(viewUrl: string): string {
  const match = viewUrl.match(
    /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/,
  )
  if (!match) return viewUrl

  const [, org, repo, branch, filePath] = match
  return `https://raw.githubusercontent.com/${org}/${repo}/${branch}/${filePath}`
}

function rawGithubUrlToViewUrl(rawUrl: string): string {
  const match = rawUrl.match(
    /^https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)$/,
  )
  if (!match) return rawUrl

  const [, org, repo, branch, filePath] = match
  return `https://github.com/${org}/${repo}/blob/${branch}/${filePath}`
}

export function buildPrimaryPrompt(meta: RecipeMeta, document: RecipeDocument): string {
  if (!meta.recipeUrl) return ""
  return `You are implementing the "${meta.title}" recipe in this project.

Read the recipe markdown first:
${document.rawUrl}

Use the source repository for cross-reference:
${meta.mainRepoUrl}

Build this recipe into the user's app using the markdown as the implementation guide. Inspect related source files through the repository links when the recipe points to them. Ask before installing new dependencies.`
}

function loadGeneratedArtifact(slug: string): GeneratedRecipeArtifact | null {
  const artifactPath = path.join(GENERATED_DIR, `${slug}.json`)
  if (!fs.existsSync(artifactPath)) return null

  const rawArtifact = fs.readFileSync(artifactPath, "utf8")
  try {
    const artifact = JSON.parse(rawArtifact) as GeneratedRecipeArtifact
    if (
      artifact.slug !== slug ||
      !artifact.recipeDocument ||
      typeof artifact.recipeDocument.markdown !== "string"
    ) {
      throw new Error("artifact slug or recipeDocument is invalid")
    }
    return artifact
  } catch (err) {
    throw new Error(
      `[recipes] generated artifact ${slug}.json is invalid: ${(err as Error).message}`,
    )
  }
}

let _cache: CatalogEntry[] | null = null

function loadRecipesFromDisk(): CatalogEntry[] {
  if (!fs.existsSync(CONTENT_DIR)) {
    throw new Error(
      `[recipes] content directory not found at ${CONTENT_DIR}. ` +
        `Did you forget to commit content/recipes/?`,
    )
  }

  const slugs = fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)

  const recipes: CatalogEntry[] = slugs.map((slug) => {
    const metaPath = path.join(CONTENT_DIR, slug, "recipe.json")

    if (!fs.existsSync(metaPath)) {
      throw new Error(`[recipes] ${slug}/recipe.json not found`)
    }

    let meta: unknown
    try {
      meta = JSON.parse(fs.readFileSync(metaPath, "utf8"))
    } catch (err) {
      throw new Error(
        `[recipes] ${slug}/recipe.json is not valid JSON: ${(err as Error).message}`,
      )
    }
    assertValidMeta(slug, meta)

    const generated = meta.recipeUrl ? loadGeneratedArtifact(slug) : null
    const fallbackDocument = {
      rawUrl: githubViewUrlToRawUrl(meta.recipeUrl ?? ""),
      viewUrl: rawGithubUrlToViewUrl(githubViewUrlToRawUrl(meta.recipeUrl ?? "")),
      markdown: "",
      ...(meta.recipeUrl ? { fetchError: "Run npm run recipes:build to fetch this recipe." } : {}),
    }
    const recipeDocument = generated?.recipeDocument ?? fallbackDocument

    return {
      slug,
      generatedAt: generated?.generatedAt,
      recipeDocument,
      ...(generated?.documentLanguages ? { documentLanguages: generated.documentLanguages } : {}),
      primaryPrompt:
        generated?.primaryPrompt ?? buildPrimaryPrompt(meta, recipeDocument),
      ...meta,
    }
  })

  recipes.sort((a, b) => (a.updated < b.updated ? 1 : -1))
  return recipes
}

export function getAllEntries(): CatalogEntry[] {
  if (!_cache) _cache = loadRecipesFromDisk()
  return _cache
}

export function getAllRecipes(): Recipe[] {
  return getAllEntries().filter(hasRecipe)
}

export function getEntry(slug: string): CatalogEntry | undefined {
  return getAllEntries().find(entry => entry.slug === slug)
}

export function getRecipe(slug: string): Recipe | undefined {
  return getAllRecipes().find((r) => r.slug === slug)
}

function uniqueSorted(values: string[], order?: readonly string[]): string[] {
  const set = new Set(values)
  if (order) {
    const ordered = order.filter((v) => set.has(v))
    const extras = [...set].filter((v) => !order.includes(v)).sort()
    return [...ordered, ...extras]
  }
  return [...set].sort((a, b) => a.localeCompare(b))
}

function buildFilterOptions(recipes: CatalogEntry[]): FilterOptions {
  return {
    platforms: uniqueSorted(
      recipes.flatMap((r) => r.platforms),
      PLATFORM_ORDER,
    ),
    useCases: uniqueSorted(recipes.flatMap((r) => r.useCases)),
    capabilities: uniqueSorted(recipes.flatMap((r) => r.capabilities)),
  }
}

export function getFilterOptionsByTag(): FilterOptionsByTag {
  const recipes = getAllEntries()
  return {
    "voice-ai": buildFilterOptions(
      recipes.filter((recipe) => recipe.tags.includes("voice-ai")),
    ),
    rtc: buildFilterOptions(
      recipes.filter((recipe) => recipe.tags.includes("rtc")),
    ),
  }
}

export function getRelatedEntries(slug: string, limit = 3): CatalogEntry[] {
  const current = getEntry(slug)
  if (!current) return []

  return getAllEntries()
    .filter((r) => r.slug !== slug)
    .map((r) => {
      const cap = r.capabilities.filter((c) => current.capabilities.includes(c)).length
      const use = r.useCases.filter((u) => current.useCases.includes(u)).length
      return { recipe: r, score: cap * 2 + use * 3 }
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.recipe)
}

export function getRelatedRecipes(slug: string, limit = 3): Recipe[] {
  return getRelatedEntries(slug, getAllEntries().length).filter(hasRecipe).slice(0, limit)
}
