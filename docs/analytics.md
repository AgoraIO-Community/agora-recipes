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
# Optional: defaults to https://us.i.posthog.com
NEXT_PUBLIC_POSTHOG_HOST=<custom ingestion URL or same-origin proxy prefix>
```

A build embeds these values, so changes require the normal release.
After analytics consent, the client runs only when `NODE_ENV=production`, `VERCEL=1`, and
`VERCEL_ENV=production`, and the browser is on the canonical HTTPS origin from
`SITE_URL` (default `https://recipes.agora.io`). A production deployment's generated
URL, a preview, or a locally served copy of production assets does not initialize
either analytics SDK. Local builds, development, and previews do not capture.
A real-production build fails clearly if the project token is missing.

### Optional reverse proxy

Set `NEXT_PUBLIC_POSTHOG_HOST` to an existing proxy, for example
`https://metrics.example.com` or `https://metrics.example.com/relay`.
An omitted, empty, or whitespace-only value uses the existing US Cloud ingestion
host. The project token stays the same, and `ui_host` stays at
`https://us.posthog.com` for the actual PostHog dashboard.

For a proxy routed through the site's own origin, use a prefix such as `/relay`.
The prefix must already route ingestion requests to PostHog in the deployment's
proxy layer; this setting does not create that route. Preserve capture paths,
request bodies, and query strings when forwarding, and strip site cookies and
authentication headers before sending upstream. Follow the
[PostHog reverse-proxy guide](https://posthog.com/docs/advanced/proxy) for the
chosen proxy platform.

Redeploy after changing this public build-time value. Verify requests reach the
configured proxy and events arrive in the existing project. The production-origin
guard and disabled advanced capture features apply equally with a proxy.

The pinned 1.439.0 slim SDK loads lazily; first events wait for initialization. The site sends one
manual `$pageview` per pathname navigation. Filtering or changing a draft's Topic
without changing pages does not generate another view. Basic counters use the
first-party collection route below; no reporting database, runtime GitHub fetch,
or site account is required.

## Two measurement tiers

### Basic counters: no visitor identity

In canonical production, basic page, search and selected usage counters run for pending, accepted,
denied, withdrawn, and unavailable consent. There is no visitor control to turn
this tier off. The existing footer discloses that basic counts stay enabled.
The managed popup and corporate policy have not yet been updated to describe
the expanded anonymous source and usage scope.

The browser sends a small, cookie-free request to the first-party
`POST /api/analytics/basic` endpoint. It omits credentials and referrers, creates no
visitor/session/search ID, accesses no browser storage, and sends no URL,
account, consent status, device attributes, or timestamp. The three bounded
campaign fields below retain their original values. A pathname
navigation counts once; filter changes and optional-consent changes do not add
another basic page view. A settled nonempty search counts once after 700 ms, or
before an immediate result open. Optional-consent changes do not recount it.

Basic search text is mapped in the browser to a finite vocabulary: public recipe
titles/slugs, catalog platform/use-case/capability labels, and common technical
terms. Recipe titles and slugs resolve to the canonical slug across locales. Anything else, including sensitive
patterns, becomes `other` before the collection request. The server independently
validates the public vocabulary and content/Topic IDs. It rejects extra fields,
identifiers, arbitrary search terms, malformed/oversized bodies, and foreign
origins. A zero-result flag is retained, without the raw query or result list.
This intentionally cannot reveal new long-tail search phrases; the consenting
behavioral tier below retains bounded, filtered search terms.


The same dispatcher counts Demo opens, actual video playback, successful copies
of guides, prompts, code and CLI commands, and contribution handoffs. These
reuse existing success/play triggers. Muted hover previews, failed copies,
source/video-original links, shares, filters and result-open events do not enter
this additional anonymous usage vocabulary. One delegated link listener serves
all consent states; changing consent neither replays nor doubles these counts.

`utm_source`, `utm_medium` and `utm_campaign` describe only the current visible
URL. New channels and campaigns require no registration or code change. Each
valid value is preserved, including case, hyphens, dots, domains, spaces and
Unicode; values are not mapped to `other`. The browser and server use the same
100-character bound and sensitive-text checks. Controls, unresolved templates,
email addresses, full URLs and obvious credentials are rejected; these checks
cannot recognize every possible personal identifier. Campaign publishers must
not use recipient or visitor identifiers as UTM labels. Each anonymous field is
independent, so a campaign-only URL still retains its campaign. Repeated
parameters use their first value, following `URLSearchParams.get`.
`utm_content`, `utm_term`, `utm_id`, click IDs, complete URLs and referrers never
enter the anonymous request. Untagged navigation has no retained anonymous
source.
This tier measures tagged page/use counts, including reloads, rather than
unique visitors, exact external clicks or per-entry conversion.

The server forwards only a counter increment, its public dimensions, and its UTC
date to the existing PostHog destination, using the optional proxy host if set.
`recipes_basic_count` has `measurement_tier=aggregate`, `measurement_version=4`,
`count=1`, a timestamp
rounded to UTC midnight, and the same constant `distinct_id=recipes:aggregate`
for **all** visitors. That required protocol field identifies a shared counter,
never a person, session, device, or daily fingerprint. Person-profile processing
and GeoIP enrichment are disabled; the IP property is a fixed non-visitor value.
No inbound Cookie, Authorization, Referer, User-Agent, IP, or forwarding header
is copied to the provider request. This route does not initialize either browser
analytics SDK and has no PostHog cookieless fingerprint mode.

The provider stores **anonymous counter increments**, not a compacted database
row per day. Summing the numeric `count` property gives the daily aggregate. There
is no per-visitor event history. Provider ingestion metadata and hosting/network
access logs are separate operational data: a server necessarily receives network
requests, so this implementation does not claim that the entire infrastructure
never processes an IP address. Do not log collector request bodies/headers or
join operational logs to analytics. The constant counter identity must never be
identified, aliased, or merged with an account.

Delivery is best effort: no replay queue, automatic retry, persistent client
buffer, or visitor deduplication token. Blockers, offline visits, bots, repeated
refreshes, and delivery failures affect counts. A count is a **view/search**, not
a unique visitor, visit, return rate, or conversion funnel. This endpoint cannot
prevent a determined script from inflating a public anonymous counter; use
aggregate traffic controls without introducing a visitor fingerprint.

### Optional behavioral analytics: consent required

PostHog browser events, Vercel page views/custom events, and campaign session
storage remain off until the visitor explicitly allows optional analytics.
Refusing it does not block browsing, search, demos, copying, or contribution.
Pre-consent actions are not buffered or replayed; the current page and visible
nonempty search become fresh behavioral measurements when consent is granted.
Basic counters remain independent and are not duplicated by that transition.

Agora/Securiti is the only consent manager, in development, previews and
production. Configure the same managed interface with:

```text
NEXT_PUBLIC_SECURITI_TENANT_ID=<existing Agora Securiti tenant UUID>
NEXT_PUBLIC_SECURITI_DOMAIN_ID=<existing Agora Securiti domain configuration UUID>
```

Do not publish actual configuration identifiers. Environment edits require a
new build/release. The footer opens the managed preference center directly;
there is no Recipes consent dialog, local fallback manager, or local consent
record. Old Recipes consent records are ignored. Local previews require CMP
configuration to exercise the real UI; analytics delivery remains disabled by
the existing deployment and origin gates. Persistence tests need an HTTPS test
host covered by the managed cookie domain. A localhost preview cannot persist
that domain’s cookies.

Product analytics reads the managed `Analytics & Customization` category,
currently displayed as `Performance`. Functional or advertising consent does not
grant analytics. Central choices can affect other Agora sites. The SDK owns all
choice persistence and preference actions; application code does not rewrite
shared corporate CMP configuration. A missing, ambiguous, or unavailable managed
decision keeps optional analytics off. Both adapters refresh from the same live
record on consent events, visibility/focus changes and while the page is visible.
SDK failure offers retry, without a second form. Basic counters remain enabled.

Product analytics withdrawal stops the PostHog and Vercel adapters, clears
campaign state and Recipes SDK persistence, and aborts PostHog delivery while
the choice is denied. Dedicated Recipes persistence
and host-only cookies preserve Console identities and central consent cookies.
Necessary preference records may remain to honor refusal. Basic counters continue
without acquiring a visitor ID or importing any earlier optional identity.

Replay, autocapture, advertising, heatmaps, remote flags, performance, and exception
capture remain disabled regardless of choice. Provider names and SDK settings
stay in engineering documentation and the maintained corporate cookie inventory;
visitor copy uses a short purpose/choice explanation.

### Optional traffic analytics

GA4 uses a separate category in the **same Securiti preference center**.
Before enabling it:

1. Add a dedicated, optional, default-off traffic analytics category in the
   managed configuration with base category `Analytics & Customization`.
   Keep the existing product analytics category separate.
2. Set `NEXT_PUBLIC_SECURITI_GA4_CATEGORY` to that category's exact managed name.
3. Set `NEXT_PUBLIC_GA4_MEASUREMENT_ID` to the Recipes stream's `G-…` measurement
   ID and rebuild. Disable Enhanced Measurement on that web stream to prevent
   automatic history or interaction events outside the application's page views.

A missing or invalid measurement ID skips the Google tag entirely. An ID without
a matching dedicated managed category also cannot start GA4. Overlapping or
ambiguous category mappings fail closed. A product grant cannot grant traffic
analytics, and either managed choice can be withdrawn independently. The current
managed configuration has only the existing product analytics category; adding
the traffic category is a CMP configuration task, not a local browser fallback.

The production origin loads the tag only after traffic consent. The application
sends page views with allowlisted campaign parameters, strips other URL query
parameters and fragments, and disables Google Signals and ads personalization.
Withdrawal disables the tag, drops any pending page view, and clears its Recipes
cookies. Basic anonymous counters continue independently. GA4 reports cover
consenting traffic only.

### Consent UI conventions

Securiti renders the initial notice and the only preference center. The footer's
**Privacy settings** action opens that center directly. Keep corporate notice
copy, policy links, opt-out actions, keyboard handlers and choice persistence
under the SDK's ownership. Closing a notice or preference center never grants
consent. The footer continues to disclose the always-on anonymous counters.

The shared managed-notice adapter uses an opaque attached bottom bar, Recipes
typography and system appearance, separate equal-width accept/reject controls,
and wrapping text. Desktop controls are 32px; phone/coarse-pointer controls are
at least 46px. Preserve the SDK's visibility and dismissal styles. The development
reference opens the real managed notice instead of rendering another version;
local QA also verifies that same SDK on product routes. A load error offers only
retry or continued browsing; it cannot collect an alternative consent decision.

### Release and policy alignment

The owner-requested baseline has no opt-out. Do not describe this as universally
exempt from consent or as a strictly necessary cookie. Some audience-measurement
exceptions require a separate right to object; for example, the
[ICO statistical-purpose guidance](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-the-exceptions/)
requires clear information and a simple, free objection mechanism. The
[CNIL audience-measurement criteria](https://www.cnil.fr/fr/cookies-solutions-pour-les-outils-de-mesure-daudience)
also impose specific purpose, aggregation, separation, and retention conditions.
The owner must determine the applicable basis and align Agora's cookie inventory,
privacy policy, and managed category descriptions before production release.
Agora's current Performance description includes audience measurement; the new
Recipes tier distinction must not be presented as if that wording already covered
it. This PR remains unmerged and does not change the corporate policy or CMP.

### Basic reports

Filter `event=recipes_basic_count`, `app=recipes`, `environment=production`,
`measurement_tier=aggregate`, and `measurement_version=4`. Use **sum of count**:
Version 3 historical counters cover page/search counts without campaign dimensions.

- Page/content popularity: `metric=page_view`, broken down by `page_type` and
  `content_slug` or `topic_slug`, grouped by `day`.
- Known popular searches: `metric=search`, broken down by `search_term`. The
  `other` bucket covers unrecognized and filtered text; never infer its wording.
- Zero-result share: sum of search counts with `zero_results=true` divided by
  the sum of all search counts for the same scope and date range.
- Traffic sources: `metric=page_view` with campaign fields present, broken down by
  source, medium and campaign. Missing source does not imply direct traffic.
- Content use: `metric=material_open, action=demo`, `metric=video_play, action=play`,
  or `metric=content_copy`, broken down by `content_slug` and `action`.
- Contribution intent: `metric=contribution_open`, broken down by `action`.
  A handoff is not a completed submission.

Do not use unique-person/session aggregations on the shared counter identity.
Do not add basic counts to behavioral page/search/use totals: consenting traffic is
already represented in the basic tier. Behavioral funnels, return rates, detailed
search terms, and retained full UTM attribution cover consenting traffic only.
Anonymous campaign fields describe the current URL rather than retained journey attribution. The tiers have
no per-visitor join key. They can be compared only as aggregate samples, with the
coverage and counting differences disclosed.

## Measurement contract

Locales are `en`, `zh-Hans`, `zh-Hant`, `ja`, `hi`, `es`, and `pt-BR`.
Automatic loading uses the existing `catalog_action:load_more` event. Search
measurement records settled results, not each keystroke.

Every behavioral full-contract event carries `app=recipes`, `site=agora-recipes`,
`environment=production`, `measurement_tier=behavioral`, and `measurement_version=3`. The vendor-independent contract in
`lib/analytics-events.ts` and `lib/analytics-context.ts` builds one deliberate
action payload before destination adapters. PostHog receives the full allowed
payload; Vercel receives an explicit two-property summary within its Pro limit.
Public context includes locale, page type,
stable content slug, selected/context Topic slug, source Topic slug, action,
placement, result count, bounded search measurements, and standard campaign fields
where applicable. Vercel retains its native pathname-based page views; PostHog
receives manual page views with the same context and campaign dimensions.

| Signal | Definition | Limit |
| --- | --- | --- |
| Popular searches | `catalog_action:search`, grouped by normalized `search_term`. | Count distinct `search_id`; empty searches are excluded. Input is settled for 700 ms after results are ready, or flushed before a quick result click. |
| Zero-result searches | Search events with `result_count=0`. | Current filters affect results. Separate `search_status=metadata_only` (guide index failed) from `complete`. |
| Search result opens | `catalog_action:result_open`, with `search_term`, `search_id`, `content_slug` and one-based `result_position`. | Primary/keyboard and middle-click recipe detail opens count. External demos and playback have their own events. |
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
After consent, unique counts use a persistent anonymous browser identity, without a person
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

The other bounded events remain `catalog_action` (settled search/search result open/applied
filter/sort/automatic `load_more`; legacy expand/collapse values remain accepted), `share_action` (successful link copy or sharing handoff),
`material_open`, `video_play`, `content_copy`, `topic_action_open`, and
`contribution_open`. Allowed actions are defined in `lib/analytics-events.ts`.

## Campaign attribution

Tag externally distributed links with standard UTM parameters. For example,
replace `community-challenge` with an existing Topic slug:

```text
https://recipes.agora.io/topics/community-challenge?utm_source=discord&utm_medium=community&utm_campaign=voice_week&utm_content=announcement
```

| Parameter | Meaning | Example |
| --- | --- | --- |
| `utm_source` | Publisher or referring channel | `discord`, `newsletter` |
| `utm_medium` | Distribution method | `community`, `email`, `paid_social` |
| `utm_campaign` | Stable campaign name | `voice_week` |
| `utm_id` | Optional campaign identifier | `campaign_2026_11` |
| `utm_content` | Creative or link placement | `announcement`, `footer` |
| `utm_term` | Optional paid keyword | `voice agent` |

Lowercase English letters, numbers and underscores are a publishing convention,
not a receiver restriction. All six fields preserve valid original case,
punctuation, spaces and Unicode. The consented attribution controller requires a
valid `utm_source`; other fields are optional and never filled from older
campaigns. Repeated parameters use the first value. The shared `campaignText`
check rejects unresolved templates, controls, values longer than 100 characters,
emails, full URLs and common credential patterns before storage, reporting or
forwarding. Plain domain labels such as `www.bilibili.com` and public handles
such as `@AgoraIO` are accepted. No
arbitrary query parameter or ad click ID is collected.

Attribution uses one consent-bound document controller in
`lib/analytics-attribution.ts`, exposed by `lib/browser-attribution.ts` to both
analytics and `AttributionLink`. Rendering reads a cached snapshot without
initializing storage or writing `window.name`. Initialization occurs in effects
or consented action dispatch. Pending or denied consent leaves outbound links
unchanged. Withdrawal removes campaign storage (`recipes:campaign:v1` and the
legacy `recipes:utm` key), clears the owned tab marker and memory, and invalidates
old callbacks. Regrant uses only the then-current URL, without replaying an
already recorded campaign entry or pre-consent actions.

After consent, a validated external promotion navigation produces one PostHog
`campaign_entry`; the first PostHog page view and subsequent actions carry the
same source and `landing_path`. The landing path is a pathname without query or
fragment. Ordinary internal navigation and reload/history restoration do not
produce another campaign entry. When no saved source can be recovered, a
reload/history restoration still reads valid UTM from the current URL for
subsequent actions and forwarding. There is no inactivity expiry: continuing the
tab on a later day retains its source while reporting ranges remain independent.
A new promotion replaces the complete source, including absent fields.

A local random tab marker and per-document ownership state distinguish supported tab
continuations from inherited sessionStorage. New tabs without evidence of a
source do not inherit it. BFCache restoration reconciles current storage and the
current marker before writing. A confirmed BFCache return may adopt the latest
validated session snapshot even when the browser restores a historical marker.
It claims a local document owner before emitting events, so a delayed pagehide
from another document cannot overwrite that claim. Unproven restores drop their
stale local source. Both resume and delayed pagehide callbacks are
prevented from overwriting an unproven newer owner. Missing lifecycle events,
blocked storage and browser-specific marker behavior can prevent recovery;
unrecoverable sources remain empty. Same-URL activations without new navigation
evidence cannot be counted as a complete external-click ledger.

Only catalog Demo anchors and the designated footer Console link forward UTM.
They use the same consented snapshot as events, replace the entire target UTM set,
and preserve functional query parameters and fragments. Source, share, original
video and other links are unchanged. `landing_path` is never forwarded. No
cross-site identity or successful downstream action is implied.

This is event-scoped campaign context, independent of Topic membership and source
Topic, not an authenticated identity or a cross-device first-touch profile. It
does not claim to match a provider's session definition. Untagged visits without saved attribution have no
inferred UTM source; that does not establish that they were direct traffic.
PostHog's automatic campaign persistence is disabled, and stale SDK campaign
super-properties are overridden by this shared contract.

## Content and search reports

Always filter `app=recipes` and `environment=production`. Use
`measurement_version=3` when a report needs the new campaign/search fields;
historical version 1 events cannot supply missing search terms or attribution.

- **Most viewed recipes:** `$pageview`, `page_type=recipe`, grouped by
  `content_slug`, with total views and distinct anonymous viewers. Rank Topic
  views separately using `page_type=topic` and `topic_slug`.
- **Most used recipes:** events with `is_recipe_use=true`, grouped by
  `content_slug` and optionally `recipe_use_kind`.
- **Most searched terms:** `catalog_action`, `action=search`, with a present
  `search_term`, grouped by that term and counted by distinct `search_id`.
- **Search gaps:** the same searches with `result_count=0` and
  `search_status=complete`. Show the zero-result share alongside volume; report
  metadata-only fallback searches separately.
- **Search result-open rate:** for the same reporting window and term, divide
  distinct `search_id` values with a `result_open` by distinct searched IDs.
  Join by `search_id`; multiple opens from one search count once. An open is not
  completed use, and browser blocking or window boundaries can leave unmatched IDs.
- **Campaign performance:** break down Topic/recipe views, unique recipe users,
  and contribution handoffs by `utm_source`, `utm_medium`, `utm_campaign`, and
  optionally `utm_content`. Keep audiences and observed actions distinct from
  completed registrations or submissions.

`search_id` is a random identifier for one search attempt, not a user ID. Search
text uses Unicode NFKC normalization, lowercase, trimming, and collapsed whitespace
so `VOICE  Agent` and `voice agent` share a bucket. Terms over 100 characters and
obvious emails, URLs, phone-like inputs, credentials, and control characters are
omitted with `search_term_redacted=true`; their search counts and result counts
remain measurable. This is a best-effort pattern filter, not a guarantee that all
personal information can be recognized. No per-keystroke text or clipboard data
is sent. Returning to a nonempty search URL creates a new search attempt.

The Vercel adapter sends at most two custom properties: `action` plus normalized
`search_term` (or its redaction flag) for searches; otherwise `content_slug`,
`topic_slug`, `source_topic_slug`, or `placement`, in that priority order. This
fits the standard Pro limit without requiring a paid add-on. Vercel provides
popular-search and content/action summaries; it does not receive the complete
campaign/search funnel fields. Use the full event contract in PostHog for those
reports. The shared contract and attribution logic contain no SDK dependency,
so future destinations can implement their own projection without changing
component instrumentation. Check actual ingestion in both destinations after release.

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
events and removes profile updates, DOM text, raw referrers, arbitrary URL
query/hash data, clipboard contents, destination URLs, and submission text. Only
the normalized search and campaign fields described above are admitted; URLs
still have their full query string and fragment removed.

Vercel and PostHog share the same deliberate-action dispatcher. Analytics failures
cannot block navigation or clipboard feedback. Browser blocking can reduce observed
counts; installed code and environment configuration are not evidence of ingestion.

## Release verification

1. Configure the destination's public SDK token and optional ingestion host in
   the hosting project's Production scope only. Review and release through the
   existing staging/production process; environment edits alone do not update an
   already-built deployment. Do not change account permissions or billing.
2. In every consent state, inspect basic requests and server-side increments:
   public dimensions only, the same shared counter identity, day-rounded time,
   and no inbound browser metadata. Reject, reload, accept, then withdraw. Basic
   counts must continue without duplicate views/searches at consent transitions.
   Optional PostHog/Vercel events and campaign/SDK identity storage must occur
   only while accepted. Exercise already-loaded scripts, lazy imports, retries,
   a second tab, and a fresh visit after central withdrawal. Block the configured
   CMP: optional analytics stays off, basic counts continue, and retry remains usable.
3. Visit real production pages, including a Topic, its entry, and contribution.
   Make deliberate use actions. Verify `$pageview` and the seven relevant action
   families in the configured destination; filter by `app=recipes` and
   `environment=production`, and inspect bounded context and clean URLs.
4. Confirm a single pathname navigation produces one view and changing filters
   does not. Successful copying counts once; failed copying and hover previews
   do not produce use events.
5. Check Topic A → detail → contribution, change association to B, then clear it.
   Confirm independent source/association fields in captured events and dashboard
   breakdowns. Also confirm direct visits have no inferred source.
6. Enter a tagged Topic link, navigate to a recipe and contribution, and verify
   the same campaign dimensions. Test an untagged route, reload, new campaign, and
   continued use beyond 30 minutes without a new campaign entry. Run a normal search, a zero-result search, a
   sensitive-pattern search, and an immediate result click. Confirm matching
   `search_id` on search/open, normalized or redacted terms, and result position.
7. Confirm local/development/preview visits send no events, including a copy of
   a production build served on localhost and the generated production deployment
   URL. Recheck Vercel collection
   alongside PostHog. Do not mark tracking Issue T5/T9 complete before real ingestion.
8. Determine actual submissions and publications from GitHub Issues/PRs and release
   links using the contribution SOP. No webhook, reporting database, or synthetic
   submission is needed for this phase.

Local checks and installed SDKs do not establish production ingestion. Verify
collection after release. Configuration changes do not update older, already-built
deployments or remove historical events.

References: [PostHog Next.js](https://posthog.com/docs/libraries/next-js),
[SDK configuration](https://posthog.com/docs/libraries/js/config), and
[anonymous events](https://posthog.com/docs/libraries/js/usage#anonymous-and-identified-events),
[UTM traffic-source dimensions](https://support.google.com/analytics/answer/11242870),
and [Vercel custom-event limits](https://vercel.com/docs/analytics/limits-and-pricing).

## UTM regression verification

Attribution changes preserve behavioral `measurement_version=3` and the separate
aggregate tier (expanded anonymous counters use version 4),
search measurements, separate GA4 consent and the existing basic-counter path.
Full campaign context and `campaign_entry` go to PostHog. Vercel keeps its
existing two-property action mapping and query-free page URLs; campaign fields
and the new entry event are not added to Vercel.

SDK initialization clears campaign keys from both ordinary persistence and
session persistence. Each capture also supplies explicit null placeholders for
absent campaign keys: SDK property merging skips undefined values, so undefined
cannot reliably mask historical state. Final validation removes the null
placeholders before delivery. Neither cleanup changes anonymous identity nor
requires a new session ID.

Run `node --test scripts/*.test.mjs`, `npm run lint`, `npm run build`, and
`npx tsc --noEmit`. Tests include consent lifecycle, identical promotion entries,
cloned tab state, source-only replacements, sensitive keywords, invalid ownership
and a simulated marker reset before BFCache recovery. The installed PostHog SDK
is used for an isolated real property-merge regression; network delivery is not
part of that test. Production ingestion, target-site forwarding/ingestion and
shared cross-site identity still require separate acceptance evidence.


## Anonymous source and usage self-assessment

The implementation reports counter dimensions and bounded campaign labels through the existing
first-party endpoint and server-side PostHog adapter. It creates no visitor ID,
per-tab source, browser persistence, fingerprint, exact client timestamp or
visitor journey in the anonymous tier. Network/access logs are separate from
these counters and must not be joined to them. The existing concise footer
notice is retained; this document records the expanded source and event scope.
Behavioral SDKs and outbound
source retention remain behind the managed optional product-analytics choice.

These measures minimize the data; they do not by themselves establish a legal
consent exemption. The [EDPB technical-scope guidance](https://www.edpb.europa.eu/system/files/documents/2024-10/edpb_guidelines_202302_technical_scope_art_53_eprivacydirective_v2_en_0.pdf)
includes URL tracking. The [ICO statistical-purpose guidance](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-the-exceptions/)
allows some aggregate traffic-source measurement for service improvement,
requires clear information and a simple, free means to object, and excludes
online-advertising purposes. [CNIL's self-assessment resources](https://www.cnil.fr/fr/cookies-solutions-pour-les-outils-de-mesure-daudience)
cover the conditions for an audience-measurement exemption.

Before production release, record the applicable jurisdictions and purposes,
align the managed notice and policy with this expanded collection, and resolve
any required objection mechanism. The existing always-on baseline has no
anonymous-counter opt-out. Advertising optimization, per-recipient email links,
individual conversion tracking and cross-site matching are outside this
anonymous implementation. No corporate policy, CMP configuration, data-processing
agreement or deployment is changed by this code update.
