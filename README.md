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

## LLM discovery and crawling

The public origin defaults to `https://recipes.agora.io`. Set `SITE_URL` at build
time to override it for a different deployment. Canonical links, the sitemap,
and Markdown links all use this origin.

- `/llms.txt` provides a generated index of every Voice AI and RTC recipe,
  including community recipes, plus guidance on the existing official-only API.
- `/index.md` provides the catalog as Markdown.
- `/recipes/<slug>/index.md` provides recipe metadata, source links, the fetched
  implementation guide, and its implementation prompt. Missing documents are
  explicitly marked unavailable; unknown slugs return HTTP 404.
- `/sitemap.xml` lists the homepage and every recipe page.
- `/robots.txt` allows crawling and points to the sitemap.

HTML pages advertise their Markdown alternate and `/llms.txt`; the footer also
links to the index. These routes reuse the recipe loader and build artifacts, so
adding a recipe requires no separate discovery-file edits or runtime GitHub fetches.
The `llms.txt` format follows the [llms.txt proposal](https://llmstxt.org/).
Crawler access at the CDN or hosting layer must also permit these public routes.

After building, run `npm start`, then `node scripts/check-llm-discovery.mjs` to
check the catalog, Markdown responses, canonical links, sitemap coverage, and 404s.
Pass a different server origin as the first argument to check another deployment.

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
Appearance is fixed to dark on every page, including code blocks and diagrams. There is no light mode, system-following behavior, theme selector, or saved-choice override. Platform choices are visible and multi-select (OR); use cases also use OR, while selected capabilities must all match.

Each recommendation can provide a local `thumbnail`, its `thumbnailSource` and
`thumbnailAlt`, and an existing `videoUrl`. Any recipe can optionally add an absolute HTTPS `demoUrl` in its own `recipe.json`, including a web demo or TestFlight page. Omit the field when no public demo exists. Use
`compactTitle` and `compactSummary` for a short title and one concise outcome.
Media cards show the preview, title, summary, author avatar, and up to two selected
`labels` (one on phones). Guide cards reuse the tagline and platform labels.
`thumbnailScale` and `thumbnailOrigin` optionally frame existing screenshots to
exclude browser chrome; the original image and video remain intact.
Keep `demoNote` truthful about language, microphones, cameras, and API-key
requirements; it remains visible in recipe details and video players. Video
cards open the on-site player, which also offers the existing external live demo;
image cards open their live demo directly. Recipe links always lead to the guide.
Recipe detail pages show the optional Demo action whether or not they are recommended.

Verified author profiles and local avatar sources are maintained in
[`content/authors.json`](content/authors.json). Unknown or failed avatars display
initials. Avatars are bundled locally; adding a recipe does not require a profile
lookup or a database. React Live Video uses a real screenshot of its existing
public entry screen because its original recording mostly contains empty tiles.

Posters stay below 150 KB each; videos remain externally hosted with canonical
URLs rather than expiring signed redirects. Removing a recommendation leaves the
recipe in the catalog. The required recipe metadata and public API are unchanged; `demoUrl` is optional.

Official fonts, colors, and the reading page follow Omja's [design refresh (#68)](https://github.com/AgoraIO-Community/agora-recipes/pull/68), alongside the compact media catalog and local discovery from [#70](https://github.com/AgoraIO-Community/agora-recipes/pull/70). The Agora site header is retained, followed directly by search, topics, and platforms. Secondary navigation is also available in the footer. Lightweight media cards retain rounded previews with copy underneath. The hero and particle runtime are removed. Search and selected controls use the supplied [agent-ui Glass material](components/agent-ui/README.md), with static reflections, independent text, and accessible fallbacks. Normal recipe links do not prefetch large implementation documents on initial browsing.

Verification: `node --test scripts/markdown.test.mjs scripts/recipe-discovery.test.mjs scripts/recipes-meta.test.mjs` (Node 22.18+ or Node 24+),
`npm run lint`, `pnpm exec tsc --noEmit --incremental false`, and `npm run build`.
The ESLint config retains narrowly scoped exceptions for existing shadcn templates.
