import fs from "node:fs/promises"
import path from "node:path"

const ROOT_DIR = process.cwd()
const CONTENT_DIR = path.join(ROOT_DIR, "content", "recipes")
const OUTPUT_DIR = path.join(ROOT_DIR, "content", "generated", "recipes")

const STANDARD_DOCS = [
  {
    id: "agents",
    label: "AGENTS.md",
    level: "AGENTS",
    path: "AGENTS.md",
    purpose: "Agent entry point and repo-specific operating rules.",
  },
  {
    id: "l0-repo-card",
    label: "L0 Repo Card",
    level: "L0",
    path: "docs/ai/L0_repo_card.md",
    purpose: "Repo identity, ownership, and L1 index.",
  },
  {
    id: "l1-01-setup",
    featureId: "setup",
    label: "01 Setup",
    level: "L1",
    path: "docs/ai/L1/01_setup.md",
    purpose: "Install, environment variables, local run, and setup failures.",
  },
  {
    id: "l1-02-architecture",
    featureId: "architecture",
    label: "02 Architecture",
    level: "L1",
    path: "docs/ai/L1/02_architecture.md",
    purpose: "Components, data flow, architecture, and integration points.",
  },
  {
    id: "l1-03-code-map",
    featureId: "code-map",
    label: "03 Code Map",
    level: "L1",
    path: "docs/ai/L1/03_code_map.md",
    purpose: "Where files live and what code to inspect.",
  },
  {
    id: "l1-04-conventions",
    featureId: "conventions",
    label: "04 Conventions",
    level: "L1",
    path: "docs/ai/L1/04_conventions.md",
    purpose: "Coding patterns, tests, naming, and error handling.",
  },
  {
    id: "l1-05-workflows",
    featureId: "workflows",
    label: "05 Workflows",
    level: "L1",
    path: "docs/ai/L1/05_workflows.md",
    purpose: "Common implementation and operational workflows.",
  },
  {
    id: "l1-06-interfaces",
    featureId: "interfaces",
    label: "06 Interfaces",
    level: "L1",
    path: "docs/ai/L1/06_interfaces.md",
    purpose: "APIs, events, schemas, and SDK contracts.",
  },
  {
    id: "l1-07-gotchas",
    featureId: "gotchas",
    label: "07 Gotchas",
    level: "L1",
    path: "docs/ai/L1/07_gotchas.md",
    purpose: "Pitfalls, sequencing risks, and tribal knowledge.",
  },
  {
    id: "l1-08-security",
    featureId: "security",
    label: "08 Security",
    level: "L1",
    path: "docs/ai/L1/08_security.md",
    purpose: "Auth, tokens, secrets, trust boundaries, and safe defaults.",
  },
  {
    id: "l2-index",
    label: "L2 Deep Dives Index",
    level: "L2",
    path: "docs/ai/L1/L2/_index.md",
    purpose: "Index of deeper references to load only when L1 is not enough.",
  },
]

const REQUIRED_PROGRESSIVE_DOC_IDS = new Set([
  "agents",
  "l0-repo-card",
  "l1-01-setup",
  "l1-02-architecture",
  "l1-03-code-map",
  "l1-04-conventions",
  "l1-05-workflows",
  "l1-06-interfaces",
  "l1-07-gotchas",
  "l1-08-security",
])

async function main() {
  const { contentDir, outputDir, strict } = parseArgs(process.argv.slice(2))
  const slugs = await getRecipeSlugs(contentDir)

  await fs.rm(outputDir, { recursive: true, force: true })
  await fs.mkdir(outputDir, { recursive: true })
  await fs.writeFile(path.join(outputDir, ".gitkeep"), "", "utf8")

  const results = []
  for (const slug of slugs) {
    const artifact = await buildRecipeArtifact({ slug, contentDir, strict })
    await writeJson(path.join(outputDir, `${slug}.json`), artifact)
    results.push(artifact)
  }

  console.log(
    `[recipes] generated ${results.length} artifact${results.length === 1 ? "" : "s"} in ${path.relative(ROOT_DIR, outputDir)}`,
  )
  for (const artifact of results) {
    const mode = artifact.progressiveDisclosure.available
      ? "progressive"
      : "legacy"
    console.log(`[recipes] ${artifact.slug}: ${mode}`)
  }
}

function parseArgs(args) {
  let contentDir = CONTENT_DIR
  let outputDir = OUTPUT_DIR
  let strict = process.env.RECIPES_STRICT === "1"

  for (const arg of args) {
    if (arg.startsWith("--content-dir=")) {
      contentDir = path.resolve(ROOT_DIR, arg.slice("--content-dir=".length))
    } else if (arg.startsWith("--output-dir=")) {
      outputDir = path.resolve(ROOT_DIR, arg.slice("--output-dir=".length))
    } else if (arg === "--strict") {
      strict = true
    }
  }

  return { contentDir, outputDir, strict }
}

async function getRecipeSlugs(contentDir) {
  const entries = await fs.readdir(contentDir, { withFileTypes: true })
  return entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b))
}

async function buildRecipeArtifact({ slug, contentDir, strict }) {
  const metaPath = path.join(contentDir, slug, "recipe.json")
  const meta = JSON.parse(await fs.readFile(metaPath, "utf8"))
  const generatedAt = new Date().toISOString()

  const agentMd = await fetchRequiredText(meta.agentMdRawUrl, `${slug} AGENTS.md`)
  const baseRawUrl = inferDocsBaseRawUrl(meta)
  const linkedPaths = extractProgressiveDisclosurePaths(agentMd)
  const docs = await fetchDocManifest({
    baseRawUrl,
    linkedPaths,
    agentMdRawUrl: meta.agentMdRawUrl,
    strict,
    slug,
  })

  const missing = docs
    .filter((doc) => REQUIRED_PROGRESSIVE_DOC_IDS.has(doc.id) && !doc.available)
    .map((doc) => doc.path)
  const progressiveAvailable = missing.length === 0
  const availableDocs = docs.filter((doc) => doc.available)

  return {
    schemaVersion: 1,
    slug,
    generatedAt,
    source: {
      githubUrl: meta.githubUrl,
      agentMdRawUrl: meta.agentMdRawUrl,
      docsBaseRawUrl: baseRawUrl,
    },
    progressiveDisclosure: {
      available: progressiveAvailable,
      docs: availableDocs.map(stripContent),
      missing,
    },
    primaryPrompt: progressiveAvailable
      ? buildProgressivePrompt({ meta, docs: availableDocs })
      : buildLegacyPrompt(meta),
    featurePrompts: progressiveAvailable
      ? buildFeaturePrompts({ meta, docs: availableDocs })
      : [],
    fetch: {
      mode: progressiveAvailable ? "progressive" : "legacy",
      fetched: availableDocs.map((doc) => doc.rawUrl),
      failed: docs
        .filter((doc) => !doc.available)
        .map((doc) => ({ id: doc.id, rawUrl: doc.rawUrl, error: doc.error })),
    },
  }
}

function inferDocsBaseRawUrl(meta) {
  if (typeof meta.docsBaseRawUrl === "string" && meta.docsBaseRawUrl.length > 0) {
    return ensureTrailingSlash(meta.docsBaseRawUrl)
  }

  return meta.agentMdRawUrl.replace(/AGENTS\.md(?:\?.*)?$/, "")
}

function extractProgressiveDisclosurePaths(markdown) {
  const links = new Set()
  const patterns = [
    /\[[^\]]+\]\(([^)]+docs\/ai\/[^)]+)\)/g,
    /(?:^|\s)(docs\/ai\/[^\s)]+)/g,
  ]

  for (const pattern of patterns) {
    for (const match of markdown.matchAll(pattern)) {
      const cleaned = match[1].replace(/^\.?\//, "").replace(/[.,;:]+$/, "")
      links.add(cleaned)
    }
  }

  return links
}

async function fetchDocManifest({
  baseRawUrl,
  linkedPaths,
  agentMdRawUrl,
  strict,
  slug,
}) {
  const docs = []

  for (const doc of STANDARD_DOCS) {
    const rawUrl =
      doc.id === "agents"
        ? agentMdRawUrl
        : joinUrl(baseRawUrl, linkedPaths.has(doc.path) ? doc.path : doc.path)

    try {
      const content = await fetchRequiredText(rawUrl, `${slug} ${doc.path}`)
      docs.push({
        ...doc,
        rawUrl,
        viewUrl: rawGithubUrlToViewUrl(rawUrl),
        available: true,
        purpose: doc.purpose,
        relatedCodeUrls: extractRelatedUrls(content, baseRawUrl),
        content,
      })
    } catch (err) {
      if (strict && REQUIRED_PROGRESSIVE_DOC_IDS.has(doc.id)) {
        throw err
      }
      docs.push({
        ...doc,
        rawUrl,
        viewUrl: rawGithubUrlToViewUrl(rawUrl),
        available: false,
        purpose: doc.purpose,
        relatedCodeUrls: [],
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }

  return docs
}

function buildProgressivePrompt({ meta, docs }) {
  const docsById = new Map(docs.map((doc) => [doc.id, doc]))
  const l1Docs = docs.filter((doc) => doc.level === "L1")
  const l2Index = docsById.get("l2-index")

  return `You are implementing the "${meta.title}" recipe in this project.

Read these files in order. Treat them as the complete recipe spec:

1. ${docsById.get("agents")?.rawUrl}
   Agent entry point and repo-specific operating rules.
2. ${docsById.get("l0-repo-card")?.rawUrl}
   Repo identity, ownership, and L1 index.
3. Load all L1 summaries as the default working context:
${l1Docs.map((doc) => `   - ${doc.rawUrl} — ${doc.purpose}`).join("\n")}
4. ${l2Index?.rawUrl}
   Use the L2 index only when the L1 docs indicate deeper detail is required.

Source repo for cross-reference:
${meta.githubUrl}

Build this recipe into the user's app using the setup, architecture, code map, conventions, workflows, interfaces, gotchas, and security guidance from the docs above. Cross-reference related code through the GitHub repo and raw URLs. Ask before installing new dependencies.`
}

function buildLegacyPrompt(meta) {
  return `You are implementing the "${meta.title}" recipe in this project.

Read the recipe AGENTS.md first:
${meta.agentMdRawUrl}

This recipe does not publish ai-devkit progressive disclosure docs yet. Use AGENTS.md as the implementation guide, then inspect the related features and source files in the GitHub repo:
${meta.githubUrl}

Scaffold the recipe in the user's app using the repository's existing setup, architecture, conventions, and feature code. Ask before installing new dependencies.`
}

function buildFeaturePrompts({ meta, docs }) {
  return docs
    .filter((doc) => doc.level === "L1")
    .map((doc) => ({
      id: doc.featureId,
      title: doc.label,
      docId: doc.id,
      docUrl: doc.rawUrl,
      purpose: doc.purpose,
      relatedCodeUrls: doc.relatedCodeUrls,
      prompt: `Implement the "${meta.title}" recipe area covered by ${doc.label}.

Read this disclosure first:
${doc.rawUrl}

Use it for: ${doc.purpose}

Related code and reference URLs detected in the disclosure:
${formatRelatedUrls(doc.relatedCodeUrls)}

Cross-reference the source repo as needed:
${meta.githubUrl}

Apply this section's guidance to the user's app without loading unrelated L2 docs unless this disclosure points to them.`,
    }))
}

function formatRelatedUrls(urls) {
  if (urls.length === 0) return "- None detected. Use the doc and source repo links."
  return urls.map((url) => `- ${url}`).join("\n")
}

function stripContent(doc) {
  const { content: _content, error: _error, ...rest } = doc
  return rest
}

function extractRelatedUrls(markdown, baseRawUrl) {
  const urls = new Set()
  const markdownLinks = /\[[^\]]+\]\(([^)]+)\)/g
  const bareUrls = /https?:\/\/[^\s)]+/g

  for (const match of markdown.matchAll(markdownLinks)) {
    const url = normalizeDocUrl(match[1], baseRawUrl)
    if (url) urls.add(url)
  }
  for (const match of markdown.matchAll(bareUrls)) {
    urls.add(match[0].replace(/[.,;:]+$/, ""))
  }

  return [...urls].filter((url) => !url.includes("docs/ai/")).sort()
}

function normalizeDocUrl(url, baseRawUrl) {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url.replace(/[.,;:]+$/, "")
  }
  if (url.startsWith("#")) return null
  if (url.startsWith("../") || url.startsWith("./")) {
    return joinUrl(baseRawUrl, url.replace(/^\.?\//, ""))
  }
  if (url.includes("/")) return joinUrl(baseRawUrl, url)
  return null
}

async function fetchRequiredText(url, label) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "v0-voice-ai-recipes-build",
    },
  })

  if (!res.ok) {
    throw new Error(`${label} fetch failed: ${res.status} ${res.statusText}`)
  }

  return res.text()
}

function ensureTrailingSlash(url) {
  return url.endsWith("/") ? url : `${url}/`
}

function joinUrl(baseUrl, relativePath = "") {
  return `${ensureTrailingSlash(baseUrl)}${relativePath}`
}

function rawGithubUrlToViewUrl(rawUrl) {
  const match = rawUrl.match(
    /^https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/?(.*)$/,
  )
  if (!match) return rawUrl

  const [, org, repo, branch, filePath] = match
  const route = rawUrl.endsWith("/") || filePath.length === 0 ? "tree" : "blob"
  return `https://github.com/${org}/${repo}/${route}/${branch}/${filePath}`
}

async function writeJson(filePath, value) {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8")
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
