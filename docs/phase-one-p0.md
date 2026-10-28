# Phase One Verification and Release Notes

Baseline: PR #77 at `bd67fdf1c5acdbbfd015fb8f65b109a3c11eb2d9`.
Implementation continues in [PR #77](https://github.com/AgoraIO-Community/agora-recipes/pull/77). The single tracking issue is [#78](https://github.com/AgoraIO-Community/agora-recipes/issues/78); all phase-one priorities and acceptance checks stay there.

## Delivered Behavior

- One catalog and one stable detail identity for each entry. Materials are optional individually; at least one Demo, video, source, or guide is required.
- Media belongs to entry metadata. `content/showcase.json` owns recommendation order only.
- Material filters combine with AND. Platform choices retain OR. Legacy `?topic=` quick filters retain their existing meaning. Content cards have no curated Topic membership.
- Detail links carry validated catalog `returnTo` context. Refresh and new tabs retain it. Scroll snapshots are scoped to the full source-list address; links without context use the catalog fallback. Curated Topic links use the same source context and display the Topic name in the return label.
- Static site locales: English at existing URLs, plus `zh-Hans`, `zh-Hant`, and `ja`. Editorial introductions are separate from original author metadata and guide documents. Future missing translations fall back to original metadata.
- GitHub contribution instructions and an English Issue form, with direct PRs still targeting `staging`. No new site accounts or business backend.

The complete phase-one code is included in the same PR and tracking issue:

- `/topics` and `/topics/<slug>` provide collections and activity archives, optional sections/actions, and edition-scoped awards. Three real initial Topics reference existing entries: an official starter kit, community practice projects, and the completed AI Mobile Coders 2026 event. Pillion's award is explicitly author-reported and linked to the author's source, not presented as organizer-verified.
- Topic membership is explicit, independent from technical tags and homepage recommendations. Details show associations; content cards never do. Topic filters, expansion, locale, and source scroll state survive detail visits. Direct links retain the catalog fallback.
- The build confirms reciprocal author language navigation and the same guide/repository/ref. Seven current projects expose confirmed English and Simplified Chinese documents. Optional maintainer mappings resolve ambiguity. Source aliases map to canonical script/language IDs without changing filenames or original URLs. Automatic selection uses a confirmed match, English, then the original; a manual choice takes priority. Missing manual versions show a dedicated message with no substituted reader.
- All source documents are fetched at build time. Known version routes and explicit unavailable states for supported languages are static. Selected Raw links, Markdown copying, prompts, outlines, assets, and document alternates use the selected source; the existing Recipe API and original Markdown routes remain unchanged.
- Share actions use clean localized canonical content URLs, real cover images or the locally generated `/social-card.png`, and native/X/LinkedIn handoffs. Clipboard events require success; platform handoffs do not claim publication.
- The seven event families use the existing Vercel SDK and the explicitly requested PostHog project (693535). Bounded public dimensions exclude search text, accounts, submissions, copied text, and destination URLs. Search is debounced, hover previews do not count as plays, and actual video plays are counted once per player opening. URL queries/hashes are removed from both page views and custom events before sending.

See CONTRIBUTING.md for Topic metadata, optional source-language mappings, contribution review, and verification commands. The requested PostHog browser SDK is the only new analytics dependency. No site account or business backend was added. See [the current measurement contract](analytics.md).

## Local Verification

- `npm run lint`: passed, with the pre-existing `components/agora-logo.tsx` image warning.
- `npm run build`: passed; generated 110 artifacts and 879 static pages. New Topic, guide-version, and social-image routes are static; the only dynamic routes are the existing Recipe APIs.
- `npx tsc --noEmit`: passed; Next builds now also reject TypeScript errors.
- `node --test scripts/*.test.mjs`: 61 passed. Coverage includes optional materials, Topic membership/validation, reciprocal source-language discovery, current-language indicators and code-example exclusion, script-aware fallback, missing manual versions, original-document preservation, Unicode headings, material filters, URL state, production guards, event dimensions, and URL redaction.
- `node scripts/check-llm-discovery.mjs http://localhost:4181`: passed for all 110 existing guides, including Markdown, canonical URLs, sitemap coverage, and missing-slug responses.
- `node scripts/check-phase-one.mjs http://localhost:4181`: passed for all four locales, Topic membership and card restrictions, automatic/manual source language selection and unavailable states, sharing metadata, contribution paths, static social PNG, and existing API schema.
- Browser checks covered all four site locales, 320px/390px phones, 768px tablet, and desktop. Phone browsing stayed in two columns without horizontal overflow; the phone filter sheet stayed within the viewport.
- Checked combined search, platform selections, and material filters; refresh and explicit return links retained state. A new-tab link retained its return address. A local catalog return restored a nonzero scroll position. Theme choice survived reload and locale navigation.
- Final browser checks also covered 901px/1101px header breakpoints, two different Topic returns for Pillion, filtered Topic returns after refresh and in a new tab, manual author-language selection across site locales, clean clipboard share URLs, activity archive attribution, and Topic-prefilled GitHub form links. Local preview loaded no Analytics scripts.
- Temporary Demo-, source-, and video-only entries rendered without a guide or prompt. Their source/Demo actions and video player used real existing destinations. These clearly labeled fixtures were removed before the final build.
- Existing metadata values and author credit are unchanged apart from relocating the existing media fields into entry metadata. The PostHog SDK and its installer-generated lockfile changes are included. Unrelated generated-document refreshes are excluded from the commit.

Browser emulation does not verify physical devices, complete microphone/camera sessions, or third-party Demo availability for every visitor.

## Compact UI Refinement — 2026-10-28

The first functional implementation left new controls too spread out. The owner's Agora family standalone reference informed this refinement; it is reference material, not application code or a replacement for the existing site identity.

- Shared solid controls now use 32/36/44px desktop sizes, matching text and icon actions. Phone/coarse-pointer targets stay at least 46px. Existing card crops, two-column phone browsing, opaque reading surfaces, dark default, and saved theme remain.
- Language selection is a persistent header icon on desktop and phone. A named tooltip and checked four-language menu expose the current selection. The menu reuses the complete Liquid Glass engine and Radix keyboard/dismissal behavior. Nonmodal menus do not lock the page or change its width. Compact header actions also retain Docs/GitHub navigation at intermediate desktop widths.
- Shared icon actions also provide theme and copy/share affordances. Sharing platforms live inside a compact menu beside the primary actions. Successful copying changes the icon to a check and announces the result; failures retain a readable recovery link.
- The author-document selector is a compact shared Select beside the reading heading. The actual document language and preservation note remain visible. Topic cards group their status and entry count; header, catalog, and detail spacing follow the same compact scale.
- Browser checks covered 320px/390px phones and desktop, dark/light controls, Japanese/Traditional Chinese selection, selected-language marking, Escape focus return, native/platform share menu destinations, canonical clipboard output, author-original choice and source returns. Phone headers retained three distinct 46px actions without horizontal overflow.
- The mechanical design scan reported only the pre-existing neutral Markdown blockquote border; it is source-reading punctuation, not a newly introduced card accent. No dependencies or source-document changes were needed.

## Interaction Consistency Pass — 2026-10-28

The owner's Agora family HTML remains the visual authority. Public Bencho examples were consulted for interaction continuity (selection, copy confirmation, and disclosure feedback); no Bencho component source, library, or dependency was adopted.

- Fixed the clipped popup focus ring at the shared control level. Menu/select options use an inset keyboard ring; the selected-language check remains separate from the current hover/focus highlight. The complete Liquid Glass engine and solid accessibility fallbacks are retained.
- Filter rows retain a stable base order while live counts and availability change. Selecting Python left all six leading technology rows at exactly the same offsets; Python plus TypeScript returned 59 real results. Material options use a compact two-column grid. Facet search has an empty state and clear action; the body scrolls independently of the fixed result/reset footer.
- Prompt, Markdown, code, and share-link copying use one small feedback hook. Pending work retains focus and blocks duplicate writes. Successful copies draw a check without changing button width, announce the result, and return to idle after 2.5 seconds. Failures stay available for retry and manual recovery. Real clipboard success and feedback reset were exercised; permission failures were not forced on the user's browser.
- Reader tabs share a moving 2px underline. Only the selected reader panel is visible. Topic filters use the same surface indicator; arrow-key focus and Space activation were checked. Topic directory links cover their cards; content cards retain zero Topic membership links.
- Topic detail buttons, activity metadata, and return links use the same control/spacing rules. Recipe detail and contribution navigation now express the current section. The same content reached from a Topic retained its named source return.
- The contribution page presents form and direct-PR paths with aligned actions, truthful public guidance, a preserved optional Topic reference, and a review disclosure. Phones stack both paths with full-width 46px actions. The footer does not invite users back to the page they are already on.
- Browser checks covered 1280px desktop, 768px tablet, 390px and 320px phones, dark/light themes, Japanese long labels across all four requested surfaces, selected/disabled/empty/reset states, keyboard dismissal/focus return, and reduced motion. No horizontal overflow was found; reduced-motion disclosure feedback used a 0.001s transition while preserving its open state. No real submission or external share was posted.
- The locale regression check now rejects UI feedback keys placed outside the dictionary the site actually loads. The design scan reported only the existing neutral Markdown blockquote border, retained as source-reading punctuation.

## Staging Integration — 2026-10-28

Resolved the recommendation/media conflict with staging at `0213352`. The two newly accepted entries, Filler-Free: Live and M5 StickS3 Agora Voice Agent, retain their author metadata and generated documents. StickS3 media moved into its entry; the recommendation list retains ordered slug references. The upstream English Podcast/Rotary covers and their matching alt text/demo notes are preserved. Presentation introductions for both new entries and their new demo notes are translated into the three non-English site locales; author submissions remain unchanged.

After integration, lint (one existing logo warning), independent type checking, all 47 tests, the full 109-artifact build, the final 842-page static rebuild against committed source artifacts, four-locale phase-one checks, and all 109 Recipe compatibility checks passed. Browser rechecks confirmed the current language/focus separation, the updated English cover, named Topic return, no phone overflow, and unchanged technology row order/spacing during multi-selection. Python plus TypeScript now yields 61 results because both incoming entries include Python. Unrelated upstream README refreshes remain excluded.

## AI-Assisted Contribution Journey — 2026-10-28

The earlier site linked directly to GitHub contribution instructions. The first
phase-one page added form/PR handoffs but gave contributors little help preparing
materials. The page now provides one preparation flow:

- A copyable English prompt asks Codex, Cursor, or Claude Code to read the project's
  README and confirmed public material links, prepare an Issue draft for review,
  and provide a GitHub draft link. It preserves author files, URLs, and credit;
  it does not edit files or publish anything. The site calls no model service.
- A material checklist makes the minimum submission clear: a name/introduction,
  public author credit, and at least one Demo/video/source/guide link. The review,
  catalog preparation, and post-release link steps are visible on the page.
- The GitHub form remains available as a direct action. A regular Issue draft
  recovery link uses the same English fields and does not depend on the form
  template having reached the default branch. PR contributors retain their
  staging-based workflow in a secondary disclosure.
- Topic association is optional and can be changed or cleared. Topic actions and
  shared header/footer links carry the explicit Topic; a detail opened from a
  validated Topic source inherits it. Legacy quick filters and direct detail
  visits do not guess association. The same selected Topic drives the prompt,
  GitHub form, and recovery draft; refresh and website-language changes retain it.
- Return navigation uses the existing validated returnTo separately from the
  selected association. A contribution reached from Topic A can target Topic B
  while Back still returns to A's exact filtered list. Topic action links retain
  filters and a scoped scroll snapshot through the existing URL/position helpers.
- Ordinary controls retain regular weight 400 and 46px phone targets. Existing
  solid forms, full Liquid Glass menus, saved dark/light appearance, and source
  author documents remain unchanged. English draft output does not require
  translated README files or duplicate catalog entries.
- The seven existing event families remain. Successful submission-prompt copies
  use content_copy; the regular-Issue recovery adds the bounded github_issue
  action to contribution_open. No draft, copied text, source query, or account
  identity enters analytics, and a handoff never claims a successful submission.

Verification: lint (one pre-existing logo warning), independent TypeScript,
52 tests, the 109-artifact recipe build and 842-page final static build passed.
Four-locale phase-one and all 109 Recipe compatibility checks passed. Browser
journeys covered Topic → filtered detail → contribution, actual clipboard
content, association changes/clearing, independent source returns, refresh,
language changes, recovery/PR disclosures, dark/light, 320px/390px phones, and a
768px tablet with long Japanese labels. No horizontal overflow was found.
The design scan reported only the existing neutral Markdown blockquote border.
No real test submission, external post, new backend, provider, dependency,
permission change, or production deployment was made. The live form/reviewer and
production Analytics release gates below remain open.

## Earlier Vercel Analytics Audit — 2026-10-28

The authenticated Vercel project lookup confirmed:

- Team: `agora-gdxe` (Enterprise).
- Project: `v0-voice-ai-recipes`, linked to `AgoraIO-Community/agora-recipes`; production branch `main`.
- Existing production deployment is ready. Its stable alias is `v0-voice-ai-recipes.vercel.app`.
- Project metadata contains a Web Analytics ID. This alone does not prove collection.
- The account's `vercel.analytics` metrics schema exposes both `page_view.count` and `event.count`.

Read-only queries against the existing project:

```bash
vercel metrics schema vercel.analytics --scope agora-gdxe
vercel metrics vercel.analytics.page_view.count --since 7d --granularity 1d --project v0-voice-ai-recipes --prod --scope agora-gdxe
vercel metrics vercel.analytics.page_view.count --since 30d --group-by environment --group-by requestHostname --project v0-voice-ai-recipes --scope agora-gdxe
```

Both page-view queries returned **No data found for this period**. The 30-day query covered 2026-09-28 through the audit time on 2026-10-28 (UTC), across environments. The final 7-day recheck (2026-10-21 04:00 through 2026-10-28 08:00 UTC) also returned no data. Collection is therefore **not verified healthy**. Keep T5 open until the production release has confirmed page views in the existing dashboard or metrics API. Do not describe the installed SDK or Analytics ID as proof of traffic.

The existing Enterprise plan supports custom events according to [Vercel's documentation](https://vercel.com/docs/analytics/custom-events), and the account exposes their metric. The seven event families are implemented and their guards, payloads, and redaction passed local tests. No synthetic production event was sent. Actual event ingestion remains unverified and keeps T9 release acceptance open.

The implementation retains the original `NODE_ENV === "production" && VERCEL === "1"` checks and additionally requires `VERCEL_ENV === "production"` for both page views and custom events. Local development, local production builds, and Vercel preview deployments do not inject Analytics. That earlier audit changed no hosting settings. The later, explicitly requested PostHog integration below adds only its public production environment values.

## Contribution SOP and PostHog — 2026-10-28

- The native Issue form, regular-Issue recovery, optional AI prompt, direct PR
  template, and CONTRIBUTING SOP now use the same material/credit/Topic fields.
  Issues/PRs use English summaries; author materials and older submissions remain
  intact. There is no mandatory Issue before a direct PR.
- Only ended activities collapse under “Ended activities” in the contribution
  selector. The group expands within the same menu on desktop and phone. A
  preselected ended activity remains visible with its status and checked option.
- Builds no longer ignore TypeScript failures. A pinned, read-only GitHub Actions
  workflow verifies staging PRs without deployment or secrets.
- PostHog SDK 1.439.0 is lazy loaded only in real production. The verified public
  project token/ingestion host are configured in the existing Vercel project's
  Production environment. No production deployment or permission change was made.
- The seven native insights in [Recipes usage and Topic engagement](https://us.posthog.com/project/693535/dashboard/2270627)
  cover entry views/use, use types, Topic audience/engagement, contribution handoffs,
  and activity destinations. All returned **no data** at setup; no synthetic event
  was sent to production. Full metric definitions and remaining release checks
  are in [analytics.md](analytics.md).
- New tests cover ended-activity classification, independent selected/source Topic
  attribution, real use versus preparation, and the SDK payload boundary. A temporary
  browser harness bundled the actual SDK with a fake token and local-only collector:
  page-view/use/preparation events arrived, Topic A/B attribution was distinct,
  query/clipboard/profile fields were removed, and anonymous transport fields remained.
  No test event reached the production project.

## Featured content and English review evidence — 2026-10-28

The editorial recommendation list now starts with Agora Podcasts, Meeting Copilot,
Rotary Dial Phone, the existing English Draw & Guess, MatchCast, and Arena. StickS3,
WorldCupVoice, and React Live Video complete the nine recommendations. Aria remains
in the complete catalog with its existing URL and materials.

MatchCast now exposes the author's 42-second English recording, a compact frame
from that recording, and its public viewer preview. The preview needs an active
broadcaster; the recorded example is available without starting a live session.
The cover is below 150 KB and cites the original recording. Arena's hosted preview
requires a playtest password, so it does not gain an unrestricted Demo action.
The separate, newer Chinese Draw & Guess does not replace the submitted English
project or its source URLs.

Recommendation order is editorial, based on usable materials, clear setup, and
variety. It is not a traffic ranking. Current PR #77 and Issue #78 review screenshots
use the English interface; original author materials and localized pages remain intact.

## iRTE2026 and live guide search — 2026-10-28

- Incorporated the original Dumpling Booth contribution from PR #76 into #77.
  Its source repository, submitted guide URL, and author remain intact. Added an
  attributed English rehearsal cover and four-locale introductions. The normal
  builder confirmed its English/Simplified Chinese guide relationship.
- `/topics/irte2026` is an explicit activity archive for the official October
  23–24 conference, linked to the conference website and agenda. The owner
  confirmed Dumpling Booth's membership. Other entries are not inferred from tags
  or repository names. Content cards still carry no Topic badges or links.
- Search updates after 250 ms of idle input. Enter flushes the draft and Clear
  acts immediately. IME composition stays local until committed; URL navigation
  cancels stale drafts. Query updates do not restore an old scroll snapshot while
  the input is focused. Facets and Topic scopes remain in force.
- A build-time static `/search-index.json` contains plain text from available
  original guides and confirmed author versions. It loads once on search intent,
  separately from the catalog's initial payload. There is no search backend,
  hosted index, or runtime GitHub request. The client caches normalized fields.
- Matching covers titles, descriptions, authors, technology/capability metadata,
  editorial media text, four-locale introductions, Topic names, and guide text.
  Prefixes, common synonyms, CJK segmentation, and bounded metadata typo tolerance
  broaden discovery. Exact phrases and titles rank above weak document matches.
  Guide-only matches include a source excerpt. Missing index requests time out,
  retain metadata search, and expose retry. Queries/copy text stay out of analytics.
- Browser verification covered automatic search without Enter, full-guide-only
  results, Chinese queries, a blocked-index fallback and successful retry, and
  Topic/detail/back context. Simulated composition events held unfinished input
  until completion; native OS IME and physical devices remain unverified. At
  390px, a sole compact result spans the 358px content row for a readable excerpt;
  multi-result browsing retains two columns.
- Source text is searchable as included in this build; private repositories,
  unconfigured documents, and implementation files outside the guides are not indexed.
  Original author submissions and documents are not rewritten.

## Release Dependencies

1. Review the consolidated changes in PR #77 and integrate that PR through `staging` when the agreed scope and release acceptance are ready.
2. The fork preview check reports **Authorization required to deploy**. An Agora GDXE team member must authorize the preview; local implementation does not change hosting permissions.
3. Release the Issue template to the repository's default branch through the normal process. Before that release, GitHub cannot render the new form from the site's link. Verify the live form without posting a test submission.
4. Deploy through the existing production process. Verify locale URLs, real PostHog page views/actions, Topic attribution, and the existing Vercel collection. Use [the production acceptance procedure](analytics.md#release-verification). Keep T5/T9 open until actual ingestion is verified.
5. Assign maintainers for public submission review, translation review, recommendations, and future Topic content. Presently translated introductions should receive editorial review before release.

No production deployment, merge to staging/main, analytics activation, plan change, or public submission is performed by the local implementation checks. Production collection health and actual custom-event ingestion remain release gates; locally verified payloads are not dashboard ingestion evidence.
