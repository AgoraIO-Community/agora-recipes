import { getAllRecipes, type Recipe } from "@/lib/recipes"
import { absoluteUrl } from "@/lib/site"

function inline(text: string): string {
  return text.replace(/\s+/g, " ").replace(/[\\[\]]/g, "\\$&")
}

export function catalogMarkdown(): string {
  const recipes = getAllRecipes()
  return [
    "# Agora Voice AI Recipes",
    "",
    "> Implementation guides for Agora voice AI and real-time voice, video, and streaming applications.",
    "",
    "This site is a recipe catalog. Runnable implementations live in the linked source repositories. Each Markdown page includes metadata, source links, and the recipe document fetched at build time. If a document is unavailable, follow its source link; do not infer missing implementation steps.",
    "",
    "## Catalog",
    "",
    `- [Browse recipes](${absoluteUrl("/")}): Interactive catalog for people.`,
    `- [Sitemap](${absoluteUrl("/sitemap.xml")}): All public recipe pages.`,
    `- [Official recipes API](${absoluteUrl("/api/v1/recipes")}): JSON metadata for Agora-authored recipes only. Supports ?type=all, ai, or rtc. Detail: /api/v1/recipes/<slug> includes recipeRawUrl and primaryPrompt. Schema version: 1. The lists below include community recipes too.`,
    ...(["voice-ai", "rtc"] as const).flatMap((tag) => [
      "",
      `## ${tag === "rtc" ? "Real-time communication" : "Voice AI"} recipes`,
      "",
      ...recipes.filter((recipe) => recipe.tags.includes(tag)).map((recipe) =>
        `- [${inline(recipe.title)}](${absoluteUrl(`/recipes/${recipe.slug}/index.md`)}): ${inline(recipe.tagline)} Platforms: ${inline(recipe.platforms.join(", "))}. Difficulty: ${recipe.difficulty}.`,
      ),
    ]),
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
    `- Updated: ${recipe.updated}`,
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

export function markdownResponse(markdown: string): Response {
  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Link: '</llms.txt>; rel="describedby"',
    },
  })
}
