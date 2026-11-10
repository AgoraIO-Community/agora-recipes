# Recipes analytics

## Deployment configuration

Analytics destinations are configured through hosting environment variables.
The application sends to one configured PostHog destination, alongside the
existing Vercel analytics. Filter Recipes events by `app=recipes` and
`environment=production`.

Set these **public browser SDK values** in the existing hosting project's Production
environment and in ignored `.env.local` when needed. Remove these variables from
Preview and Development scopes. Never use a personal API key:

```text
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=<public project token from PostHog project settings>
NEXT_PUBLIC_POSTHOG_HOST=<ingestion host from PostHog project settings>
```

A build embeds these values, so changes require the normal release.
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

Recipes has no login/session integration and does not call `identify`.
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

## UTM attribution

Recipes implements the local contract in [UTM attribution design](utm-attribution-design.md).
`campaign_entry` records an identifiable promotion navigation, independently of
`$pageview`. Both PostHog events and every deliberate action receive the current
tab's validated `utm_source`, optional `utm_medium`, `utm_campaign`, `utm_content`,
`utm_term`, and `landing_path`. Vercel receives `campaign_entry` and the same
attribution on custom actions. The first PostHog view resolves attribution before
capture. Entry snapshots are consumed once per document, including React effect
replays. Existing action triggers and Topic semantics remain unchanged.

A legal `utm_source` is required. Manually named values accept lowercase ASCII
letters, numbers and underscores, with at most 100 characters. Keywords may
contain spaces and non-English text, but not control/formatting characters,
braces/template expressions, angle brackets or more than 100 characters.
Duplicate parameters are rejected individually. Invalid optional fields are
omitted; missing fields are never supplied from an earlier source or CTA.
Only the pathname is stored as `landing_path`, without query or fragment.

The document controller keeps attribution in memory and `sessionStorage` under
`recipes:utm`, with no time expiry. It uses a random `window.name` Recipes tab
marker and a document ownership flag: `pagehide` releases the stored snapshot;
a new document claims it, and `pageshow` reclaims it after BFCache restoration.
The marker is local browser state, is never an event/visitor/journey ID, and is
not appended to destinations. A fresh tab has no matching marker. A duplicated
tab that copies both storage and name cannot claim an active source document's
snapshot. Thus sessionStorage cloning alone does not establish ownership.

SPA navigation keeps the same controller and landing path. Same-tab full-page
navigation with ownership evidence also retains them. Reload and history
navigation do not create campaign entries. A normal document navigation with
valid UTM creates an entry unless it has both same-tab ownership and a same-origin
referrer; identical UTM does not suppress a new external entry. New sources replace
the whole association. A BFCache restore rereads the latest tab source, rather
than reverting to that older document's source; PostHog records a restored view.
Simply activating a tab creates neither view nor entry.

Missing lifecycle events, browsers resetting `window.name` across sites,
unavailable storage, or browser-specific duplication without reliable ownership
evidence can prevent recovery; the source then stays empty unless the current URL
explicitly supplies it. Storage failure retains current-document memory without
blocking navigation/copying. Reload/history navigation alone never replays an entry,
even without storage. Browsers cannot prove every external click, particularly
same-URL activation without a new document navigation. These counts are observed
Recipes landings, not a complete upstream click ledger.

Only the catalog's explicit Demo anchors (covers, grid/list actions, reader and
player actions) and the footer's Agora Console link use `AttributionLink`.
The native anchor retains its original classes, ref and handlers, including
keyboard, middle-click and Copy link address. For HTTPS destinations, current UTM
replaces the entire target UTM set while preserving other functional query fields
and fragments. It never forwards `landing_path`. Without current attribution,
the destination stays unchanged. Source, original-video, sharing, documentation,
legal and arbitrary third-party links are not decorated. This allows catalog Demo
distribution pages as well as hosted demos; it does not prove the target records UTM.

PostHog disables automatic campaign persistence and unregisters legacy UTM
super-properties at SDK initialization. Each capture supplies its own snapshot;
`before_send` revalidates the six attribution fields and still strips query/hash
from `$current_url`. The SDK owns `$session_id`: a new SDK session does not clear UTM.
Vercel's URL sanitizer permits only explicitly present, legal UTM; it strips all
other query data and fragments. It does not synthesize native Vercel PV properties
from saved attribution or promise native UTM report support. Use its custom events
where needed. Both SDKs retain their existing production deployment/origin gates;
local/preview navigation can verify attribution and links without sending analytics.

Channel funnels should use PostHog anonymous identity, per-event UTM, event order,
and an explicit reporting window. Do not sum per-channel unique visitors, equate
Demo opens with completed use, or interpret contribution intent as submission.
No cross-device identity, person profile, custom session ID, entry ID or reporting
backend is added. Upstream forwarding, downstream ingestion and cross-site identity
remain separate integration requirements.

Local verification:

```sh
node --test scripts/utm-attribution.test.mjs scripts/analytics-events.test.mjs scripts/analytics-provider.test.mjs scripts/posthog-events.test.mjs scripts/posthog-client.test.mjs
npm run lint
npm run build
```

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
The only query-field exception is validated UTM in Vercel collection URLs, as above.

Vercel and PostHog share the same deliberate-action dispatcher. Analytics failures
cannot block navigation or clipboard feedback. Browser blocking can reduce observed
counts; installed code and environment configuration are not evidence of ingestion.

## Release verification

1. Configure the destination's public SDK token and ingestion host in
   the hosting project's Production scope only. Review and release through the
   existing staging/production process; environment edits alone do not update an
   already-built deployment. Do not change account permissions or billing.
2. Visit real production pages, including a Topic, its entry, and contribution.
   Make deliberate use actions. Verify `$pageview` and the seven relevant action
   families plus `campaign_entry` in the configured destination; filter by `app=recipes` and
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
6. Enter through an email UTM link; inspect the first PostHog view and one entry,
   then navigate to a detail, play video and copy a guide. Confirm every event's
   UTM and original landing path, independent of current URL. Refresh, restore
   history and continue the tab later: views/actions still occur without another
   entry. Navigate through an X promotion, then the same X promotion again: each
   identifiable external navigation creates an entry and subsequent actions carry
   X only. Check simultaneous mail/X tabs, opener-created and duplicated tabs,
   direct new tabs, invalid UTM, source-only UTM and blocked storage. Verify only
   Demo/Console hrefs propagate the validated source, replacing conflicting target
   UTM. Check a new PostHog session leaves tab attribution intact.
7. Inspect actual production requests and ingestion in both destinations. Verify
   Vercel's retained-UTM native reporting and custom-property/report limits in the
   project's dashboard before describing them as supported. Obtain separate
   evidence for upstream forwarding, target ingestion and shared anonymous identity;
   local tests cannot establish a cross-site funnel.
8. Determine actual submissions and publications from GitHub Issues/PRs and release
   links using the contribution SOP. No webhook, reporting database, or synthetic
   submission is needed for this phase.

Local checks and installed SDKs do not establish production ingestion. Verify
collection after release. Configuration changes do not update older, already-built
deployments or remove historical events.

References: [PostHog Next.js](https://posthog.com/docs/libraries/next-js),
[SDK configuration](https://posthog.com/docs/libraries/js/config), and
[anonymous events](https://posthog.com/docs/libraries/js/usage#anonymous-and-identified-events).
