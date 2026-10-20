# Compact catalog and Agora family QA

Scope: catalog refinement on a feature branch. No deployment, new demo services, database, or upload infrastructure.

## Requested behavior

The homepage is one catalog. All 81 recipes participate in search and filtering;
the six existing demo recommendations lead the default order. There is no RTE
collection, large feature story, or separate View all route. The remaining real
recipe titles peek through a faded native disclosure and expand inline.

Search and quick topics precede every demo. The search surface stays reachable
while scrolling. Media cards show a preview, title, short outcome, author/avatar,
and selected tags (two on desktop, one on phones). The preview plays video or
opens the existing demo; the title/summary opens the recipe and verified authors
link to GitHub. Setup notes remain in detail pages/players. Guide-only cards
retain one excerpt and platform tags. No duplicate action rows or tinted card box.

## Visual authority and implementation

The provided `agora-family-standalone.html` was opened and its actual Glass
controls inspected. Current website foundations were read from
`AgoraIO/agora-website-2026` at `902c4424d1243545366630d14bc3d9a28b1170b6`.
Original GlassSurface, Button, Input, control-light, selected source recipes,
and theme tokens come from `shczhen/agent-ui` at
`9ca9d39be0037adf34a8984b1ab3a8383df0477c`.

Website foundations supply the warm light canvas, shared black dark layers,
blue signal, and MiSans. Original Glass controls retain their geometry,
Obsidian primary action, foreground separation, refraction, pointer light,
and material fallbacks. No simulated Agent persona or session was added.
Official unmodified Latin font slices total 113,864 bytes; the full 10 MB
CJK bundle is not required by this English catalog. Attribution is retained.

Three columns on desktop and two on phones bring several demos into the first
screen. Every author comes directly from recipe metadata. Search uses one Glass
plane without a nested input border; topics have neutral selected states.
Filters use a dismissible popover with 12px collision gutters and consistent
select geometry. Recipe links do not prefetch implementation documents.

All 17 author avatar sources were checked against GitHub profiles and recipe
implementation owners. Local originals total 36,001 bytes and keep an initials
fallback. Aria and Meeting Copilot use CSS framing to exclude browser chrome
without editing their recordings. React Live Video uses a real screenshot of
the existing public entry form, framed without browser chrome. No
channel was joined and no media permission was requested.

## Verification

- Discovery tests cover the full default catalog, exact six-item recommendation
  prefix, description/card-summary search, small typos and transpositions,
  common English/Chinese aliases, exact-before-fuzzy relevance, combined
  filters, explicit sort overrides, and source asset constraints.
- Browser checks cover keyboard expansion/collapse, searching beyond the first
  six, empty-result recovery, topic + platform filtering, and external demo links.
- All six lead cards loaded local author images. Blocking a known avatar showed
  its initials; removing the block restored the image on reload. Avatar/profile
  links retain the actual recipe author, and card tag counts adapt by viewport.
- Video playback, Escape close, focus return, playback unmount, and a deliberately
  blocked-video recovery state were exercised with the adopted controls.
- Latest responsive/theme evidence is saved in `.impeccable/review/media/`.
  Checked 320px, 390px, 768px, and 1280px layouts without document-level
  horizontal overflow, plus light and dark control contrast. The mobile header
  keeps secondary links hidden while preserving 44px touch targets.
  Valid full-page captures are used for phone first-screen crops because this
  host's normal phone screenshot wrapper scales viewport captures incorrectly.
- Theme/search follow-up evidence is saved in `.impeccable/review/theme-search/`.
  The production build opens dark under an emulated light system preference.
  Mouse and keyboard switching, reload persistence, and the mobile browser theme
  color were checked. Header actions have 44px touch targets; 320px, 390px,
  768px, and 1280px layouts retain no horizontal document overflow.
  Coarse-pointer author profile links also have 44px hit areas within a compact
  24px byline row, without overlapping the recipe title/summary link.
  Description typos (`pricng objecrtions`), Chinese aliases (`语音转文字`),
  an expanded CRM phrase, and empty-result recovery were exercised in-browser.
- Lint (one existing logo image warning), independent TypeScript checking,
  all 15 markdown/discovery tests, and the full production build passed.
  The build generated all 81 recipe artifacts and 85 static pages.
- The design detector's material warning is the existing semantic markdown
  blockquote border. The old detail grid and literal type-ramp advisories are
  outside this compact homepage change; source material recipes remain intentional.

Limitations: full live voice/camera sessions, physical phone/WeChat behavior,
and non-Chromium optical rendering have not been certified. The WebKit frosted
and reduced-transparency solid paths are implemented without claiming real-device
coverage. Existing externally hosted demos can change independently.
