# Phase One P0 Verification and Release Notes

Baseline: PR #77 at `bd67fdf1c5acdbbfd015fb8f65b109a3c11eb2d9`.
Tracking issue: [#78](https://github.com/AgoraIO-Community/agora-recipes/issues/78).

## Delivered Behavior

- One catalog and one stable detail identity for each entry. Materials are optional individually; at least one Demo, video, source, or guide is required.
- Media belongs to entry metadata. `content/showcase.json` owns recommendation order only.
- Material filters combine with AND. Platform choices retain OR. Legacy `?topic=` quick filters retain their existing meaning. Content cards have no curated Topic membership.
- Detail links carry validated catalog `returnTo` context. Refresh and new tabs retain it. Scroll snapshots are scoped to the full source-list address; links without context use the catalog fallback. Curated Topic return targets will be added with the actual P1 routes.
- Static site locales: English at existing URLs, plus `zh-Hans`, `zh-Hant`, and `ja`. Editorial introductions are separate from original author metadata and guide documents. Future missing translations fall back to original metadata.
- GitHub contribution instructions and an English Issue form, with direct PRs still targeting `staging`. No new site accounts or business backend.

P1 remains separate: curated Topic pages and navigation, author README language-version selection, sharing controls, and the seven custom event families in #78.

## Local Verification

- `npm run lint`: passed, with the pre-existing `components/agora-logo.tsx` image warning.
- `npm run build`: passed; generated 107 artifacts and static locale pages.
- `npx tsc --noEmit`: passed independently of Next's existing build setting.
- `node --test scripts/*.test.mjs`: 31 passed. Coverage includes optional materials, build-time guide fetching, original-document preservation, missing presentation translations, material filter combinations, URL state, and rejected return targets.
- `node scripts/check-llm-discovery.mjs http://localhost:4180`: passed for all 107 existing guides, including Markdown, canonical URLs, sitemap coverage, and missing-slug responses.
- Browser checks covered all four site locales, 320px/390px phones, 768px tablet, and desktop. Phone browsing stayed in two columns without horizontal overflow; the phone filter sheet stayed within the viewport.
- Checked combined search, platform selections, and material filters; refresh and explicit return links retained state. A new-tab link retained its return address. A local catalog return restored a nonzero scroll position. Theme choice survived reload and locale navigation.
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

Both page-view queries returned **No data found for this period**. The 30-day query covered 2026-09-28 through the audit time on 2026-10-28 (UTC), across environments. Collection is therefore **not verified healthy**. Keep T5 open until the production release has confirmed page views in the existing dashboard or metrics API. Do not describe the installed SDK or Analytics ID as proof of traffic.

The existing Enterprise plan supports custom events according to [Vercel's documentation](https://vercel.com/docs/analytics/custom-events), and the account exposes their metric. No custom event has been sent or verified by this P0 change. T9 must verify event ingestion when those actions are implemented.

The production-only condition remains `NODE_ENV === "production" && VERCEL === "1"`. Local development and local production previews do not inject Analytics. No provider, project, billing, or hosting settings were changed.

## Release Dependencies

1. Review and integrate the PR #77 baseline and this P0 change through `staging`.
2. Release the Issue template to the repository's default branch through the normal process. Before that release, GitHub cannot render the new form from the site's link. Verify the live form without posting a test submission.
3. Deploy through the existing production process. Verify locale URLs and confirm real page views in the existing Analytics project. Investigate the no-data result before marking T5 complete.
4. Assign maintainers for public submission review, translation review, recommendations, and future Topic content. Presently translated introductions should receive editorial review before release.

No deployment, merge, analytics activation, plan change, or public submission is performed by the local implementation checks.
