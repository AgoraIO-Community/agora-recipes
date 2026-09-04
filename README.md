# Voice AI Recipes Catalog

This is a Next.js catalog site for Agora Voice AI recipes. Recipe implementations live in separate GitHub repositories; this repo stores catalog metadata, fetches each recipe's markdown during build, and renders static recipe pages.

## Local Development

```bash
npm run dev
```

Open http://localhost:3000.

## Adding Recipes

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full submission flow. In short:

1. Fork this repo and create a branch from `staging`.
2. Create `content/recipes/<slug>/recipe.json`.
3. Use `templates/recipe.json` as the starting point.
4. Set `mainRepoUrl` to the implementation repository.
5. Set `recipeUrl` to the GitHub `blob` URL for the markdown recipe file.
6. Run:

```bash
npm run build
```

The build runs `npm run recipes:build`, which fetches the configured markdown, expands relative markdown links to absolute GitHub links, and writes generated artifacts under `content/generated/recipes/`.

## Recipes API

The deployed catalog exposes a versioned, read-only API for official tooling:

```text
GET /api/v1/recipes?type=all|ai|rtc
GET /api/v1/recipes/<slug>
```

List responses contain compact recipe metadata. Detail responses additionally
include `recipeRawUrl` and `primaryPrompt`, which the Agora CLI can return as
setup guidance after cloning a recipe. Every response includes
`schemaVersion: 1`; consumers must reject unsupported schema versions.

Only recipes whose `author` is exactly `Agora` are exposed. When present, the
`cli.env` object is the source of truth for the example file, target file, and
credential variable names; the CLI does not guess these values from the
recipe's language or checked-out files.

## Recipe Config

```json
{
  "title": "Python Quickstart",
  "tagline": "Build a basic Agora Conversational AI agent in Python.",
  "description": "Set up the Python quickstart agent, configure credentials, and run a minimal voice AI workflow.",
  "tags": ["voice-ai"],
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
`tags` must contain at least one supported recipe type: `voice-ai` or `rtc`.

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
