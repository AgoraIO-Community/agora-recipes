# Recipes analytics

## Project and configuration

PostHog destination: [project **401062**](https://us.posthog.com/project/401062/home),
US Cloud. Production entry points (`website`, `sso`, `console`, `recipes`, and
`cli`) share this project and use the `app` property to distinguish their events.
Filter Recipes data by `app=recipes` and
`environment=production`. Other applications in the project retain their own
collection settings.

The former **recipes.agora.io** project, **693535**, and its
[Recipes usage and Topic engagement dashboard](https://us.posthog.com/project/693535/dashboard/2270627)
retain historical data. This integration sends to one configured project; it does
not duplicate new events into the former project or move its historical events.
The existing Vercel analytics retain the same seven action families.

Set these **public browser SDK values** in the existing hosting project's Production
environment and in ignored `.env.local` when needed. Remove these variables from
Preview and Development scopes. Never use a personal API key:

```text
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=<public project token from PostHog project settings>
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

The verified values are configured in Vercel project `agora-gdxe/v0-voice-ai-recipes`,
Production only. A build embeds these values, so changes require the normal release.
The client runs only when `NODE_ENV=production`, `VERCEL=1`, and
`VERCEL_ENV=production`, and the browser is on the canonical HTTPS origin from
`SITE_URL` (default `https://recipes.agora.io`). A production deployment's generated
URL, a preview, or a locally served copy of production assets does not initialize
either analytics SDK. Local builds, development, and previews do not capture.
A real-production build fails clearly if either value is missing.

The pinned 1.439.0 slim SDK loads lazily; first events wait for initialization. The site sends one
manual `$pageview` per pathname navigation. Filtering or changing a draft's Topic
without changing pages does not generate another view. No business backend,
proxy, runtime GitHub fetch, or site account is required.

## Measurement contract

Locales are `en`, `zh-Hans`, `zh-Hant`, `ja`, `hi`, `es`, and `pt-BR`.
Automatic loading uses the existing `catalog_action:load_more` event, with no raw
query or new event family.

Every event carries `app=recipes`, `site=agora-recipes`, `environment=production`, and
`measurement_version=1`. Public
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

`app`, `site`, and `environment` are forced after caller properties and again in
the SDK's `before_send` boundary. Caller values and persisted super-properties
cannot overwrite them. These are event properties, not person properties: a
person may use multiple applications.

Authenticated entry points must identify with the same canonical SSO UID in this
shared project, without an app-specific prefix or separate per-app ID. On logout,
those authenticated applications reset their identity. Recipes currently has no
login/session integration: its header links to external SSO signup, so this change
does not add an `identify` call or claim cross-app logged-in attribution. A future
Recipes authentication integration must obtain the UID from a trusted session,
enable identified profiles, and allow the SDK's identity-link event through the
sanitizer before invoking `identify(uid)`. It must retain the forced `app=recipes`
event property and leave logged-out visitors anonymous.

Recipes unique counts currently use a persistent anonymous browser identity, without a person
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

1. Configure the public token for project 401062 and the US ingestion host in
   the hosting project's Production scope only. Review and release through the
   existing staging/production process; environment edits alone do not update an
   already-built deployment. Do not change account permissions or billing.
2. Visit real production pages, including a Topic, its entry, and contribution.
   Make deliberate use actions. Verify `$pageview` and the seven relevant action
   families in project 401062; filter by `app=recipes` and
   `environment=production`, and inspect bounded context and clean URLs.
3. Confirm a single pathname navigation produces one view and changing filters
   does not. Successful copying counts once; failed copying and hover previews
   do not produce use events.
4. Check Topic A → detail → contribution, change association to B, then clear it.
   Confirm independent source/association fields in captured events and dashboard
   breakdowns. Also confirm direct visits have no inferred source.
5. Confirm local/development/preview visits send no events, including a copy of
   a production build served on localhost and the generated production deployment
   URL. Recheck Vercel collection
   alongside PostHog. Do not mark tracking Issue T5/T9 complete before real ingestion.
6. Determine actual submissions and publications from GitHub Issues/PRs and release
   links using the contribution SOP. No webhook, reporting database, or synthetic
   submission is needed for this phase.

At the former project's setup on 2026-10-28, PostHog reported no ingested events. All seven saved insights
returned no data with no query warnings. The dashboard is ready for the release;
this is not a claim that production collection is already healthy. On 2026-11-04,
the former project's host schema included `127.0.0.1:4183`, and Vercel variables
were scoped to both Production and Preview. The migration adds the independent
browser-origin boundary and removes Preview access to SDK configuration. This
does not delete historical test traffic or change older, already-built deployments.

References: [PostHog Next.js](https://posthog.com/docs/libraries/next-js),
[SDK configuration](https://posthog.com/docs/libraries/js/config), and
[anonymous events](https://posthog.com/docs/libraries/js/usage#anonymous-and-identified-events).
