# Share a Project or Guide

This repository is the Agora Recipes catalog. Implementations and author documents stay in their existing repositories. One catalog entry can provide a Demo, video, source repository, implementation guide, or any combination of them. You do not need a separate project record for an existing recipe.

## Submit a pull request

Recipe submissions go directly through a pull request. Issues are for bugs and questions; do not open a submission Issue first.

1. Fork this repository and create a branch from the latest upstream `staging`.
2. Create or update `content/recipes/<slug>/recipe.json`, using `templates/recipe.json` for a guide or `templates/demo.json` for an entry without a guide. Check for an existing entry before adding another one.
3. Run `npm run build` and include the generated guide artifacts when a guide is added or changed.
4. Push your branch to your fork and open a PR to upstream `staging`. Link the supplied materials and report validation in the PR description.

A GitHub account is required. Use English catalog metadata and PR titles/descriptions. Preserve original project names, author credit, documents, and source URLs; translated copies are not required. Submit only public materials, without private email addresses or credentials.

The site's contribution page offers a copyable AI prompt and the PR contribution guide. Run the prompt in your project with Codex, Cursor, or Claude Code. It asks the agent to prepare complete catalog JSON in a separate catalog checkout, build it, and open the PR. If GitHub access is unavailable, it provides the exact files and PR description for you to submit yourself. There is no Issue-to-PR handoff for maintainers.

Topic selection is optional. Topic pages and validated Topic-to-detail navigation carry the selected association into the prompt; direct visits do not guess one. Propose any membership change in the same catalog PR.

## Contribution SOP

Review and publication are tracked in the submitted PR. Maintainers review the metadata, request any changes there, and add the published site URL after release. Opening a PR does not publish automatically.

Before approving, the maintainer checks:

1. At least one supplied material is public and usable. List real device/account requirements; omit unavailable materials instead of inventing them.
2. Author credit is correct. Reuse an existing entry when updating a published project; do not create a second identity just for its guide or translation.
3. Any Topic association is explicit and uses an existing Topic. Current Topics appear first in the site selector; ended activities are grouped separately. Historical work may reference an ended activity without claiming new registration or an award. Technical tags do not create membership.
4. Metadata and generated guide artifacts pass the checks below. Content changes require `npm run build`; code changes also require lint and independent types.
5. The PR targets `staging`. Keep review discussion and the published site link in that PR.

The `Catalog checks` GitHub Actions workflow runs lint, behavioral tests, the full build, independent TypeScript checks, and rendered-route checks for PRs targeting `staging`. The build no longer skips TypeScript errors. These checks do not deploy the site or publish submissions.

Use `.github/PULL_REQUEST_TEMPLATE.md` for the PR description and `templates/demo.json` / `templates/recipe.json` for catalog metadata. The Issue chooser links recipe contributors to this guide while retaining blank Issues for bugs and questions. GitHub uses the Issue chooser configuration from the default branch after the normal release.

## Add Catalog Metadata

Choose a stable kebab-case slug. Its folder determines the existing detail URL:

```text
content/recipes/
  my-project/
    recipe.json
```

For a guide, start from `templates/recipe.json`. For a Demo without a guide, start from `templates/demo.json`. Keep the historical folder and filename for all entry types; no code registration is needed.

A minimal Demo entry:

```json
{
  "title": "My Agora Demo",
  "tagline": "A short description of what visitors can try.",
  "description": "Explain the project and who it helps.",
  "tags": ["voice-ai"],
  "platforms": ["Web"],
  "useCases": [],
  "capabilities": [],
  "demoUrl": "https://example.com/demo",
  "author": "Your public name or team",
  "updated": "2026-10-28"
}
```

Required non-empty strings: `title`, `tagline`, `description`, `author`, and `updated`. Write the catalog title, tagline, and description in English, preserving original project names and author credit. The date must be a valid `YYYY-MM-DD` date. Additional languages are welcome but optional; a new entry does not need any files in `content/i18n/`.

Required arrays: `tags`, `platforms`, `useCases`, and `capabilities`. Array items must be non-empty strings. Tags must be non-empty and contain only `voice-ai`, `rtc`, or both. Reuse existing platform, use-case, and capability labels where practical.

Provide at least one material:

| Field | Destination |
| --- | --- |
| `demoUrl` | An existing web Demo or native distribution page, such as TestFlight. |
| `media.videoUrl` | A YouTube video URL or a direct browser-playable video on an HTTPS storage/CDN host. |
| `mainRepoUrl` | The implementation repository root. |
| `recipeUrl` | The public Markdown guide to render. Prefer a GitHub `blob` URL. |

Material URLs must use absolute HTTPS URLs without embedded credentials. Omit unavailable materials. A thumbnail by itself is not a playable material.

When `recipeUrl` is present, `difficulty` is required; otherwise it is optional. Whenever supplied, `difficulty` must be `Beginner`, `Intermediate`, or `Advanced`. For a standalone GitHub guide, the loader can infer `mainRepoUrl` from the guide's repository. A guide outside GitHub needs an explicit `mainRepoUrl`. `cli` configuration is only valid on entries with a guide. Entries without guides do not expose a guide reader or recipe prompt and stay outside Recipe-specific API and Markdown responses.

## Media and Recommendations

Keep media in the entry's `recipe.json`, independently of recommendation:

```json
{
  "media": {
    "thumbnail": "/showcase/my-project.webp",
    "thumbnailAlt": "Describe the actual project screen.",
    "thumbnailSource": "https://github.com/OWNER/REPO/blob/main/screenshot.png",
    "videoUrl": "https://example.com/existing-demo.mp4",
    "demoNote": "Microphone needed",
    "labels": ["Voice agent"]
  }
}
```

The fragment above is optional metadata, not a complete entry. Use real images and videos. Keep `demoNote` accurate about supported languages, devices, accounts, and API-key requirements. Images can use a local public path or an HTTPS URL; keep posters below 150 KB where practical. Optional `compactTitle`, `compactSummary`, `videoDuration`, `thumbnailScale`, and `thumbnailOrigin` retain the existing media-card presentation options.

### Video hosting

Keep using **`media.videoUrl`**. No provider field or uploaded copy is required:

```json
{ "videoUrl": "https://www.youtube.com/watch?v=KwlDBXsbCUM" }
```

The link above is Zico's Trick or Take video, shown only as a URL example. Use a
video that belongs to your own submitted project. YouTube `watch`, `youtu.be`,
`shorts`, `live`, and `embed` video links are recognized; optional `t`/`start`
timestamps are retained. The [official IFrame API](https://developers.google.com/youtube/iframe_api_reference)
loads only after a visitor opens the player. Playback requires a separate play
action, and only actual playback counts as `video_play`. The player uses
[privacy-enhanced embeds](https://support.google.com/youtube/answer/171780)
and keeps an original-video link available. Private, removed, region-restricted,
or embedding-disabled videos can still fail; the dialog offers retry/recovery.

Direct MP4/WebM files use the browser's native player. S3, R2, a CDN, or another
HTTPS host works without a host allowlist. Keep the existing `thumbnail` as the
poster. For example:

```json
{ "videoUrl": "https://your-bucket.s3.amazonaws.com/demo.mp4" }
```

Use a durable public HTTPS URL, a browser-supported codec, the correct video
Content-Type, and byte-range support for seeking. A storage console/share page
is not a direct video URL; expiring signed URLs are unsuitable for this static
catalog. No storage credentials belong in metadata. HLS/DASH streaming manifests
and other providers' watch pages need a future player adapter. Add provider URL
recognition in `lib/video.ts` and its player in `components/recipe-video-player.tsx`;
the catalog contract and cards do not change. Existing GitHub video links remain
compatible. Hover previews apply only to direct files; YouTube keeps its poster
until the visitor opens the dialog.

Recommendation order is editorial. Prioritize usable materials, clear access requirements, useful guides, and a mix of use cases and platforms. Language alone does not determine the order. Do not describe editorial recommendations as popularity rankings without verified analytics.

`content/showcase.json` contains only an ordered list of recommended `{ "slug": "..." }` references. Removing a recommendation does not remove its media or catalog entry. Do not duplicate media fields there. Content cards do not show Topic membership. Existing `?topic=` quick filters are catalog filters; they do not create curated Topics.

## Website Languages

The website supports `en`, `zh-Hans`, `zh-Hant`, `ja`, `hi`, `es`, and `pt-BR`. English uses the existing unprefixed URLs. Other site languages use a locale prefix. `/zh-CN/...` redirects to `/zh-Hans/...`; author filenames are not renamed.

Maintainers keep UI strings and translated entry introductions in `content/i18n/<locale>.json`. Entry translations use the stable slug. Missing presentation translations fall back to the original metadata. Keep product names and public author credit intact. Contributors do not have to submit translations or language mappings. Maintainers may add presentation translations separately; missing translations must not block an English-only submission or PR. Original author files and URLs stay unchanged.

The site language does not translate or rewrite the author guide. At build time, the catalog follows explicit author language links only when they point to the same guide in the same GitHub repository/ref and link back to the submitted document. A matching filename alone is not sufficient. Current-language labels and reciprocal navigation identify the source language; ambiguous `中文` stays `zh` rather than being assumed Simplified or Traditional.

Source aliases such as `zh-CN` → `zh-Hans`, `zh-TW` / `zh-HK` → `zh-Hant`, and `jp` → `ja` are site interpretation only. Author filenames and submitted URLs remain unchanged. The reader uses a confirmed language/script match, then English, then the submitted original. Manual selection takes priority and has a directly addressable route. Missing manual versions show an explicit unavailable message with no alternate reader. Raw, Markdown copying, the prompt, assets, and the outline follow the selected document. Existing Recipe API and `/recipes/<slug>/index.md` responses keep the submitted original.

For a relationship maintainers have confirmed but author navigation cannot identify, add a small override to `content/document-languages.json`:

```json
{
  "my-project": {
    "originalLanguage": "en",
    "versions": {
      "ja": "https://github.com/OWNER/REPO/blob/main/docs/ja/README.md"
    }
  }
}
```

Replace the example slug and URL with verified material. This mapping is optional. Missing translations do not block publication or require an external translation service.

## Topics and Activities

Maintain Topics in `content/topics/<slug>/topic.json`, using `templates/topic.json` as a starting point. Members reference existing catalog slugs; tags and filter labels do not create membership. One entry can belong to several Topics without another entry record.

Collections do not need dates. Activities can supply `starts`, `ends`, `status` (`upcoming`, `active`, or `completed`), external `actions`, and optional `sections`. Action types are `participate`, `questions`, `replay`, and `source`. Longer original sections can declare their actual `language` and a `sourceUrl`. Short titles, summaries, and controls use the existing presentation dictionaries.

Directory cards can use optional `compactTitle` and `compactSummary`; detail pages
retain the full `title` and `summary`. English is required; additional presentation translations are optional and fall
back to English when absent. Optional `cover` contains `src`, `alt`, and a public HTTPS
`sourceUrl` for attribution. Use an existing local image under `/recipes/` or
`/topics/` (JPG, PNG, or WebP), with a translated factual alt description. The
loader rejects missing files and uncredited covers. Use thematic illustrations
for collection identity or real organizer artwork for an activity; do not invent
official event branding. Missing or failed images use
the static social card. Historical posters can contain expired registration copy;
the activity's current status and source rules remain authoritative.

The two collection covers use original generated #Topic illustrations. iRTE2026
uses the official conference artwork with its Chinese subtitle and venue callout
removed; the hackathon retains its organizer poster. See
[art provenance, generation prompts, and membership evidence](docs/topic-art.md).
Author screenshots, source guides, URLs, and credit are not rewritten. A pending
catalog contribution cannot become a Topic member until it enters the catalog.

Awards belong to a member within a specific activity edition, with a label and public `sourceUrl`. Label author-reported credit clearly; do not present it as an organizer-confirmed result. Keep completed activity pages and their materials. Registration, questions, and replays remain on existing external tools.

Review Topic membership in the catalog PR. A Topic contribution link includes the existing Topic reference in the AI prompt for the catalog PR; it does not publish or create membership automatically. Content cards contain no Topic membership, including inside Topic lists. Associations appear on detail pages, and source-list return links preserve the Topic, filters, locale, expansion, and available scroll position.

## Catalog Search

The catalog searches public metadata, every presentation language, explicit Topic
names, and available guide text. The build exports `/search-index.json` as a
static asset containing the submitted guide and confirmed author-language versions.
The browser loads this asset on search intent; no search service or runtime GitHub
fetch is involved. Adding metadata or a guide updates search through the normal build.

Input commits after 250 ms, with immediate Enter/Clear and IME support. Filters
still constrain results. Metadata/title relevance takes priority; guide-only matches
show a source excerpt. The client preserves metadata search and offers retry if the
static asset is unavailable. Analytics records settled searches with normalized,
bounded terms, result counts, and matching result opens. Obvious sensitive inputs
are redacted; per-keystroke text is not recorded.

## Sharing and Analytics

Content and Topic pages share canonical URLs for the selected site locale, without list-return queries. Real cover images are preferred; `/social-card.png` is a local, statically generated fallback. Native, X, and LinkedIn handoffs open a sharing action; they do not prove a post was published. Copy-link events occur only after clipboard success.

Production basic counters record public page/content IDs and allowlisted public search labels without visitor identity, regardless of the optional choice. Unknown searches become `other` before collection. After explicit optional-analytics consent, the site records bounded behavioral events, including normalized search
terms and the six standard UTM campaign fields. Account identity, copied text,
submission contents, and arbitrary URL parameters are excluded. Reuse the existing
event families when adding interactions: hover previews do not count as plays,
copying counts only after success, and opening GitHub does not prove a submission.
See [analytics behavior and verification](docs/analytics.md) for the text filters,
attribution rules, consent-manager setup, and code-level guidance. Keep the footer
privacy settings usable, keep the basic-count disclosure accurate, leave optional analytics off for pending/refused consent, and
never let managed-CMP failure fall back to an earlier local grant.

## Build and Verify

CI pins pnpm 12.15.0 and installs the committed lockfile with
`pnpm install --frozen-lockfile --ignore-scripts`. `pnpm-workspace.yaml` explicitly
denies the known optional dependency install scripts (`core-js`, `sharp`, and
`unrs-resolver`); the verified build uses distributed artifacts. Unreviewed future
scripts still fail under pnpm's default strict policy. No dependency-age exception
or global policy override is needed.

Do not add local guide Markdown for a new entry or hand-edit `content/generated/recipes/`.

```bash
npm run build
```

The build runs `npm run recipes:build`. It fetches only configured guides, expands relative Markdown links from their actual source location, and writes generated artifacts. Demo-, video-, and source-only entries do not fetch a guide or produce a missing-guide error. A private or unavailable guide records a fetch error while leaving the entry metadata usable. No runtime GitHub fetch is needed for reading.

Commit the generated artifact for a new or changed guide with its metadata. Avoid unrelated generated refreshes in a focused PR.

For TypeScript, React, styling, or routing changes, also run:

```bash
npm run lint
npx tsc --noEmit
node --test scripts/*.test.mjs
```

After building, start the site and run `node scripts/check-llm-discovery.mjs http://localhost:3000` for guide compatibility and `node scripts/check-phase-one.mjs http://localhost:3000` for seven-locale Topics, document selection, sharing metadata, contribution paths, and the static image fallback.

## PR Checklist

- Metadata is valid JSON; the slug is stable and kebab-case.
- Each supplied material opens a real public destination.
- Guide-relative links resolve from that guide's folder.
- Original author credit and submissions remain intact.
- Unavailable materials are omitted; content cards contain no Topic membership.
- `npm run build` succeeds, plus lint and type checks for code changes.
- The PR targets upstream `staging`, with an English title and description.
- The description links the related implementation or Demo and lists verification commands.
