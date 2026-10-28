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
- The build confirms reciprocal author language navigation and the same guide/repository/ref. Six current projects expose confirmed English and Simplified Chinese documents. Optional maintainer mappings resolve ambiguity. Source aliases map to canonical script/language IDs without changing filenames or original URLs. Automatic selection uses a confirmed match, English, then the original; a manual choice takes priority. Missing manual versions show a dedicated message with no substituted reader.
- All source documents are fetched at build time. Known version routes and explicit unavailable states for supported languages are static. Selected Raw links, Markdown copying, prompts, outlines, assets, and document alternates use the selected source; the existing Recipe API and original Markdown routes remain unchanged.
- Share actions use clean localized canonical content URLs, real cover images or the locally generated `/social-card.png`, and native/X/LinkedIn handoffs. Clipboard events require success; platform handoffs do not claim publication.
- The seven event families use the existing Vercel SDK and project. Bounded public dimensions exclude search text, accounts, submissions, copied text, and destination URLs. Search is debounced, hover previews do not count as plays, and actual video plays are counted once per player opening. URL queries/hashes are removed from both page views and custom events before sending.

See CONTRIBUTING.md for Topic metadata, optional source-language mappings, contribution review, and verification commands. No dependency, lockfile, site account, business backend, or external analytics provider was added.

## Local Verification

- `npm run lint`: passed, with the pre-existing `components/agora-logo.tsx` image warning.
- `npm run build`: passed; generated 107 artifacts and 830 static pages. New Topic, guide-version, and social-image routes are static; the only dynamic routes are the existing Recipe APIs.
- `npx tsc --noEmit`: passed independently of Next's existing build setting.
- `node --test scripts/*.test.mjs`: 47 passed. Coverage includes optional materials, Topic membership/validation, reciprocal source-language discovery, current-language indicators and code-example exclusion, script-aware fallback, missing manual versions, original-document preservation, Unicode headings, material filters, URL state, production guards, event dimensions, and URL redaction.
- `node scripts/check-llm-discovery.mjs http://localhost:4181`: passed for all 107 existing guides, including Markdown, canonical URLs, sitemap coverage, and missing-slug responses.
- `node scripts/check-phase-one.mjs http://localhost:4181`: passed for all four locales, Topic membership and card restrictions, automatic/manual source language selection and unavailable states, sharing metadata, contribution paths, static social PNG, and existing API schema.
- Browser checks covered all four site locales, 320px/390px phones, 768px tablet, and desktop. Phone browsing stayed in two columns without horizontal overflow; the phone filter sheet stayed within the viewport.
- Checked combined search, platform selections, and material filters; refresh and explicit return links retained state. A new-tab link retained its return address. A local catalog return restored a nonzero scroll position. Theme choice survived reload and locale navigation.
- Final browser checks also covered 901px/1101px header breakpoints, two different Topic returns for Pillion, filtered Topic returns after refresh and in a new tab, manual author-language selection across site locales, clean clipboard share URLs, activity archive attribution, and Topic-prefilled GitHub form links. Local preview loaded no Analytics scripts.
- Temporary Demo-, source-, and video-only entries rendered without a guide or prompt. Their source/Demo actions and video player used real existing destinations. These clearly labeled fixtures were removed before the final build.
- Existing metadata values and author credit are unchanged apart from relocating the existing media fields into entry metadata. No lockfile or dependency changes. Unrelated generated-document refreshes are excluded from the commit.

Browser emulation does not verify physical devices, complete microphone/camera sessions, or third-party Demo availability for every visitor.

## Analytics Audit — 2026-10-28

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

The implementation retains the original `NODE_ENV === "production" && VERCEL === "1"` checks and additionally requires `VERCEL_ENV === "production"` for both page views and custom events. Local development, local production builds, and Vercel preview deployments do not inject Analytics. No provider, project, billing, or hosting settings were changed.

## Release Dependencies

1. Review the consolidated changes in PR #77 and integrate that PR through `staging` when the agreed scope and release acceptance are ready.
2. The fork preview check reports **Authorization required to deploy**. An Agora GDXE team member must authorize the preview; local implementation does not change hosting permissions.
3. Release the Issue template to the repository's default branch through the normal process. Before that release, GitHub cannot render the new form from the site's link. Verify the live form without posting a test submission.
4. Deploy through the existing production process. Verify locale URLs and confirm real page views and deliberate custom events in the existing Analytics project. Investigate the no-data result before marking T5 complete.
5. Assign maintainers for public submission review, translation review, recommendations, and future Topic content. Presently translated introductions should receive editorial review before release.

No production deployment, merge to staging/main, analytics activation, plan change, or public submission is performed by the local implementation checks. Production collection health and actual custom-event ingestion remain release gates; locally verified payloads are not dashboard ingestion evidence.
