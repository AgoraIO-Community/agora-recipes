# Submit a Recipe

This repo is the catalog site for Voice AI recipes. Recipe implementations live in their own GitHub repositories; this repo stores metadata that points to each implementation and recipe markdown file.

## Submission Flow

1. Fork `AgoraIO-Community/v0-voice-ai-recipes`.
2. Create a branch in your fork from `staging`.
3. Add one recipe metadata file under `content/recipes/<slug>/recipe.json`.
4. Run `npm run build` to fetch the recipe markdown and generate static artifacts.
5. Open a pull request from your fork back to the upstream `staging` branch.

Do not open recipe submissions against `main` unless a maintainer asks you to.

## Create `recipe.json`

Choose a stable kebab-case slug. The folder name becomes the route:

```text
content/recipes/
  python-quickstart/
    recipe.json
```

Start from `templates/recipe.json`:

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

Required string fields:

- `title`
- `tagline`
- `description`
- `mainRepoUrl`
- `recipeUrl`
- `author`
- `updated`
- `difficulty`

Required array fields:

- `tags`
- `platforms`
- `useCases`
- `capabilities`

`difficulty` must be `Beginner`, `Intermediate`, or `Advanced`.
`tags` must contain `voice-ai`, `rtc`, or both so the recipe appears under the correct landing-page selection.

Use clear platform labels such as `TypeScript`, `Python`, `Go`, `iOS`, or `Android`. Reuse existing `useCases` and `capabilities` where practical so filters stay useful.

## Recipe URL Requirements

`mainRepoUrl` should point to the implementation repository root:

```text
https://github.com/OWNER/REPO
```

`recipeUrl` should point to the GitHub `blob` URL for the markdown file the catalog should render:

```text
https://github.com/OWNER/REPO/blob/main/docs/ai/RECIPE.md
```

The recipe repository and markdown file must be public at build time. Private repos usually fail as `404 Not Found` because the build fetches raw GitHub URLs without authentication.

## Generated Content

Do not hand-write files under `content/generated/recipes/`.

Run:

```bash
npm run build
```

The build runs `npm run recipes:build`, which:

1. Reads every `content/recipes/<slug>/recipe.json`.
2. Converts `recipeUrl` from a GitHub `blob` URL to a raw GitHub URL.
3. Fetches the recipe markdown.
4. Expands relative markdown links into absolute GitHub links.
5. Writes `content/generated/recipes/<slug>.json`.

Generated artifacts include the source links, fetched markdown, and the copyable prompt used on the recipe page. Commit the generated artifact with your recipe metadata so the static site can render the recipe page.

## PR Checklist

- `content/recipes/<slug>/recipe.json` is valid JSON.
- The slug is kebab-case.
- `mainRepoUrl` opens the implementation repo.
- `recipeUrl` opens a public GitHub markdown file.
- The recipe markdown's relative links resolve correctly from that markdown file's folder.
- `updated` uses `YYYY-MM-DD`.
- `npm run build` succeeds.
- The PR targets `staging`.
