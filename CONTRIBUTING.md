# Share a Project or Guide

This repository is the Agora Recipes catalog. Implementations and author documents stay in their existing repositories. One catalog entry can provide a Demo, video, source repository, implementation guide, or any combination of them. You do not need a separate project record for an existing recipe.

## Submit on GitHub

A GitHub account is required. You can use either path:

- Open the **Share a project or guide** Issue form. Provide a public introduction, author credit, and at least one existing material link. You can write in your own language. No translated copies are required.
- Fork this repository, create a branch from `staging`, and submit metadata through a PR to upstream `staging`. A submission Issue is optional for direct PRs.

Issues are public. Do not include private email addresses, credentials, or other private information. Maintainers request additions in Issue comments, preserve the original submission, and prepare the catalog PR. Submission does not publish automatically. After release, maintainers add the published site link to the Issue.

The Issue form becomes available when `.github/ISSUE_TEMPLATE/submission.yml` reaches the repository's default branch through the normal release process. A staging-only template is not a live submission form. The site contribution page links to the form and the direct PR instructions.

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

`content/showcase.json` contains only an ordered list of recommended `{ "slug": "..." }` references. Removing a recommendation does not remove its media or catalog entry. Do not duplicate media fields there. Content cards do not show Topic membership. Existing `?topic=` quick filters are catalog filters; they do not create curated Topics.

## Website Languages

The website supports `en`, `zh-Hans`, `zh-Hant`, and `ja`. English uses the existing unprefixed URLs. Other site languages use a locale prefix. `/zh-CN/...` redirects to `/zh-Hans/...`; author filenames are not renamed.

Maintainers keep UI strings and translated entry introductions in `content/i18n/<locale>.json`. Entry translations use the stable slug. Missing presentation translations fall back to the original metadata. Keep product names and public author credit intact. Contributors do not have to submit four translations.

The site language does not translate or rewrite the author guide. This release renders the submitted document as published. Selecting available author README language versions is separate follow-up work.

## Build and Verify

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

After building, start the site and run `node scripts/check-llm-discovery.mjs http://localhost:3000` to check the existing guide discovery contract.

## PR Checklist

- Metadata is valid JSON; the slug is stable and kebab-case.
- Each supplied material opens a real public destination.
- Guide-relative links resolve from that guide's folder.
- Original author credit and submissions remain intact.
- Unavailable materials are omitted; content cards contain no Topic membership.
- `npm run build` succeeds, plus lint and type checks for code changes.
- The PR targets upstream `staging`, with an English title and description.
- The description links the related implementation or Demo and lists verification commands.
