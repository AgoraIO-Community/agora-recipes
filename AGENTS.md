# AGENTS.md

This file guides AI agents and human contributors working in `v0-voice-ai-recipes`.

## Scope

This repository is the Next.js catalog site for Voice AI recipes. Contributors provide recipe metadata in `content/recipes/`; the app uses that metadata to build recipe-card prompts that point coding agents at the source repository docs.

The runnable recipe implementations usually live elsewhere. In `recipe.json`, `githubUrl` should point to the implementation repository, `agentMdRawUrl` should point to the raw `AGENTS.md` for that recipe, and `docsBaseRawUrl` should point to the raw source folder when the recipe has progressive disclosure docs.

## How to Work in This Repo

- Keep changes focused and minimal. Prefer extending the existing content and component patterns over adding new abstractions.
- Do not manually edit generated output such as `.next/`, `node_modules/`, or lockfiles unless the task explicitly requires it.
- Use the existing scripts in `package.json`:
  - `npm run dev` starts the local Next.js app.
  - `npm run recipes:build` fetches recipe source docs and writes static generated recipe artifacts.
  - `npm run build` refreshes generated recipe artifacts, verifies metadata, and generates static recipe pages.
  - `npm run lint` runs ESLint for code changes.
- For content-only recipe additions, run `npm run build` before opening a PR.
- For TypeScript, React, styling, or routing changes, run both `npm run lint` and `npm run build`.

## Contributing Flow

1. Fork the upstream repository.
2. Create a branch from `dev`.
3. Make the smallest change that solves the task.
4. Run the relevant verification commands.
5. Open a pull request back to the upstream `dev` branch.

Do not target `main` unless a maintainer explicitly asks you to. PR descriptions should explain what changed, link the related recipe implementation if applicable, and include the commands you ran.

## How Recipes Are Loaded

Recipes are discovered from immediate subdirectories of `content/recipes/`. The folder name is the recipe slug and becomes the route at `/recipes/<slug>`.

```text
content/recipes/
  realtime-voice-agent/
    recipe.json
```

No code registration is needed when adding a recipe. The loader derives the recipe list, filters, related recipes, and static route params from the files on disk.

Only immediate subdirectories are loaded. Directory names beginning with `.` are ignored. The app does not fetch or render markdown bodies at runtime. During CI/build, `scripts/build-recipes.mjs` fetches each recipe's source docs and writes static artifacts under `content/generated/recipes/`.

When `docsBaseRawUrl` is present, the app derives the progressive disclosure file set using the ai-devkit layout:

```text
<docsBaseRawUrl>/AGENTS.md
<docsBaseRawUrl>/docs/ai/L0_repo_card.md
<docsBaseRawUrl>/docs/ai/L1/01_setup.md
<docsBaseRawUrl>/docs/ai/L1/02_architecture.md
<docsBaseRawUrl>/docs/ai/L1/03_code_map.md
<docsBaseRawUrl>/docs/ai/L1/04_conventions.md
<docsBaseRawUrl>/docs/ai/L1/05_workflows.md
<docsBaseRawUrl>/docs/ai/L1/06_interfaces.md
<docsBaseRawUrl>/docs/ai/L1/07_gotchas.md
<docsBaseRawUrl>/docs/ai/L1/08_security.md
<docsBaseRawUrl>/docs/ai/L1/L2/_index.md
```

## Adding a Recipe

1. Choose a stable kebab-case slug, such as `healthcare-voice-agent`.
2. Create `content/recipes/<slug>/`.
3. Copy `templates/recipe.json` into `content/recipes/<slug>/recipe.json`.
4. Replace every `TODO` and `example.com` value with real metadata.
5. Confirm `githubUrl` points to the recipe implementation repo and `agentMdRawUrl` points to the raw recipe `AGENTS.md` in that repo.
6. If the recipe has progressive disclosure docs, set `docsBaseRawUrl` to the raw recipe folder URL. The app derives AGENTS.md, L0, all L1 docs, and the L2 index from that base.
7. Run `npm run build` from the `v0-voice-ai-recipes` directory.
8. Open a PR from your fork to the upstream `dev` branch.

Do not add `AGENTS.md` manually for a new catalog entry. Recipe pages render a copyable prompt and URL table, not local markdown content. If `docsBaseRawUrl` is missing, the prompt falls back to `agentMdRawUrl` only.

## Generated Recipe Artifacts

`npm run recipes:build` reads `content/recipes/<slug>/recipe.json`, fetches `agentMdRawUrl`, detects progressive disclosure docs from `AGENTS.md`, and writes `content/generated/recipes/<slug>.json`.

Generated artifacts include:

- `primaryPrompt` — the full recipe prompt copied from the recipe page.
- `progressiveDisclosure.docs` — fetched AGENTS.md, L0, L1, and L2 index links.
- `featurePrompts` — individual prompts generated from each L1 disclosure.
- `progressiveDisclosure.missing` — docs that were expected but not fetchable.

If all required progressive disclosure docs are available, the generated prompt loads AGENTS.md, L0, all eight L1 docs, and the L2 index. If docs are missing, the artifact falls back to a legacy prompt that directs the user's AI to read AGENTS.md and inspect the GitHub source repo.

## `recipe.json` Contract

`recipe.json` must be valid JSON and must contain these fields:

```json
{
  "title": "TODO: Recipe title",
  "tagline": "TODO: Short one-line tagline.",
  "description": "TODO: One or two sentences explaining what the recipe does.",
  "platforms": ["Web"],
  "useCases": ["TODO: Use case"],
  "capabilities": ["TODO: Capability"],
  "demoUrl": "https://example.com/demo",
  "githubUrl": "https://github.com/AgoraIO-Community/voice-ai-recipes/tree/main/TODO-slug",
  "agentMdRawUrl": "https://raw.githubusercontent.com/AgoraIO-Community/voice-ai-recipes/main/TODO-slug/AGENTS.md",
  "docsBaseRawUrl": "https://raw.githubusercontent.com/AgoraIO-Community/voice-ai-recipes/main/TODO-slug/",
  "author": "TODO: Author or team",
  "updated": "2026-05-14",
  "difficulty": "Beginner"
}
```

Required string fields must be non-empty:

- `title`
- `tagline`
- `description`
- `demoUrl`
- `githubUrl`
- `agentMdRawUrl`
- `author`
- `updated`
- `difficulty`

Optional string fields:

- `docsBaseRawUrl` — raw GitHub prefix for recipes with ai-devkit progressive disclosure docs. Include a trailing slash when adding it by hand.

Required array fields must be JSON arrays:

- `platforms`
- `useCases`
- `capabilities`

`difficulty` must be exactly one of:

- `Beginner`
- `Intermediate`
- `Advanced`

`updated` should use `YYYY-MM-DD` format. `platforms` may include values such as `Web`, `iOS`, and `Android`; the UI sorts those canonical platforms first and sorts additional values alphabetically.

## Recipe Quality Checklist

- The slug is kebab-case and matches the implementation repo path where possible.
- The title and tagline are concise and user-facing.
- The description explains the workflow, not just the technologies.
- `platforms`, `useCases`, and `capabilities` use existing labels when appropriate so filters stay useful.
- `demoUrl`, `githubUrl`, and `agentMdRawUrl` are real links before merge.
- `agentMdRawUrl` points at the latest raw `AGENTS.md` in the implementation repo.
- `docsBaseRawUrl`, when present, points at the raw recipe folder and follows the ai-devkit `docs/ai/` layout.
- `updated` reflects the date of the recipe metadata change.
- `npm run build` succeeds.
