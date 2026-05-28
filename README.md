# Voice AI Recipes Catalog

This is a Next.js catalog site for Agora Voice AI recipes. Recipe implementations live in separate GitHub repositories; this repo stores catalog metadata, fetches each recipe's markdown during build, and renders static recipe pages.

## Local Development

```bash
npm run dev
```

Open http://localhost:3000.

## Adding Recipes

1. Create `content/recipes/<slug>/recipe.json`.
2. Use `templates/recipe.json` as the starting point.
3. Set `mainRepoUrl` to the implementation repository.
4. Set `recipeUrl` to the GitHub `blob` URL for the markdown recipe file.
5. Run:

```bash
npm run build
```

The build runs `npm run recipes:build`, which fetches the configured markdown, expands relative markdown links to absolute GitHub links, and writes generated artifacts under `content/generated/recipes/`.

## Recipe Config

```json
{
  "title": "Python Quickstart",
  "tagline": "Build a basic Agora Conversational AI agent in Python.",
  "description": "Set up the Python quickstart agent, configure credentials, and run a minimal voice AI workflow.",
  "platforms": ["Python"],
  "useCases": ["Quickstart", "Voice AI"],
  "capabilities": ["Conversational AI", "Voice Agent", "Python"],
  "mainRepoUrl": "https://github.com/OWNER/REPO",
  "recipeUrl": "https://github.com/OWNER/REPO/blob/main/docs/ai/RECIPE.md",
  "author": "Agora",
  "updated": "2026-05-28",
  "difficulty": "Beginner"
}
```

`difficulty` must be `Beginner`, `Intermediate`, or `Advanced`.

## Verification

For content-only changes:

```bash
npm run build
```

For TypeScript, React, styling, or routing changes:

```bash
npm run lint
npm run build
```

Private recipe repositories cannot be fetched by the unauthenticated build script. Make the repo public or expect the generated artifact to contain a fetch error for that recipe's markdown.
