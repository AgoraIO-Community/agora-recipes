import fs from "node:fs/promises"
import path from "node:path"

const ROOT_DIR = process.cwd()
const CONTENT_DIR = path.join(ROOT_DIR, "content", "recipes")
const OUTPUT_DIR = path.join(ROOT_DIR, "content", "generated", "recipes")

async function main() {
  const { contentDir, outputDir } = parseArgs(process.argv.slice(2))
  const slugs = await getRecipeSlugs(contentDir)

  await fs.rm(outputDir, { recursive: true, force: true })
  await fs.mkdir(outputDir, { recursive: true })
  await fs.writeFile(path.join(outputDir, ".gitkeep"), "", "utf8")

  const results = []
  for (const slug of slugs) {
    const artifact = await buildRecipeArtifact({ slug, contentDir })
    await writeJson(path.join(outputDir, `${slug}.json`), artifact)
    results.push(artifact)
  }

  console.log(
    `[recipes] generated ${results.length} artifact${results.length === 1 ? "" : "s"} in ${path.relative(ROOT_DIR, outputDir)}`,
  )
  for (const artifact of results) {
    if (artifact.recipeDocument.fetchError) {
      console.warn(
        `[recipes] ${artifact.slug}: ${artifact.recipeDocument.fetchError}`,
      )
    }
  }
}

function parseArgs(args) {
  let contentDir = CONTENT_DIR
  let outputDir = OUTPUT_DIR

  for (const arg of args) {
    if (arg.startsWith("--content-dir=")) {
      contentDir = path.resolve(ROOT_DIR, arg.slice("--content-dir=".length))
    } else if (arg.startsWith("--output-dir=")) {
      outputDir = path.resolve(ROOT_DIR, arg.slice("--output-dir=".length))
    }
  }

  return { contentDir, outputDir }
}

async function getRecipeSlugs(contentDir) {
  const entries = await fs.readdir(contentDir, { withFileTypes: true })
  return entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b))
}

async function buildRecipeArtifact({ slug, contentDir }) {
  const metaPath = path.join(contentDir, slug, "recipe.json")
  const meta = JSON.parse(await fs.readFile(metaPath, "utf8"))
  const recipeRawUrl = githubViewUrlToRawUrl(meta.recipeUrl)
  const recipeViewUrl = rawGithubUrlToViewUrl(recipeRawUrl)
  const { markdown, fetchError } = await fetchRecipeMarkdown(recipeRawUrl)
  const normalizedMarkdown = markdown
    ? expandMarkdownLinks(markdown, recipeViewUrl)
    : ""
  const recipeDocument = {
    rawUrl: recipeRawUrl,
    viewUrl: recipeViewUrl,
    markdown: normalizedMarkdown,
    ...(fetchError ? { fetchError } : {}),
  }

  return {
    schemaVersion: 1,
    slug,
    generatedAt: new Date().toISOString(),
    source: {
      mainRepoUrl: meta.mainRepoUrl,
      recipeUrl: meta.recipeUrl,
      recipeRawUrl,
    },
    recipeDocument,
    primaryPrompt: buildPrimaryPrompt({ meta, recipeDocument }),
  }
}

function buildPrimaryPrompt({ meta, recipeDocument }) {
  return `You are implementing the "${meta.title}" recipe in this project.

Read the recipe markdown first:
${recipeDocument.rawUrl}

Use the source repository for cross-reference:
${meta.mainRepoUrl}

Build this recipe into the user's app using the markdown as the implementation guide. Inspect related source files through the repository links when the recipe points to them. Ask before installing new dependencies.`
}

function expandMarkdownLinks(markdown, recipeViewUrl) {
  const baseUrl = new URL(".", recipeViewUrl)

  return markdown.replace(
    /(!?\[[^\]]*])\(([^)\s]+)(\s+"[^"]*")?\)/g,
    (match, label, href, title = "") => {
      const expanded = expandLinkTarget(href, baseUrl)
      return expanded ? `${label}(${expanded}${title})` : match
    },
  )
}

function expandLinkTarget(href, baseUrl) {
  if (
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("http://") ||
    href.startsWith("https://")
  ) {
    return null
  }

  return new URL(href, baseUrl).toString()
}

async function fetchRequiredText(url, label) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "agora-recipes-build",
    },
  })

  if (!res.ok) {
    throw new Error(`${label} fetch failed: ${res.status} ${res.statusText}`)
  }

  return res.text()
}

async function fetchRecipeMarkdown(url) {
  try {
    return {
      markdown: await fetchRequiredText(url, "recipe"),
      fetchError: null,
    }
  } catch (err) {
    return {
      markdown: "",
      fetchError: err instanceof Error ? err.message : String(err),
    }
  }
}

function githubViewUrlToRawUrl(viewUrl) {
  const match = viewUrl.match(
    /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/,
  )
  if (!match) return viewUrl

  const [, org, repo, branch, filePath] = match
  return `https://raw.githubusercontent.com/${org}/${repo}/${branch}/${filePath}`
}

function rawGithubUrlToViewUrl(rawUrl) {
  const match = rawUrl.match(
    /^https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)$/,
  )
  if (!match) return rawUrl

  const [, org, repo, branch, filePath] = match
  return `https://github.com/${org}/${repo}/blob/${branch}/${filePath}`
}

async function writeJson(filePath, value) {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8")
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
