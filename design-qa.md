# Recipes design integration QA

Scope: local integration of Omja's design refresh (#68, `da99e784`) and the
compact media catalog (#70, `6afa3d9`). Neither PR has been merged, closed, or
updated. No deployment, new demo service, database, or uploads.

## Visual authority

The website shell, official wordmark, MiSans Latin faces, system theme provider,
particle formations, underline filters, and detail reader come from Omja's #68.
They follow Agora Website 2026. The intro now uses content-sized spacing so
search, visible platform filters, and real demos appear early on QR visits.
The previous Glass adaptation and duplicate font slices are retired; the current
header and sticky controls retain the website's restrained backdrop treatment.
Renderer and font provenance remain in `lib/website-hero/README.md` and
`public/font/README.md`.

The six agreed recommendations, real thumbnails, short summaries, verified local
author avatars, selected tags, onsite videos, and faded inline continuation are
retained from #70. No replacement screenshots or demo scenes were invented.
Aria leads; the Chinese rotary phone demo is third. Thumbnail sidecars and the author source manifest are retained. Original source
attribution is also embedded in all 23 shipping rasters; the 18 metadata-only
updates preserve identical decoded image pixels.

## Behavior

- All 81 recipes remain in one catalog. The first six lead the default sort;
  native inline expansion exposes the remaining 75. Search and filtering cover
  the whole catalog even while the disclosure is closed.
- Search spans titles, descriptions, summaries, authors, and metadata, with
  common English/Chinese aliases and bounded typo tolerance. Browser search
  `pyhton CRM` returns Aria. Exact matches rank above approximate ones.
- Platform filters are visible and support multiple selections with OR.
  Use cases use OR; selected capabilities must all match. Additional platform
  labels remain in More. The Has a demo filter and explicit sorts are retained.
- Any recipe can now provide optional `demoUrl` in its own metadata, independently
  of recommendation order. The five existing verified links were moved there.
  HTTPS web links and TestFlight links are supported; malformed links, unsafe
  schemes, credentials, empty values, and wrong types are rejected.
- Appearance follows the system in both themes, including live changes. There
  is no theme selector and no read of saved manual theme preferences.
- Videos open onsite with native controls, original-video recovery link, recipe
  link, and optional live-demo action. Podcasts loaded with readyState 4 and
  duration 146.59s. Closing unmounts playback and returns focus to its trigger. Shared dialog
  overlay/content layers are 100/110 above header80 and catalog60. Actual
  viewport captures verify video and footer-help dialogs while scrolled, with
  reachable close controls and focus returned to each trigger.
- The detail reader retains rendered/raw tabs, syntax highlighting, copy
  actions, recipe prompt, CLI instructions, related entries, and attribution.
  Aria's Demo link and Raw tab were verified in the production build.

## Verification

`npm run lint` passes with one existing logo `<img>` warning.
`pnpm exec tsc --noEmit --incremental false` passes independently of Next's
build configuration. All 19 markdown, discovery, and metadata-loader tests pass.
`npm run build` fetches all 81 artifacts and generates all 85 static pages.
Generated timestamps and fetched-document churn are excluded from this change.

Production screenshots are saved locally in `.impeccable/review/integration/`:
1440px desktop in both themes, 390px mobile in both themes, 320px narrow mobile,
768px tablet, video dialog, and detail reader. No horizontal document overflow
was observed at these widths. At 390px the first card begins at y=363.66 and
its title at y=470.97; at 320px the first title begins at y=451.28. Search and
filter targets retain 46px height. The animation has pause and reduced-motion
support. Browser emulation was cleared before leaving the preview open. The finish
reviewer scored the dialog-layering fix resolved, with no direct regressions.

Full live voice/camera sessions, physical phone/WeChat behavior, and real-device
WebKit rendering have not been verified. Existing external demos can change
independently. This preview uses the production build at `127.0.0.1:3004`.
