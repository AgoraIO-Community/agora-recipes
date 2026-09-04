import "server-only"
import fs from "node:fs"
import path from "node:path"

const CONTENT_DIR = path.join(process.cwd(), "content", "recipes")
const GENERATED_DIR = path.join(process.cwd(), "content", "generated", "recipes")

const PLATFORM_ORDER = ["Web", "iOS", "Android"] as const

export type Difficulty = "Beginner" | "Intermediate" | "Advanced"

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
  primaryPrompt: string
}

export type RecipeMeta = {
  title: string
  tagline: string
  description: string
  platforms: string[]
  useCases: string[]
  capabilities: string[]
  mainRepoUrl: string
  recipeUrl: string
  author: string
  updated: string
  difficulty: Difficulty
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

export type Recipe = RecipeMeta & {
  slug: string
  generatedAt?: string
  recipeDocument: RecipeDocument
  primaryPrompt: string
}

export type FilterOptions = {
  platforms: string[]
  useCases: string[]
  capabilities: string[]
}

const REQUIRED_STRING_FIELDS: (keyof RecipeMeta)[] = [
  "title",
  "tagline",
  "description",
  "mainRepoUrl",
  "recipeUrl",
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

  if (m.cli !== undefined) {
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

function buildPrimaryPrompt(meta: RecipeMeta, document: RecipeDocument): string {
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

let _cache: Recipe[] | null = null

function loadRecipesFromDisk(): Recipe[] {
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

  const recipes: Recipe[] = slugs.map((slug) => {
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

    const generated = loadGeneratedArtifact(slug)
    const fallbackDocument = {
      rawUrl: githubViewUrlToRawUrl(meta.recipeUrl),
      viewUrl: rawGithubUrlToViewUrl(githubViewUrlToRawUrl(meta.recipeUrl)),
      markdown: "",
      fetchError: "Run npm run recipes:build to fetch this recipe.",
    }
    const recipeDocument = generated?.recipeDocument ?? fallbackDocument

    return {
      slug,
      generatedAt: generated?.generatedAt,
      recipeDocument,
      primaryPrompt:
        generated?.primaryPrompt ?? buildPrimaryPrompt(meta, recipeDocument),
      ...meta,
    }
  })

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
