# AGENTS.md

This file guides AI agents and human contributors working in `v0-voice-ai-recipes`.

## Scope

This repository is the Next.js catalog site for Voice AI recipes. Contributors provide recipe metadata in `content/recipes/`; the build pipeline uses that metadata to pull the latest recipe agent documentation from the source repository.

The runnable recipe implementations usually live elsewhere. In `recipe.json`, `githubUrl` should point to the implementation repository and `agentMdRawUrl` should point to the raw `AGENTS.md` for that recipe.

## How to Work in This Repo

- Keep changes focused and minimal. Prefer extending the existing content and component patterns over adding new abstractions.
- Do not manually edit generated output such as `.next/`, `node_modules/`, or lockfiles unless the task explicitly requires it.
- Use the existing scripts in `package.json`:
  - `npm run dev` starts the local Next.js app.
  - `npm run build` verifies that all recipe metadata is valid and all static recipe pages can be generated.
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

Only immediate subdirectories are loaded. Directory names beginning with `.` are ignored. `AGENTS.md` files may appear in recipe folders after the build pipeline fetches them from `agentMdRawUrl`, but contributors should not need to add them directly to this catalog repo.

## Adding a Recipe

1. Choose a stable kebab-case slug, such as `healthcare-voice-agent`.
2. Create `content/recipes/<slug>/`.
3. Copy `templates/recipe.json` into `content/recipes/<slug>/recipe.json`.
4. Replace every `TODO` and `example.com` value with real metadata.
5. Confirm `githubUrl` points to the recipe implementation repo and `agentMdRawUrl` points to the raw recipe `AGENTS.md` in that repo.
6. Run `npm run build` from the `v0-voice-ai-recipes` directory.
7. Open a PR from your fork to the upstream `dev` branch.

Do not add `AGENTS.md` manually for a new catalog entry. During the build phase, the latest recipe `AGENTS.md` should be pulled from the source repository using the URL metadata in `recipe.json`. If the markdown has not been fetched locally, the app renders a placeholder that links to `agentMdRawUrl`.

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
- `updated` reflects the date of the recipe metadata change.
- `npm run build` succeeds.
