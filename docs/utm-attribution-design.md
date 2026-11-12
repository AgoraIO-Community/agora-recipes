# Recipes UTM Attribution Design

Date: 2026-11-09

Status: Local implementation is complete. Production collection and cross-site integration still require verification.

## 1. Goals and scope

Add UTM attribution to existing analytics so we can identify which promotional channels bring visitors to Recipes and which Demo opens, video plays, copies, and contribution-intent actions follow.

Record each entry and action separately, without overwriting historical events. Deduplicate visitors by anonymous identity and measure channel outcomes using the source attached to each event.

This phase does not introduce cross-device identity, multi-touch allocation, or a reporting backend. Opening a Demo, Console, or contribution entry point does not establish completed use, successful registration, or a successful submission.

Phase one records UTM directly on events. Neither `attribution_entry_id` nor `journey_id` is required. Shared visitor identity across sites is an integration prerequisite, not an additional deliverable for Recipes in this phase.

## 2. Baseline before implementation

The local `staging` code reviewed for the original design included these events:

| Event | Existing purpose |
| --- | --- |
| `$pageview` | PostHog page views on pathname navigation; filter changes do not add a view |
| `catalog_action` | Search, filter, sort, load more, and related actions |
| `material_open` | Open a Demo, source repository, or original video |
| `video_play` | Video playback actually starts |
| `content_copy` | Successfully copy a prompt, guide, CLI command, or code |
| `share_action` | Copy a share link or open a sharing destination |
| `topic_action_open` | Open Topic participation, questions, replay, or source links |
| `contribution_open` | Open a GitHub form, Issue draft, or PR instructions |

Existing deliberate actions use one dispatcher for PostHog and Vercel Analytics. Vercel page views are handled by its page-collection component.

Before this implementation, event fields did not include UTM, reported URLs removed query strings and fragments, and the final PostHog allowlist discarded UTM. Promotion-entry detection, attribution persistence, and cross-site forwarding were absent. That code review did not establish production ingestion. The implemented behavior and verification procedure are documented in [analytics.md](analytics.md).

## 3. Existing campaign conventions

The launch uses the public naming conventions below.

This launch uses `utm_campaign=recipes_top10`. This is a campaign naming convention; the Recipes implementation must support other campaign values.

| Source platform | utm_source | utm_medium |
| --- | --- | --- |
| GitHub | `github` | `referral` |
| Agora website Blog | `agora_blog` | `referral` |
| Discord | `discord` | `social` |
| Reddit | `reddit` | `social` |
| X | `x` | `social` |
| YouTube | `youtube` | `video` |
| Email | `agora_email` | `email` |
| Google search ads | `google` | `cpc` |

- `utm_source`: The originating platform. Use the actual platform for other promotional channels.
- `utm_medium`: The channel category.
- `utm_campaign`: The campaign.
- `utm_content`: The article, post, reply, video, ad creative, button position, or version. Different materials must use distinct values.
- `utm_term`: The advertising keyword; omit it for email. Actual keywords may contain spaces and non-English characters, so the underscore naming rule for other fields does not apply. An unresolved `{keyword}` template is not a real keyword.

Manually named parameters use lowercase English letters, numbers, and underscores. Examples include `top10_overview_main_cta_v1` for email and `official_post_01` for X. The receiver preserves valid original values without renaming them.

## 4. Keep source and location separate

| Information | Question answered | Example |
| --- | --- | --- |
| Promotion source | Which channel brought this entry? | `google / cpc / recipes_top10` |
| Upstream entry location, an optional extension | Which page or button led to Recipes? | A Try in Recipes button on an Agora Use Case page |
| Current action location | Where did the visitor perform this action? | Open a Demo on a Recipes detail page |

UTM represents the promotion source. Existing page context and `placement` continue to describe the current page and button; do not mix these into UTM. `landing_path` records the first Recipes pathname for the current promotional entry and does not change on subsequent internal navigation. Record it separately from the page on which an action occurs.

Phase one does not require upstream `entry_surface` or `entry_point` parameters. Add a controlled `entry_point` only when precise upstream entry identification is explicitly needed. If an associated upstream click event already provides that location, do not duplicate it in transit.

The browser-provided referrer may be absent and cannot reliably distinguish multiple buttons on one page. An `entry_point` requires explicit upstream configuration and forwarding, and may also be absent. UTM alone cannot establish which page or button the visitor passed through; leave unsupported locations empty. Keep the existing internal Topic meanings of `topic_slug` and `source_topic_slug`.

For example, Google ad → Agora Use Case page → Recipes detail → Demo should preserve the same advertising UTM across all four steps. Recipes records its landing page and the detail-page Demo action location. Identify the upstream Use Case entry only when explicit evidence exists.

## 5. Source retention and replacement

Store the source per tab, without time-based expiry. Reporting time ranges are selected independently and do not determine when attribution expires.

| Scenario | Behavior |
| --- | --- |
| First arrival at Recipes with valid UTM | Record a campaign entry and save UTM plus the landing path |
| Ordinary internal navigation in the current tab | Retain the source and landing path without another campaign entry |
| Refresh or continue using the original tab on a later day | Retain the source and landing path; record actual views and clicks normally |
| Arrive through another promotion link, including identical UTM | Record another identifiable campaign entry and update the tab's source and landing path; subsequent actions carry the current UTM directly |
| A new promotion has a different source | Replace the entire association and record a new entry; do not modify old events or combine old and new UTM fields |
| Open a URL without UTM in a new independent tab | Leave attribution empty; do not inherit another tab's source |
| Open a URL without UTM normally in the same tab | Retain the saved source; missing UTM alone does not clear it |
| Tab storage is cleared or unreadable | Leave unrecoverable attribution empty; do not infer it from the visitor's historical events |

Not recording another campaign entry does not mean suppressing actions. Reactivating an unchanged tab does not itself add a page view. Navigation, refresh, and actual actions follow their respective event rules.

### Entry-detection limits

Neither the presence of UTM in a URL nor a change in UTM values is sufficient to identify a new entry. Those rules would double-count refreshes or miss repeated arrivals through the same promotion link.

Use available navigation types and processed state to distinguish refresh, history restoration, internal navigation, and new promotional navigation. If a repeated external arrival at the same URL lacks identifiable navigation evidence, acknowledge that it cannot be distinguished reliably. Changes in UTM combinations must not be presented as a complete external-click count.

A tab opened from another page or duplicated by the browser may receive a copy of sessionStorage. Account for this explicitly: sessionStorage alone does not establish tab isolation. Explicit cross-site promotional navigation may carry a source; a new tab without that evidence must not automatically inherit one.

A business entry ID is not required to count landings. Deduplicate entry processing using navigation type and the tab's processed state, rather than visitor identity or identical UTM. Record each identifiable new campaign entry separately.

## 6. Events and attribution fields

Preserve existing event names and triggers, and attach attribution to existing page and action events. Add `campaign_entry` specifically for promotional landings at Recipes.

| Field | Meaning |
| --- | --- |
| `utm_source` | Originating platform |
| `utm_medium` | Channel category |
| `utm_campaign` | Campaign |
| `utm_id` | Optional campaign identifier retained from the staging contract |
| `utm_content` | Creative or promotional button identifier |
| `utm_term` | Actual advertising keyword, optional |
| `landing_path` | Recipes landing pathname for this entry, without query or fragment |

`entry_point` remains an optional future extension, not a required field in this phase. Neither `attribution_entry_id` nor `journey_id` is required for acceptance.

Establish UTM attribution only when at least `utm_source` is valid. Other UTM parameters are optional; do not invent missing values. Without UTM or a saved tab source, record page views and actions normally, omit `campaign_entry`, and leave attribution empty. If only the current URL lacks UTM but the tab has a saved source, continue using that source.

Resolve attribution before sending the first page view so that the initial visit has the same source as subsequent actions. Send `campaign_entry` once per identifiable entry, without repeating it on ordinary refreshes or internal navigation.

Retain each platform's existing anonymous visitor identity mechanism; do not introduce accounts. Attach UTM directly to each tab's events instead of inferring source solely from the visitor's most recent entry time. This prevents attribution from switching incorrectly when email and X tabs are used simultaneously.

## 7. Cross-site forwarding

### Preserve the original promotion source

Continuous navigation from an Agora Blog or Use Case page → Recipes → a designated Demo or Console must preserve the original UTM. Do not replace it midway with the website or Recipes as the source.

An independent referral entry such as a Blog CTA may use its configured default UTM only when no original promotional UTM exists. For example, X → Blog → Recipes retains X. A visitor who opens the Blog without a promotional source and then uses its promotional CTA may receive the agreed `agora_blog` source.

Recipes forwards validated UTM only to designated Demo and Console targets, not to arbitrary source, sharing, or third-party links. If a target already contains different UTM, the current original source takes precedence for the continuous promotional path. Existing action events describe the destination and action location; no additional entry-location parameter is required.

If an entry supplies only `utm_source`, retain only its actual fields. Do not fill missing fields from downstream CTA defaults and create a mixed source. Without valid UTM, do not fabricate an upstream channel.

### Cross-site integration limits

The Agora website owns forwarding attribution into Recipes. Recipes owns recording its landing and forwarding attribution to designated targets. Demo and Console destinations own receiving attribution and recording their actions. Recipes changes alone cannot establish upstream or downstream integration.

Cross-site analysis should use a shared `distinct_id` where supported, event time, page actions, and each event's UTM. Each site must confirm its analytics project, identity configuration, and collection behavior support a shared visitor identity. Matching UTM alone does not establish the same visitor or the same promotional entry.

Phase one does not require a new linking ID for cross-site analysis. Consider one only when the business needs an exact one-to-one association between an upstream click and a downstream landing that existing identity and event information cannot provide.

The PostHog SDK owns `$session_id`. Do not override it, require it to match across sites, or make it mandatory for cross-site funnels. SDK session expiry does not clear the tab's saved UTM; a new session may retain the original source.

Shared cross-site identity is an integration prerequisite, not an implemented capability of this phase. Until verified, promise only Recipes channel analysis and parameter forwarding, without claiming cross-site deduplication or a complete cross-site funnel.

## 8. PostHog and Vercel responsibilities

| Platform | Changes in this phase | Analysis purpose |
| --- | --- | --- |
| PostHog | Attach attribution to `campaign_entry`, `$pageview`, and existing actions; extend the final allowlist | Primary channel-to-content-use and contribution-intent analysis |
| Vercel Analytics | Preserve existing query-free page URLs and restricted custom-event properties; do not send the full campaign context or `campaign_entry` | Lightweight traffic and action summaries |

PostHog reporting URLs continue to remove query strings and fragments. UTM is carried in separate fields; SDK automatic attribution must not override the business rules. Continue to avoid person profiles and `identify` calls.

Vercel receives at most two custom-event properties through the existing mapping. Full campaign and conversion analysis belongs to PostHog; do not infer Vercel native UTM report support from this implementation.

Do not inject a custom persistent visitor ID into Vercel to make its visitor counts match PostHog. Each platform deduplicates independently; do not combine or add their counts. Use PostHog as the primary channel-conversion measurement.

## 9. Measurement definitions

| Metric | Definition |
| --- | --- |
| Recipes campaign landings | Number of `campaign_entry` events; not new customer acquisitions across the full path |
| Page views | Number of page-view events, measured separately from campaign landings |
| Unique visitors | Visitors deduplicated by the platform's anonymous identity within the selected reporting range |
| Channel use visitors / actions | Recipe-use events carrying the corresponding UTM, counted by unique visitor / event respectively |
| Channel contribution intent | Contribution preparation or GitHub handoffs under the corresponding UTM; not successful submissions |

One visitor arriving through email and X may produce two campaign landings but only one overall unique visitor. That visitor may appear in both channel breakdowns; do not add channel visitor counts to obtain the total.

Each step of Google ad → Agora website → Recipes → Demo may be recorded, but a website landing plus a Recipes landing does not establish two acquisitions. Without shared cross-site identity, report each site separately and do not claim cross-site deduplication.

Attribute each action using its own UTM, without allocating it repeatedly to earlier channels. Funnels must constrain the same anonymous visitor, selected source or campaign, event order, and an explicit query window. Neither an entry ID nor a matching session ID is required. Do not divide unrelated aggregate totals to claim conversion.

Without an entry ID, a funnel measures visitor behavior under the selected channel or campaign conditions. It cannot promise exact pairing of repeated entries and later actions for the same visitor with identical UTM. Exact per-entry conversion is an optional future extension.

## 10. Data boundaries and failures

- Validate manually named fields against the agreed character rules and bound their length; the recommended maximum is 100 characters per value. Validate keyword characters separately for `utm_term`, rejecting control characters, excessive length, and unresolved templates.
- Use the five promotion UTM fields, preserve staging support for optional `utm_id`, and add only the necessary landing path, reusing existing page and action context. Do not store the complete entry URL, raw search text, clipboard contents, or arbitrary query parameters.
- If storage is unavailable, keep attribution in current-document memory where possible. Persistence after refresh is not guaranteed. Do not block browsing, navigation, or copying.
- Preserve the existing production-environment and canonical-origin restrictions. Local and Preview visits do not perform real collection.
- Browser blocking and network failures may cause undercounting. Client collection cannot guarantee recovery of every external click.

## 11. Acceptance criteria

| Case | Expected behavior |
| --- | --- |
| First email UTM arrival | The first page view and campaign entry carry `agora_email / email` and the correct landing path |
| Navigate to a detail, play video, copy a guide | Subsequent events retain the original source and landing path while recording the actual action page and placement |
| Refresh, history restoration, or continue using the tab on a later day | No time-based clearing and no duplicate campaign entry |
| Arrive through an X promotion | Record a new landing; later events in that tab use X while older events remain unchanged |
| Use email and X tabs simultaneously | Each action carries its own tab's UTM rather than the visitor's globally latest entry |
| Arrive through the same promotion link again | Record another entry when new navigation evidence exists; do not deduplicate solely by identical UTM |
| New tab without UTM, duplicated tab, or script-opened tab | Require explicit source-transfer evidence; do not inherit an unsupported entry |
| Google → Agora website → Recipes → designated target | Preserve the original advertising UTM; missing upstream placement configuration does not block phase-one collection |
| PostHog SDK creates a new session | Retain the tab's UTM without another campaign entry |
| Invalid parameters, missing source, unresolved keyword template | Do not fabricate a source or keyword; other events continue normally |
| Unavailable tab storage or blocked collection | User actions remain usable; attribution does not guess or block |
| Actual production requests and ingestion | PostHog attribution fields are valid; Vercel retains its limited event mapping; verify actual ingestion before claiming it works |

Deliverables include attribution implementation, tests for entry detection and forwarding, updates to the existing analytics documentation, and lint/build verification. Production and cross-site acceptance require actual evidence; local tests are not substitutes.

## 12. Integration with consent and the current event contract

The integration retains staging's `measurement_version=3`, `measurement_tier`,
search measurements, optional `utm_id`, aggregate counts and separate GA4 consent.
One attribution controller supplies both PostHog events and designated outbound
links. It replaces the old 30-minute inactivity policy with this design's
per-tab retention until source replacement, withdrawal or loss of recoverable
state.

Before product-analytics consent, neither rendering nor callbacks may create
campaign storage or a tab marker. Rejection and withdrawal invalidate the
controller and clear its memory, storage and owned marker. Regrant may use the
current visible URL, but cannot replay earlier actions or an already recorded
entry. Unrelated window names are not cleared.

Shared sensitive-text validation applies before persistence, capture and
forwarding. SDK initialization clears both ordinary and session campaign
persistence; explicit null defaults on each capture prevent missing current
fields from inheriting SDK history. Final validation omits those null values.
BFCache resume and delayed release callbacks verify ownership before writing;
an older document cannot restore its source over a newer one. A reset-marker
simulation is a regression case, not proof of natural cross-site reset behavior.

A tab marker and a separate per-document owner are local coordination state,
not business entry IDs and not analytics properties. Confirmed BFCache returns
can claim the latest valid session snapshot despite a historical window marker.
Delayed callbacks from an earlier document cannot write after that claim.


## 13. Anonymous source and selected-use counters

The aggregate tier also counts current-URL source categories and the selected
Demo, actual-play, successful-copy and contribution-handoff events. These use
the existing first-party anonymous collector with `measurement_version=4`,
independently of optional consent. They contain neither a visitor ID nor a
retained source. Only the finite public `utm_source`, `utm_medium` and
`utm_campaign` categories are accepted; other values become `other` and
keywords, creative text, campaign IDs and click IDs are excluded.

This aggregate scope does not change the consent requirement for the document
controller, browser SDKs, complete UTM event context or outbound forwarding.
See [anonymous reporting and self-assessment](analytics.md#anonymous-source-and-usage-self-assessment)
for category limits, reporting definitions and the remaining release assessment.
