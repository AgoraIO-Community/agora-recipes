# Compact recipe showcase QA

Scope: refinement of the #68/#70 integration. The owner clarified that the site
header must remain while the introduction and animation are removed. On
2026-10-22 the owner approved committing, pushing, updating draft PR #70 with
desktop/mobile evidence, and generating a Vercel preview. Keep the PR draft;
do not merge it. No new demo service.

## Current design

The Agora site header and full navigation are restored on the homepage, including
its mobile menu. Search follows immediately; the introduction and ambient
animation remain removed. The original lightweight showcase treatment uses
rounded media with short text below, without filled media-card boxes. Search,
selected filters, sorting, preview corners and continuation share12px corners;
metadata labels use quiet4px corners. Glass remains limited to controls.
Website fonts, palette, system appearance, detail reader, all81recipes and
existing demo behavior remain intact.

## Verification

`npm run lint` passes with the existing logo `<img>` warning. Independent
`pnpm exec tsc --noEmit --incremental false` passes. All 19 markdown, discovery,
and metadata-loader tests pass. `npm run build` refreshes all 81 recipe artifacts
and generates all 85 static pages. Generated document/timestamp churn is excluded.

Browser checks cover both system themes, 320px/390px/768px and desktop widths,
with no document-level horizontal overflow. The restored header is63px tall on desktop; search begins at y80 and the first
card at y257 in the previous header-restoration pass. The 2026-10-22 mobile
refinement keeps the59px header and brings the first card from y281 to y217
at390px. The third row starts at y700.72, so all six thumbnails and titles
appear within the844px emulated viewport. Sorting and Has a demo now live
at the top of the inline Filters panel. Default result statistics are visually
hidden on phones, then appear after a query, filter, or sort change. Only the
site header stays fixed on phones; at scrollY811 the search bar is offscreen
while the header remains at y0. The mobile menu still opens correctly.
At320px no horizontal overflow was observed.

Multi-select iOS/Python plus `pyhton CRM` returns Aria. Empty search recovery,
secondary platform selection (React via More), and native video opening/closing
were exercised. Closing video unmounts playback and returns trigger focus.
Shared dialog layers remain above the sticky search bar. Homepage has no canvas
or particle renderer. Appearance simulation is cleared before leaving preview.

Evidence is under `.impeccable/review/header-glass/`: desktop and phone themes,
320px narrow, 768px tablet, video viewport, and actual light-theme footer viewport.
The IAB page-clip API sometimes renders an invalid narrow strip under emulation;
first-screen crops use the valid full-page captures. Emulated full-page captures
can also omit offscreen footer layers, so natural desktop viewport/actual scrolled
footer captures supply the readable light-theme footer evidence.

The latest phone evidence is under `.impeccable/review/mobile-compact/`:
390px light/dark and320px captures, with844px first-screen crops from the
full-page screenshots. This pass rechecked platform OR selection, CRM description
search, demo filtering, sorting persistence, clearing, and navigation. Lint,
independent TypeScript checking, and the full81-recipe/85-page build passed.
These are Chromium emulation and mouse/keyboard interaction checks; physical
iOS/Android touch, browser chrome, and WebKit were not tested.

Media sources remain recorded in thumbnail sidecars, the author manifest, and
embedded attribution. Glass source and host adaptations are documented in
`components/agent-ui/README.md`; font provenance is in `public/font/README.md`.
Full voice/camera sessions and physical-device WebKit rendering were not retested.
