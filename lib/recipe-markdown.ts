import { getAllRecipes, getEntryModified, type Recipe } from "@/lib/recipes"
import { absoluteUrl } from "@/lib/site"

function inline(text: string): string {
  return text.replace(/\s+/g, " ").replace(/[\\[\]]/g, "\\$&")
}

export function catalogMarkdown(): string {
  const recipes = getAllRecipes()
  const starters = ["python-quickstart", "nextjs-quickstart", "golang-quickstart"].flatMap(slug => recipes.find(recipe => recipe.slug === slug) ?? [])
  const listed = new Set(starters.map(recipe => recipe.slug))
  const entryLink = (recipe: Recipe) => `- [${inline(recipe.title)}](${absoluteUrl(`/recipes/${recipe.slug}/index.md`)}): ${inline(recipe.tagline)} Platforms: ${inline(recipe.platforms.join(", "))}. Difficulty: ${recipe.difficulty}. Guide language: ${recipe.documentLanguages?.originalLanguage ?? "unspecified"}.${recipe.recipeDocument.fetchError || !recipe.recipeDocument.markdown ? " Guide unavailable; use the linked source repository." : ""}`
  return [
    "# Agora Voice AI Recipes",
    "",
    "> Implementation guides for Agora voice AI and real-time voice, video, and streaming applications.",
    "",
    "This site is a recipe catalog. Runnable implementations live in the linked source repositories. Each Markdown page includes metadata, source links, and the recipe document fetched at build time. If a document is unavailable, follow its source link; do not infer missing implementation steps.",
    "",
    "Choose a starter for a first voice agent. Use the Voice AI and RTC lists for a specific capability or platform. The linked Markdown contains the author's guide and implementation repository. Website language and guide language can differ. Only available, author-provided language versions are offered; do not invent a translation or claim that a demo or installation was tested.",
    "",
    "## Start here",
    "",
    ...starters.map(entryLink),
    ...(["voice-ai", "rtc"] as const).flatMap((tag) => [
      "",
      `## ${tag === "rtc" ? "Real-time communication" : "Voice AI"} recipes`,
      "",
      ...recipes.filter(recipe => { if (!recipe.tags.includes(tag) || listed.has(recipe.slug)) return false; listed.add(recipe.slug); return true }).map(entryLink),
    ]),
    "",
    "## Optional",
    "",
    `- [All projects and recipes](${absoluteUrl("/recipes")}): Complete directory for people, including projects without an implementation guide.`,
    `- [Official recipes API](${absoluteUrl("/api/v1/recipes")}): JSON metadata for Agora-authored guides only. Query type=all, ai, or rtc. Detail: /api/v1/recipes/{slug} includes recipeRawUrl and primaryPrompt. Schema version: 1. This Markdown index includes community guides too.`,
    `- [Contribute](${absoluteUrl("/contribute")}): Submit public materials for review.`,
    `- [Sitemap](${absoluteUrl("/sitemap.xml")}): Canonical page inventory for search engines.`,
    "",
  ].join("\n")
}

export function recipeMarkdown(recipe: Recipe): string {
  return [
    `# ${recipe.title}`,
    "",
    `> ${inline(recipe.tagline)}`,
    "",
    recipe.description,
    "",
    `- Author: ${recipe.author}`,
    `- Updated: ${getEntryModified(recipe)}`,
    `- Guide language: ${recipe.documentLanguages?.originalLanguage ?? "unspecified"}`,
    `- Guide status: ${recipe.recipeDocument.markdown && !recipe.recipeDocument.fetchError ? "available" : "unavailable"}`,
    `- Difficulty: ${recipe.difficulty}`,
    `- Categories: ${recipe.tags.join(", ")}`,
    `- Platforms: ${recipe.platforms.join(", ")}`,
    `- Use cases: ${recipe.useCases.join(", ")}`,
    `- Capabilities: ${recipe.capabilities.join(", ")}`,
    `- [Recipe page](${absoluteUrl(`/recipes/${recipe.slug}`)})`,
    `- [Implementation repository](${recipe.mainRepoUrl})`,
    `- [Source recipe](${recipe.recipeUrl})`,
    `- [Raw source Markdown](${recipe.recipeDocument.rawUrl})`,
    `- [All recipes](${absoluteUrl("/llms.txt")})`,
    ...Object.entries(recipe.documentLanguages?.versions ?? {}).filter(([, document]) => document.markdown && !document.fetchError).map(([language, document]) => `- [Author guide: ${inline(language)}](${document.rawUrl})`),
    ...(recipe.cli ? [
      "",
      "## Use with Agora CLI",
      "",
      `agora init my-${recipe.slug} --recipe ${recipe.slug}`,
    ] : []),
    "",
    "## Implementation guide",
    "",
    recipe.recipeDocument.markdown || "Recipe document unavailable at build time. Follow the source recipe link above for the implementation guide.",
    "",
    "## Recipe prompt",
    "",
    recipe.primaryPrompt,
    "",
  ].join("\n")
}

export function markdownResponse(markdown: string, canonicalPath = "/"): Response {
  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Link: `</llms.txt>; rel="describedby", <${absoluteUrl(canonicalPath)}>; rel="canonical"`,
    },
  })
}
