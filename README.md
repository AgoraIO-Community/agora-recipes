# Voice AI Recipes Catalog

This is the Next.js catalog for Agora Voice AI and RTC projects and guides. One entry can provide a Demo, video, source repository, and/or Recipe. Implementations and author documents stay in their existing repositories. This site stores metadata and presentation translations, fetches configured guides at build time, and renders static pages without a new content backend or site accounts.

## Local Development

```bash
npm run dev
```

Open http://localhost:3000.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). A GitHub account is required. Submit existing materials with the GitHub Issue form, or fork this repository and send a metadata PR to upstream `staging`. Direct PRs do not require an Issue.

Keep entries in `content/recipes/<slug>/recipe.json`. Use `templates/recipe.json` for a guide or `templates/demo.json` for a Demo-only entry. Provide at least one material; do not invent missing materials or create a duplicate project record for an existing recipe.

`npm run build` fetches only configured guide Markdown and writes `content/generated/recipes/`. GitHub activates Issue forms from the default branch, so the new form must pass through the normal release before the site handoff is live.

## Website Languages

English keeps the existing unprefixed URLs. `zh-Hans`, `zh-Hant`, and `ja` use locale prefixes; `/zh-CN/...` redirects to Simplified Chinese. Navigation, controls, metadata labels, and entry introductions use separate presentation dictionaries in `content/i18n/`. Missing entry translations fall back to the original metadata. The author guide and source links are unchanged; author README language selection is follow-up work.

Catalog detail links carry a validated `returnTo` address with the source locale, search, filters, and expansion state. Local scroll snapshots are scoped to that address. Direct detail links return to the catalog without inheriting an unrelated visit. Query context is excluded from canonical URLs.

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

Only entries with guides whose `author` is exactly `Agora` are exposed. Demo-, video-, and source-only entries remain outside this Recipe API. When present, the
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
- `/sitemap.xml` lists all localized home, contribution, and content detail pages.
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
npx tsc --noEmit
node --test scripts/*.test.mjs
```

Private recipe repositories cannot be fetched by the unauthenticated build script. Make the repo public or expect the generated artifact to contain a fetch error for that recipe's markdown.

### Homepage catalog

All entries share one catalog. References in [`content/showcase.json`](content/showcase.json)
are recommended first, in array order. Curated media entries are visible
immediately; remaining entries render on demand when the inline continuation
is expanded.
Search and filters operate on the entire catalog and reveal every matching result.
There is no separate event collection or View all destination.

Search covers titles, descriptions, card summaries, authors, and recipe metadata.
It tolerates small spelling mistakes and recognizes common English/Chinese domain
terms, such as `speech to text` / `语音转文字`. The default sort ranks exact matches
ahead of approximate ones. Matching runs locally without a search service.
Appearance defaults to dark. The header light/dark toggle saves an explicit choice locally and applies it across pages and reloads, including code blocks and diagrams. First visits use dark regardless of the system setting. Platform choices in the refinement sheet support multi-select (OR); use cases also use OR, while selected capabilities must all match.

Each entry can provide `media.thumbnail`, `media.thumbnailSource`, `media.thumbnailAlt`, and an existing `media.videoUrl` in its own `recipe.json`. The recommendation file contains only ordered slug references. Any recipe can optionally add an absolute HTTPS `demoUrl` in its own `recipe.json`, including a web demo or TestFlight page. Omit the field when no public demo exists. Use
`compactTitle` and `compactSummary` for a short title and one concise outcome.
Media cards show the preview, title, summary, author avatar, and one meaningful
`labels` (one on phones). Guide cards reuse the tagline and platform labels.
`thumbnailScale` and `thumbnailOrigin` optionally frame existing screenshots to
exclude browser chrome; the original image and video remain intact.
Keep `demoNote` truthful about language, microphones, cameras, and API-key
requirements; it remains visible in recipe details and video players. Video
cards open the on-site player, which also offers the existing external live demo;
image cards open their live demo directly. Title and text links always lead to the same content detail page; its guide appears only when configured.
Recipe detail pages show the optional Demo action whether or not they are recommended.

Verified author profiles and local avatar sources are maintained in
[`content/authors.json`](content/authors.json). Unknown or failed avatars display
initials. Avatars are bundled locally; adding a recipe does not require a profile
lookup or a database. React Live Video uses a real screenshot of its existing
public entry screen because its original recording mostly contains empty tiles.

Posters stay below 150 KB each; videos remain externally hosted with canonical
URLs rather than expiring signed redirects. Removing a recommendation leaves the
recipe in the catalog. Existing guide metadata and public API contracts remain compatible. New entries may omit a guide, repository, and difficulty when those materials do not apply. Material filters combine selected requirements with AND; platform selections continue to use OR.

The Recipes design system uses the Agora wordmark, local typography, and shared
dark/light tokens. Ordinary controls and reading surfaces are solid; floating
media actions, menus, and dialogs use complete Liquid Glass. A centered title
and search lead into one topic toolbar and project tiles; phones retain two
columns. Cards, images, links, labels, and icons stay in place on hover. Color,
border, underline, and opacity provide feedback; motion accompanies explicit
state changes such as selection, disclosure, and copy confirmation. Normal
recipe links do not prefetch large implementation documents during initial
browsing. DESIGN.md documents the palette, geometry, responsive layouts,
components, and interaction rules. Component integration lives in
`components/agent-ui/README.md`.

Verification: `node --test scripts/markdown.test.mjs scripts/recipe-discovery.test.mjs scripts/recipes-meta.test.mjs` (Node 22.18+ or Node 24+),
`npm run lint`, `pnpm exec tsc --noEmit --incremental false`, and `npm run build`.
The ESLint config retains narrowly scoped exceptions for existing UI templates.
