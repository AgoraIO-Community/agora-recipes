# Recipes analytics

## Project and configuration

PostHog project: **recipes.agora.io**, **693535**, US Cloud, project timezone UTC.
[Recipes usage and Topic engagement](https://us.posthog.com/project/693535/dashboard/2270627)
contains seven native insights. Its default period is the last 30 days. The existing
Vercel analytics remain connected to the same seven action families.

Set these **public browser SDK values** in the existing hosting project's Production
environment and in ignored `.env.local` when needed. Never use a personal API key:

```text
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=<public project token from PostHog project settings>
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

The verified values are configured in Vercel project `agora-gdxe/v0-voice-ai-recipes`,
Production only. A build embeds these values, so changes require the normal release.
The client runs only when `NODE_ENV=production`, `VERCEL=1`, and
`VERCEL_ENV=production`. Local builds, development, and previews do not capture.
A real-production build fails clearly if either value is missing.

The pinned 1.439.0 slim SDK loads lazily; first events wait for initialization. The site sends one
manual `$pageview` per pathname navigation. Filtering or changing a draft's Topic
without changing pages does not generate another view. No business backend,
proxy, runtime GitHub fetch, or site account is required.

## Measurement contract

Locales are `en`, `zh-Hans`, `zh-Hant`, `ja`, `hi`, `es`, and `pt-BR`.
Automatic loading uses the existing `catalog_action:load_more` event, with no raw
query or new event family.

Every event carries `site=agora-recipes` and `measurement_version=1`. Public
context is bounded to locale, page type, stable content slug, selected/context
Topic slug, source Topic slug, action, placement, and result count where applicable.

| Signal | Definition | Limit |
| --- | --- | --- |
| Entry views / viewers | Recipe/detail `$pageview` events / distinct anonymous visitors, grouped by `content_slug`. | A page view does not prove reading. Guide-language routes use the same content identity. |
| Entry use actions / visitors | Deliberate material opens, explicit playback, or successful prompt/guide/code/CLI copies with a content slug; `is_recipe_use=true`. | This measures use intent. It does not prove a Demo completed or code ran. Card actions count even without a detail visit. |
| Use method | `recipe_use_kind`: `demo_open`, `source_open`, `video_open`, `video_play`, `prompt_copy`, `guide_copy`, `cli_copy`, `code_copy`. | Hover previews and failed copying are excluded. |
| Topic audience | Topic-detail `$pageview` events and distinct visitors, grouped by `topic_slug`. | Topic-directory views and filters are not participation. |
| Topic engaged visitors / actions | Recipe use, activity links, successful contribution-prompt copies, or contribution handoffs from an explicit source Topic; `is_topic_engagement=true`. | Group by `source_topic_slug`. This is observed engagement, not completed registration. |
| Contribution preparation | Successful `content_copy:prompt` on the contribution page. | Separate from recipe use and actual Issue creation. |
| GitHub Issue handoff | `contribution_open:github_form` or `github_issue`. | Opening GitHub does not prove submission. |
| Direct PR guidance | `contribution_open:pr_instructions`. | Opening instructions does not prove a PR was created. |
| Activity destination opens | `topic_action_open`: `participate`, `questions`, `replay`, or `source`. | External tools own registration/completion. |

Unique counts use a persistent anonymous browser identity, without a person
profile. One person using different browsers/devices or clearing storage can be
counted again. Use the unique aggregation across the union of use/engagement
events; do not add per-event unique counts, which would count the same visitor
several times. Do not interpret independent audience/action totals as a conversion
funnel. A future funnel must require the same source Topic and an explicit window.

`topic_slug` and `source_topic_slug` answer different questions. On a Topic page,
both identify that Topic. A detail opened from Topic A carries A as its source.
On the contribution page, a visitor can select Topic B while the source remains
A. Preparation/handoffs then contribute to B's submission interest and A's origin
engagement. Clearing association removes `topic_slug` while preserving the source.
Direct links and legacy homepage `?topic=` quick filters do not invent a source.
Only validated local source URLs and known Topic identities are accepted.

The other bounded events remain `catalog_action` (debounced search/applied
filter/sort/automatic `load_more`; legacy expand/collapse values remain accepted), `share_action` (successful link copy or sharing handoff),
`material_open`, `video_play`, `content_copy`, `topic_action_open`, and
`contribution_open`. Allowed actions are defined in `lib/analytics-events.ts`.

## Data boundary

Native video `play` events and the official YouTube IFrame API's PLAYING state
feed the same bounded `video_play` event, once per dialog opening. Opening a
dialog, initializing the embedded player, a provider error, and muted hover
previews do not count as playback. Video URLs and provider query parameters are
not analytics dimensions. External original-video handoffs remain separate
`material_open:video_original` actions and do not prove successful playback.

Autocapture, session replay, heatmaps, performance/exception capture, and remote
feature-flag requests are disabled in this client. No `identify` call or person
profile is created. The SDK's `before_send` allowlist retains anonymous transport,
session, browser/OS, and bounded measurement fields. It rejects unrelated automatic
events and removes profile updates, DOM text, referrers, search strings, arbitrary
URL query/hash data, clipboard contents, destination URLs, and submission text.

Vercel and PostHog share the same deliberate-action dispatcher. Analytics failures
cannot block navigation or clipboard feedback. Browser blocking can reduce observed
counts; installed code and environment configuration are not evidence of ingestion.

## Release verification

1. Review and release PR #77 through the existing staging/production process.
   This change does not deploy or change account permissions/billing.
2. Visit real production pages, including a Topic, its entry, and contribution.
   Make deliberate use actions. Verify `$pageview` and the seven relevant action
   families in project 693535; inspect bounded context and clean URLs.
3. Confirm a single pathname navigation produces one view and changing filters
   does not. Successful copying counts once; failed copying and hover previews
   do not produce use events.
4. Check Topic A → detail → contribution, change association to B, then clear it.
   Confirm independent source/association fields in captured events and dashboard
   breakdowns. Also confirm direct visits have no inferred source.
5. Confirm local/development/preview visits send no events. Recheck Vercel collection
   alongside PostHog. Do not mark tracking Issue T5/T9 complete before real ingestion.
6. Determine actual submissions and publications from GitHub Issues/PRs and release
   links using the contribution SOP. No webhook, reporting database, or synthetic
   submission is needed for this phase.

At setup on 2026-10-28, PostHog reported no ingested events. All seven saved insights
returned no data with no query warnings. The dashboard is ready for the release;
this is not a claim that production collection is already healthy.

References: [PostHog Next.js](https://posthog.com/docs/libraries/next-js),
[SDK configuration](https://posthog.com/docs/libraries/js/config), and
[anonymous events](https://posthog.com/docs/libraries/js/usage#anonymous-and-identified-events).
