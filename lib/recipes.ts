import "server-only"
import fs from "node:fs"
import path from "node:path"

/**
 * ─────────────────────────────────────────────────────────────────
 * Recipe content loader
 *
 * Each recipe is a folder under `content/recipes/<slug>/`:
 *
 *   content/recipes/
 *     realtime-voice-agent/
 *       recipe.json   ← metadata (hand-edited / CI-stable)
 *       Agent.md      ← markdown body, pulled from source repo by CI/CD
 *
 * The folder name is the slug. The slug is the URL: /recipes/<slug>.
 *
 * To add a new recipe: drop in a new folder with these two files.
 * No code changes required — filter taxonomies (platforms, use cases,
 * capabilities) are derived dynamically from the loaded recipes.
 * ─────────────────────────────────────────────────────────────────
 */

const CONTENT_DIR = path.join(process.cwd(), "content", "recipes")

/** Canonical ordering for platforms when surfaced to the UI. */
const PLATFORM_ORDER = ["Web", "iOS", "Android"] as const

export type Difficulty = "Beginner" | "Intermediate" | "Advanced"

/** Shape of recipe.json — kept loose so CI/CD can extend it freely. */
export type RecipeMeta = {
  title: string
  tagline: string
  description: string
  platforms: string[]
  useCases: string[]
  capabilities: string[]
  demoUrl: string
  githubUrl: string
  agentMdRawUrl: string
  author: string
  /** ISO 8601 date string, YYYY-MM-DD. */
  updated: string
  difficulty: Difficulty
}

/** A fully-hydrated recipe ready to render. */
export type Recipe = RecipeMeta & {
  /** Folder name. Used as URL segment and stable identifier. */
  slug: string
  /** Markdown body of Agent.md (loaded from disk). */
  agentMd: string
}

export type FilterOptions = {
  platforms: string[]
  useCases: string[]
  capabilities: string[]
}

/* ───────────────────── Schema validation ───────────────────── */

const REQUIRED_STRING_FIELDS: (keyof RecipeMeta)[] = [
  "title",
  "tagline",
  "description",
  "demoUrl",
  "githubUrl",
  "agentMdRawUrl",
  "author",
  "updated",
  "difficulty",
]

const REQUIRED_ARRAY_FIELDS: (keyof RecipeMeta)[] = [
  "platforms",
  "useCases",
  "capabilities",
]

const VALID_DIFFICULTIES: Difficulty[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
]

function assertValidMeta(slug: string, meta: unknown): asserts meta is RecipeMeta {
  if (!meta || typeof meta !== "object") {
    throw new Error(`[recipes] ${slug}/recipe.json is not a JSON object`)
  }
  const m = meta as Record<string, unknown>

  for (const field of REQUIRED_STRING_FIELDS) {
    if (typeof m[field] !== "string" || (m[field] as string).length === 0) {
      throw new Error(
        `[recipes] ${slug}/recipe.json is missing required string field "${field}"`,
      )
    }
  }
  for (const field of REQUIRED_ARRAY_FIELDS) {
    if (!Array.isArray(m[field])) {
      throw new Error(
        `[recipes] ${slug}/recipe.json field "${field}" must be an array`,
      )
    }
  }
  if (!VALID_DIFFICULTIES.includes(m.difficulty as Difficulty)) {
    throw new Error(
      `[recipes] ${slug}/recipe.json difficulty must be one of ${VALID_DIFFICULTIES.join(
        ", ",
      )}`,
    )
  }
}

/* ───────────────────── Loader (cached) ───────────────────── */

let _cache: Recipe[] | null = null

function loadRecipesFromDisk(): Recipe[] {
  if (!fs.existsSync(CONTENT_DIR)) {
    // Fail loudly during build; an empty content dir is almost always a bug.
    throw new Error(
      `[recipes] content directory not found at ${CONTENT_DIR}. ` +
        `Did you forget to commit content/recipes/?`,
    )
  }

  const slugs = fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)

  const recipes: Recipe[] = slugs.map((slug) => {
    const dir = path.join(CONTENT_DIR, slug)
    const metaPath = path.join(dir, "recipe.json")
    const mdPath = path.join(dir, "Agent.md")

    if (!fs.existsSync(metaPath)) {
      throw new Error(`[recipes] ${slug}/recipe.json not found`)
    }

    const rawMeta = fs.readFileSync(metaPath, "utf8")
    let meta: unknown
    try {
      meta = JSON.parse(rawMeta)
    } catch (err) {
      throw new Error(
        `[recipes] ${slug}/recipe.json is not valid JSON: ${(err as Error).message}`,
      )
    }
    assertValidMeta(slug, meta)

    // Agent.md is fetched by CI/CD. Render a friendly placeholder if it's
    // missing locally so the build doesn't fail mid-pipeline.
    const agentMd = fs.existsSync(mdPath)
      ? fs.readFileSync(mdPath, "utf8")
      : `# ${meta.title}\n\n> _Agent.md is fetched from the source repo by CI/CD and was not present at build time._\n\nView the live document at [${meta.agentMdRawUrl}](${meta.agentMdRawUrl}).\n`

    return { slug, agentMd, ...meta }
  })

  // Newest first — predictable ordering for the home page.
  recipes.sort((a, b) => (a.updated < b.updated ? 1 : -1))
  return recipes
}

export function getAllRecipes(): Recipe[] {
  if (!_cache) _cache = loadRecipesFromDisk()
  return _cache
}

export function getRecipe(slug: string): Recipe | undefined {
  return getAllRecipes().find((r) => r.slug === slug)
}

/* ───────────────────── Derived helpers ───────────────────── */

function uniqueSorted(values: string[], order?: readonly string[]): string[] {
  const set = new Set(values)
  if (order) {
    const ordered = order.filter((v) => set.has(v))
    const extras = [...set].filter((v) => !order.includes(v)).sort()
    return [...ordered, ...extras]
  }
  return [...set].sort((a, b) => a.localeCompare(b))
}

export function getFilterOptions(): FilterOptions {
  const all = getAllRecipes()
  return {
    platforms: uniqueSorted(
      all.flatMap((r) => r.platforms),
      PLATFORM_ORDER,
    ),
    useCases: uniqueSorted(all.flatMap((r) => r.useCases)),
    capabilities: uniqueSorted(all.flatMap((r) => r.capabilities)),
  }
}

/**
 * Related recipes are computed by tag overlap. Use cases weigh slightly
 * more than capabilities since they describe what the recipe is *for*.
 */
export function getRelatedRecipes(slug: string, limit = 3): Recipe[] {
  const current = getRecipe(slug)
  if (!current) return []

  return getAllRecipes()
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
