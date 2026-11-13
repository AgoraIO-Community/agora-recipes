# AGENTS.md

This file guides AI agents and human contributors working in `agora-recipes`.

## Scope

This repository is the Next.js catalog site for Voice AI and RTC projects and recipes. Contributors add entry metadata under `content/recipes/`. For entries with a guide, the build step fetches the configured Markdown and writes static artifacts under `content/generated/recipes/`.

Runnable implementations live elsewhere. In `recipe.json`, `mainRepoUrl` points to the implementation repository and `recipeUrl` points to the public Markdown guide. Demo-only, video-only, and source-only entries do not require a guide.

## How to Work in This Repo

### Owner UI decisions — do not regress

- Follow the system light/dark preference before first paint and on live changes. Do not add a manual theme toggle or restore previously saved overrides. Read DESIGN.md when changing theme colors or shared control materials.
- Keep the Agora site header and navigation on the homepage and recipe detail pages. The compact centered title and search lead into one topic toolbar and the media directory. Dock the same search input in the header after it scrolls out of view; keep its draft and focus. Automatically reveal catalog batches on scroll and retain loaded count and source scroll position for returns. Platform, use-case, and capability filters belong in the bounded refinement sheet. Keep secondary links in the footer; avoid ambient animation.
- Ordinary controls use solid materials: solid buttons, inputs, neutral selections, and connected reader control groups. Floating media actions, menus, and dialogs use the complete Liquid Glass optical engine; do not substitute blur-only shells. Form and reading planes stay opaque, with solid accessibility fallbacks. Keep cards, images, control bounds, labels, and ordinary icons stationary on hover and focus; use color, border, underline, and opacity for feedback. A main CTA may use the shared bounded `ButtonArrow` motion defined in DESIGN.md. Metadata tags remain noninteractive; preserve platform multi-select and compact two-column phone browsing.
- Preserve the Agora visual identity while refining components. Card titles always open details; covers open an available Demo, falling back to details. Keep video playback, Try demo, and details independently reachable whenever those materials exist, in grid and list views.

### Implementation practices

- Before changing JSX, component styling, geometry, icons, or motion, read `DESIGN.md` and `components/design-system/README.md`. Use the development-only `/design-system` page as the visual reference for shared controls and states.
- Compose the registered kit in `components/ui/`. Extend shared variants and tokens before adding a new page-level control. Add a reference example when extending the kit; feature code must not bypass it through raw interaction-library imports or unregistered templates.
- Ordinary buttons, toggles, single-line inputs/input groups/selects, and reader tabs share 32px desktop geometry, 13px regular labels, 16px icons, and 6px corners; phone/coarse-pointer targets are at least 46px. Selected states use a neutral fill and fine border. Compare actual outer bounds and center lines; avoid padded trays and per-action offsets that change visible heights.
- Control state feedback belongs in `controls.css`. Button and Select triggers share hover, held-press, open, icon-ink, and focus rules. Use the shared state tokens; preserve selection, invalid, disabled, and busy precedence. Verify unlike primitives together in the reference command group before adding feature styles.
- Use arrows by intent: retain functional back/top/disclosure/sort icons; opt into `ButtonArrow` for at most one main navigation CTA per action group. Resource navigation, menu rows, card titles, repeated Demo links and related lists do not carry decorative arrows. External destinations retain accessible new-tab labels. Do not add raw forward/outbound arrow icons in feature code.
- Use the shared Header / Body / Footer slots for dialogs, sheets, and form popovers. Close actions belong in header flow, and Body is the only opaque scroller. Extend `panels.css` instead of adding feature-specific panel padding, close offsets, nested reading cards, or extra scroll containers.
- Keep one visible entry per task. Retain view → sort → filter order, text actions before language/menu utilities, and Demo → Guide → Source material order. Card Demo links carry a clear label. The same wordmark, metadata placement, control materials, and action order apply across routes and locales.
- Verify shared UI changes on the reference page and affected product routes: light/dark system appearance, 320px and 390px phones, tablet and desktop breakpoints, long translated labels, keyboard dismissal/focus return, and relevant disabled/busy/error/recovery states. Include actual captures in the review evidence. Describe visual decisions through project-owned tokens, components, and behavior. Keep external visual-reference names and URLs out of project code, documentation, comments, and review evidence; retain dependency attribution and required license notices.

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
2. Create a branch from `staging`.
3. Make the smallest change that solves the task.
4. Run the relevant verification commands.
5. Open a pull request back to the upstream `staging` branch.

Do not target `main` unless a maintainer explicitly asks you to. PR descriptions should explain what changed, link the verified public materials provided, and include the commands you ran.

Recipe submissions go directly through PRs. Issues are for bugs and questions.

## How Recipes Are Loaded

Recipes are discovered from immediate subdirectories of `content/recipes/`. The folder name is the recipe slug and becomes the route at `/recipes/<slug>`.

```text
content/recipes/
  python-quickstart/
    recipe.json
```

No code registration is needed when adding a recipe. The loader derives the recipe list, filters, related recipes, and static route params from the files on disk.

Only immediate subdirectories are loaded. Directory names beginning with `.` are ignored. The app does not fetch Markdown at runtime. During CI/build, `scripts/build-recipes.mjs` fetches configured guides and writes `content/generated/recipes/<slug>.json`; entries without `recipeUrl` do not fetch a guide.

## Adding a Recipe

1. Choose a stable kebab-case slug, such as `python-quickstart`.
2. Create `content/recipes/<slug>/`.
3. Copy `templates/recipe.json` for an entry with a guide, or `templates/demo.json` for an entry without a guide, into `content/recipes/<slug>/recipe.json`.
4. Replace every `TODO` and placeholder URL with real metadata.
5. Include the verified materials available: `demoUrl`, `media.videoUrl`, `mainRepoUrl`, or `recipeUrl`. At least one is required; omit unavailable materials.
6. For a guide, set `recipeUrl` to its public Markdown URL, preferably a GitHub `blob` URL, and supply `difficulty`. A guide outside GitHub also requires `mainRepoUrl`.
7. Run `npm run build` from the `agora-recipes` directory.
8. Open a PR from your fork to the upstream `staging` branch.

Do not add local Markdown content for a new catalog entry. Entries with `recipeUrl` render the fetched guide and its raw/copy actions. Entries without a guide do not expose the guide reader or recipe prompt.

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

Read [Add Catalog Metadata in CONTRIBUTING.md](CONTRIBUTING.md#add-catalog-metadata) for the full contract and examples. Use the templates above to produce complete, valid JSON with English catalog metadata and unchanged public author credit.

Required string fields must be non-empty:

- `title`
- `tagline`
- `description`
- `author`
- `updated`

Required array fields must be JSON arrays of non-empty strings:

- `tags`
- `platforms`
- `useCases`
- `capabilities`

At least one verified public material is required: `demoUrl`, `media.videoUrl`, `mainRepoUrl`, or `recipeUrl`. Material URLs use absolute HTTPS URLs without embedded credentials. A thumbnail alone is not a material.

Guide-specific fields:

- `recipeUrl` is optional. When supplied, it points to the public Markdown guide.
- `difficulty` is required when `recipeUrl` is present and optional otherwise. Whenever supplied, it must be `Beginner`, `Intermediate`, or `Advanced`.
- `mainRepoUrl` is optional without a guide. For a GitHub guide, the loader can infer it from `recipeUrl`; a guide outside GitHub requires an explicit implementation repository root.
- `cli` configuration is only valid when `recipeUrl` is present.

`tags` must be non-empty and contain only `voice-ai`, `rtc`, or both.

Optional `demoUrl` is an absolute HTTPS link to an existing web demo or native distribution page such as TestFlight. Omit it when no usable demo exists; it does not require homepage recommendation.

`updated` must be a valid `YYYY-MM-DD` date. `platforms` should use clear language or runtime labels such as `TypeScript`, `Python`, `Go`, `iOS`, or `Android`; reuse existing labels when possible so filters stay useful.

## Recipe Quality Checklist

- The slug is kebab-case and matches the implementation repo path where practical.
- The title and tagline are concise and user-facing.
- The description explains the workflow, not just the technologies.
- `tags` places the recipe in the correct landing-page selection.
- `platforms`, `useCases`, and `capabilities` use existing labels when appropriate.
- At least one public material is provided; unavailable optional fields are omitted.
- When supplied, `mainRepoUrl` points to the implementation repository root.
- When supplied, `recipeUrl` points to public Markdown, preferably a GitHub `blob` URL, with a valid `difficulty`.
- Relative links inside a guide make sense when resolved from its source folder.
- `updated` reflects the date of the recipe metadata change.
- `npm run build` succeeds.
