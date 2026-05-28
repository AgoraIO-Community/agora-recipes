# AGENTS.md

This file guides AI agents and human contributors working in `v0-voice-ai-recipes`.

## Scope

This repository is the Next.js catalog site for Voice AI recipes. Contributors add recipe metadata under `content/recipes/`; the build step fetches the configured recipe markdown from the implementation repository and writes static artifacts under `content/generated/recipes/`.

The runnable recipe implementations live elsewhere. In `recipe.json`, `mainRepoUrl` points to the implementation repository and `recipeUrl` points to the GitHub markdown file that should be rendered as the recipe.

## How to Work in This Repo

- Keep changes focused and minimal. Prefer extending the existing content and component patterns over adding new abstractions.
- Do not manually edit generated output such as `.next/`, `node_modules/`, or lockfiles unless the task explicitly requires it.
- Use the existing scripts in `package.json`:
  - `npm run dev` starts the local Next.js app.
  - `npm run recipes:build` fetches recipe markdown and writes static generated recipe artifacts.
  - `npm run build` refreshes generated recipe artifacts and generates static recipe pages.
  - `npm run lint` runs ESLint for code changes when dependencies are installed.
- For content-only recipe additions, run `npm run build` before opening a PR.
- For TypeScript, React, styling, or routing changes, run both `npm run lint` and `npm run build`.

## Contributing Flow

1. Fork the upstream repository.
2. Create a branch from `dev`.
3. Make the smallest change that solves the task.
4. Run the relevant verification commands.
5. Open a pull request back to the upstream `dev` branch.

Do not target `main` unless a maintainer explicitly asks you to. PR descriptions should explain what changed, link the related recipe implementation, and include the commands you ran.

## How Recipes Are Loaded

Recipes are discovered from immediate subdirectories of `content/recipes/`. The folder name is the recipe slug and becomes the route at `/recipes/<slug>`.

```text
content/recipes/
  python-quickstart/
    recipe.json
```

No code registration is needed when adding a recipe. The loader derives the recipe list, filters, related recipes, and static route params from the files on disk.

Only immediate subdirectories are loaded. Directory names beginning with `.` are ignored. The app does not fetch markdown at runtime. During CI/build, `scripts/build-recipes.mjs` fetches each recipe's configured markdown file and writes `content/generated/recipes/<slug>.json`.

## Adding a Recipe

1. Choose a stable kebab-case slug, such as `python-quickstart`.
2. Create `content/recipes/<slug>/`.
3. Copy `templates/recipe.json` into `content/recipes/<slug>/recipe.json`.
4. Replace every `TODO` and placeholder URL with real metadata.
5. Set `mainRepoUrl` to the implementation repository root, for example `https://github.com/OWNER/REPO`.
6. Set `recipeUrl` to the GitHub `blob` URL for the markdown file to render, for example `https://github.com/OWNER/REPO/blob/main/docs/ai/RECIPE.md`.
7. Run `npm run build` from the `v0-voice-ai-recipes` directory.
8. Open a PR from your fork to the upstream `dev` branch.

Do not add local markdown content for a new catalog entry. Recipe pages render the fetched markdown from `recipeUrl`, plus buttons to view the raw markdown and copy the markdown to the clipboard.

## Generated Recipe Artifacts

`npm run recipes:build` reads `content/recipes/<slug>/recipe.json`, converts `recipeUrl` from a GitHub `blob` URL to the matching `raw.githubusercontent.com` URL, fetches the markdown, expands relative markdown links to absolute GitHub links, and writes `content/generated/recipes/<slug>.json`.

Generated artifacts include:

- `source.mainRepoUrl` — the implementation repository URL.
- `source.recipeUrl` — the configured GitHub markdown URL.
- `source.recipeRawUrl` — the derived raw markdown URL.
- `recipeDocument.rawUrl` — the raw markdown URL used by the "Raw" button.
- `recipeDocument.viewUrl` — the GitHub view URL for the recipe file.
- `recipeDocument.markdown` — fetched markdown with relative links expanded.
- `primaryPrompt` — the full recipe prompt copied from the recipe page.

If the recipe repository is private or the configured file path is wrong, unauthenticated raw GitHub fetches may fail. The build records the fetch error in the generated artifact so the catalog can still render the recipe metadata, but the markdown section will show that the recipe document is unavailable.

## `recipe.json` Contract

`recipe.json` must be valid JSON and must contain these fields:

```json
{
  "title": "TODO: Recipe title",
  "tagline": "TODO: Short one-line tagline.",
  "description": "TODO: One or two sentences explaining what the recipe does and who it helps.",
  "platforms": ["TypeScript"],
  "useCases": ["TODO: Use case"],
  "capabilities": ["TODO: Capability"],
  "mainRepoUrl": "https://github.com/OWNER/REPO",
  "recipeUrl": "https://github.com/OWNER/REPO/blob/main/docs/ai/RECIPE.md",
  "author": "TODO: Author or team",
  "updated": "2026-05-28",
  "difficulty": "Beginner"
}
```

Required string fields must be non-empty:

- `title`
- `tagline`
- `description`
- `mainRepoUrl`
- `recipeUrl`
- `author`
- `updated`
- `difficulty`

Required array fields must be JSON arrays:

- `platforms`
- `useCases`
- `capabilities`

`difficulty` must be exactly one of:

- `Beginner`
- `Intermediate`
- `Advanced`

`updated` should use `YYYY-MM-DD` format. `platforms` should use clear language or runtime labels such as `TypeScript`, `Python`, `Go`, `iOS`, or `Android`; reuse existing labels when possible so filters stay useful.

## Recipe Quality Checklist

- The slug is kebab-case and matches the implementation repo path where practical.
- The title and tagline are concise and user-facing.
- The description explains the workflow, not just the technologies.
- `platforms`, `useCases`, and `capabilities` use existing labels when appropriate.
- `mainRepoUrl` points to the implementation repository root.
- `recipeUrl` points to a public GitHub markdown `blob` URL.
- Relative links inside the recipe markdown make sense when resolved from the recipe file's GitHub folder.
- `updated` reflects the date of the recipe metadata change.
- `npm run build` succeeds.
