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

### Homepage catalog

All recipes share one catalog. Entries in [`content/showcase.json`](content/showcase.json)
are recommended first, in array order. The first six are visible immediately;
the next real recipe titles peek through a faded continuation that expands inline.
Search and filters operate on the entire catalog and reveal every matching result.
There is no separate event collection or View all destination.

Search covers titles, descriptions, card summaries, authors, and recipe metadata.
It tolerates small spelling mistakes and recognizes common English/Chinese domain
terms, such as `speech to text` / `语音转文字`. The default sort ranks exact matches
ahead of approximate ones. Matching runs locally without a search service.
The site opens in dark mode; the header theme switch saves each visitor's choice.

Each recommendation can provide a local `thumbnail`, its `thumbnailSource` and
`thumbnailAlt`, an existing `videoUrl`, and/or an external `demoUrl`. Use
`compactTitle` and `compactSummary` for a short title and one concise outcome.
Media cards show the preview, title, summary, author avatar, and up to two selected
`labels` (one on phones). Guide cards reuse the tagline and platform labels.
`thumbnailScale` and `thumbnailOrigin` optionally frame existing screenshots to
exclude browser chrome; the original image and video remain intact.
Keep `demoNote` truthful about language, microphones, cameras, and API-key
requirements; it remains visible in recipe details and video players. Video
cards open the on-site player, which also offers the existing external live demo;
image cards open their live demo directly. Recipe links always lead to the guide.
Curated recipe detail pages retain their preview actions.

Verified author profiles and local avatar sources are maintained in
[`content/authors.json`](content/authors.json). Unknown or failed avatars display
initials. Avatars are bundled locally; adding a recipe does not require a profile
lookup or a database. React Live Video uses a real screenshot of its existing
public entry screen because its original recording mostly contains empty tiles.

Posters stay below 150 KB each; videos remain externally hosted with canonical
URLs rather than expiring signed redirects. Removing a recommendation leaves the
recipe in the catalog. The recipe metadata contract and public API are unchanged.

The appearance follows Agora Website 2026 foundations with selected original
agent-ui Glass components. See [`components/agent-ui/README.md`](components/agent-ui/README.md)
for source commits, host adaptations, official MiSans font slices, and attribution.
The glass filter affects the backdrop, while text and media remain clear. Normal
recipe links do not prefetch large implementation documents on initial browsing.

Verification: `node --test scripts/recipe-discovery.test.mjs` (Node 22.18+ or Node 24+),
`npm run lint`, `pnpm exec tsc --noEmit --incremental false`, and `npm run build`.
The ESLint config retains narrowly scoped exceptions for existing shadcn templates.
