# Share a Project or Guide

This repository is the Agora Recipes catalog. Implementations and author documents stay in their existing repositories. One catalog entry can provide a Demo, video, source repository, implementation guide, or any combination of them. You do not need a separate project record for an existing recipe.

## Submit on GitHub

A GitHub account is required. You can use either path:

- Open the **Share a project or guide** Issue form. Provide an English introduction, public author credit, and at least one existing material link. Original documents can stay in their existing languages; translated copies are not required.
- Fork this repository, create a branch from `staging`, and submit metadata through a PR to upstream `staging`. A submission Issue is optional for direct PRs.

Issues are public. Do not include private email addresses, credentials, or other private information. Maintainers request additions in Issue comments, preserve the original submission, and prepare the catalog PR. Submission does not publish automatically. After release, maintainers add the published site link to the Issue.

The Issue form becomes available when `.github/ISSUE_TEMPLATE/submission.yml` reaches the repository's default branch through the normal release process. A staging-only template is not a live submission form. The site contribution page provides a copyable AI prompt, the GitHub form, and direct PR instructions. The prompt prepares an English Issue draft from existing project materials for the contributor to review; it does not modify files or publish an Issue. A regular Issue draft link provides the same fields when the form is unavailable. Topic selection is optional and shared by the prompt, form, and recovery draft. Topic pages and validated Topic-to-detail navigation carry that association into contribution links; direct visits do not guess one.

## Contribution SOP

Both entry paths use the same review and release process. Direct PR contributors
keep the original fork/metadata/build workflow; an Issue and AI assistance are optional.

| Stage | Issue submission | Direct PR | Owner |
| --- | --- | --- | --- |
| Prepare | Use the Issue form or optional AI prompt to prepare the same public fields. | Fork, branch from `staging`, and use the existing metadata templates. | Contributor |
| Submit | Review and submit the public Issue. | Build and open a PR to upstream `staging`. No preliminary Issue is required. | Contributor |
| Review | Request missing details in the same Issue; prepare the catalog PR and reference the Issue. | Review the submitted metadata and request changes in that PR. | Maintainer |
| Release | Release through the existing process; add the published site URL to the Issue, then close it. | Release through the same process; add the published site URL to the PR. | Maintainer |

Use English Issue/PR titles and review summaries. Preserve original project names,
author credit, submissions, README files, and source URLs. For an older submission
in another language, add an English review summary without rewriting the author's text.

Before approving, the maintainer checks:

1. At least one supplied material is public and usable. List real device/account
   requirements; omit unavailable materials instead of inventing them.
2. Author credit is correct. Reuse an existing entry when updating a published
   project; do not create a second identity just for its guide or translation.
3. Any Topic association is explicit and uses an existing Topic. Current Topics
   appear first in the site selector; ended activities are grouped separately.
   Historical work may still reference an ended activity, without claiming new
   registration or an award. Technical tags do not create membership.
4. Metadata and generated guide artifacts pass the checks below. Content changes
   require `npm run build`; code changes also require lint and independent types.
5. The PR targets `staging` and references the original Issue with `Refs #NUMBER`
   when one exists. Do not automatically close a submission before its site page
   has been released. Keep review discussion and the published link in that record.

The `Catalog checks` GitHub Actions workflow runs lint, behavioral tests, the full build, independent TypeScript checks, and rendered-route checks for PRs targeting `staging`. The build no longer skips TypeScript errors. These checks do not deploy the site or publish submissions.

Templates: `.github/ISSUE_TEMPLATE/submission.yml` for submission Issues,
`.github/PULL_REQUEST_TEMPLATE.md` for PR descriptions, and
`templates/demo.json` / `templates/recipe.json` for catalog metadata. The AI prompt
and regular-Issue recovery use the same Issue fields; neither creates a separate
intake system. Template activation on GitHub follows the repository's normal release.

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

Required non-empty strings: `title`, `tagline`, `description`, `author`, and `updated`. The date must be a valid `YYYY-MM-DD` date.

Required arrays: `tags`, `platforms`, `useCases`, and `capabilities`. Tags must contain `voice-ai`, `rtc`, or both. Reuse existing platform, use-case, and capability labels where practical.

Provide at least one material:

| Field | Destination |
| --- | --- |
| `demoUrl` | An existing web Demo or native distribution page, such as TestFlight. |
| `media.videoUrl` | An existing video that can be played in the site player. |
| `mainRepoUrl` | The implementation repository root. |
| `recipeUrl` | The public Markdown guide to render. Prefer a GitHub `blob` URL. |

Material URLs must use absolute HTTPS URLs without embedded credentials. Omit unavailable materials. A thumbnail by itself is not a playable material.

When `recipeUrl` is present, `difficulty` is required and must be `Beginner`, `Intermediate`, or `Advanced`. For a standalone GitHub guide, the loader can infer `mainRepoUrl` from the guide's repository. A guide outside GitHub needs an explicit `mainRepoUrl`. `cli` configuration is only valid on entries with a guide. Entries without guides do not expose a guide reader or recipe prompt and stay outside Recipe-specific API and Markdown responses.

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

Recommendation order is editorial. Prioritize usable materials, clear access requirements, useful guides, and a mix of use cases and platforms. Language alone does not determine the order. Do not describe editorial recommendations as popularity rankings without verified analytics.

`content/showcase.json` contains only an ordered list of recommended `{ "slug": "..." }` references. Removing a recommendation does not remove its media or catalog entry. Do not duplicate media fields there. Content cards do not show Topic membership. Existing `?topic=` quick filters are catalog filters; they do not create curated Topics.

## Website Languages

The website supports `en`, `zh-Hans`, `zh-Hant`, `ja`, `hi`, `es`, and `pt-BR`. English uses the existing unprefixed URLs. Other site languages use a locale prefix. `/zh-CN/...` redirects to `/zh-Hans/...`; author filenames are not renamed.

Maintainers keep UI strings and translated entry introductions in `content/i18n/<locale>.json`. Entry translations use the stable slug. Missing presentation translations fall back to the original metadata. Keep product names and public author credit intact. Contributors do not have to submit translations. Maintainers provide the seven-language presentation separately; original author files and URLs stay unchanged.

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
retain the full `title` and `summary`. Add their English keys to all presentation
dictionaries. Optional `cover` contains `src`, `alt`, and a public HTTPS
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

Review Topic membership in the catalog PR. A Topic contribution link prefills the existing Topic reference in the GitHub form; it does not publish or create membership automatically. Content cards contain no Topic membership, including inside Topic lists. Associations appear on detail pages, and source-list return links preserve the Topic, filters, locale, expansion, and available scroll position.

## Catalog Search

The catalog searches public metadata, every presentation language, explicit Topic
names, and available guide text. The build exports `/search-index.json` as a
static asset containing the submitted guide and confirmed author-language versions.
The browser loads this asset on search intent; no search service or runtime GitHub
fetch is involved. Adding metadata or a guide updates search through the normal build.

Input commits after 250 ms, with immediate Enter/Clear and IME support. Filters
still constrain results. Metadata/title relevance takes priority; guide-only matches
show a source excerpt. The client preserves metadata search and offers retry if the
static asset is unavailable. Only settled, bounded search-action counts enter analytics.

## Sharing and Analytics

Content and Topic pages share canonical URLs for the selected site locale, without list-return queries. Real cover images are preferred; `/social-card.png` is a local, statically generated fallback. Native, X, and LinkedIn handoffs open a sharing action; they do not prove a post was published. Copy-link events occur only after clipboard success.

PostHog project `recipes.agora.io` (`693535`) measures content use and Topic engagement; the existing Vercel analytics remain. Both destinations require `NODE_ENV=production`, `VERCEL=1`, and `VERCEL_ENV=production`. The seven event families and allowed dimensions are defined in `lib/analytics-events.ts`. Search events are debounced; raw queries, account identity, copied text, and submissions are excluded. Hover previews do not emit plays, and GitHub handoffs are contribution-open events rather than submission success. The lazy PostHog client captures explicit page views and the same seven action families, with no autocapture, session replay, person profiles, or site backend. Production builds require its two public environment variables. See [the measurement contract and release checks](docs/analytics.md). Actual production ingestion remains a release verification step.

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
