# Responsive review — 2026-11-04

Verified against the production build served with `npm run start -- --port 3118`.
The browser checks use Chromium viewport emulation and UI interactions. They do
not establish physical-device behavior in iOS Safari or Android Chrome.

## Reproduced and fixed

| Problem | Before | After |
| --- | --- | --- |
| Narrow catalog toolbar | At a 320px viewport, Portuguese overflowed by 6px and Japanese by 24px. With three active filters, Portuguese overflowed by 37px and the count/action ran outside the page. | The phone Filters action uses a 46px icon target with its accessible name and active-count badge. Categories remain visible; the page stays within its viewport. |
| Translated activity actions | At 320px, iRTE2026 action labels extended 9–14px beyond their buttons and overlapped neighboring content. | Action labels have a shrinkable text span, wrapping, and a usable flex basis. Buttons grow vertically and reflow before becoming too narrow. |
| Dialog breakpoint | From 640px, instance `sm:max-w-*` classes overrode the default width limit. A 667px dialog occupied all 667px; a 768px dialog also touched both edges. | Dialog width itself reserves 32px. Both sides retain at least 16px of clearance while instance maximum widths still apply. |

The earlier changes in this PR also remove the filter introduction, reduce the
phone heading from 112px to 64px, combine sorting and view controls, wrap footer
actions, and constrain the refinement body to vertical scrolling.

## Coverage

All 516 recorded combinations passed the relevant viewport, horizontal-overflow,
button-clipping, and panel-bound checks. This is a coverage matrix, not every
possible combination of content, locale, theme, and device.

| Surface | Coverage | Cases |
| --- | --- | ---: |
| Page families | Seven locales at 320×568 and 901×800: home, Topics index, all five Topics, contribution form, two representative recipe pages, translated guide, and 404 | 168 |
| Every recipe | All 111 English recipe detail pages at 320×568 and 901×800 | 222 |
| Breakpoints | All seven locales; home and open refinement sheet at 320, 360, 390, 640, 641, 767, 768, 900, 901, 1024, 1280, and 1440px widths | 84 |
| Floating surfaces | Portuguese navigation, language menu, help dialog, video dialog, prompt setup, sharing menu, and document-language menu; light and dark at 320×568, 667×375, and 768×600 | 42 |

Additional interaction checks:

- Desktop header brand, navigation, and actions do not overlap at 901, 1024,
  1100, or 1280px in any of the seven locales.
- At 320px, Most popular sorting and explicit List selection survive Python and
  TypeScript multi-select. The refinement body has `scrollLeft: 0`, its footer
  fits, and closing retains the URL state. Clearing filters restores 111 results
  while retaining the selected sort/view.
- Native browser scrolling docks the same Chinese search input without losing
  its `voice` draft or overflowing the header at 320px.
- Menus and short-screen dialogs remain within the viewport; longer contents
  scroll inside the panel. Dialogs keep their horizontal clearance.
- Theme emulation was cleared and the temporary viewport override was reset
  after verification.

## Icon action consolidation

Related actions now use named icon controls and compact groups: recipe prompt,
Demo/GitHub/sharing, card media links, video actions, and reader format, language,
copy, and source. Reader tools form one compact row; phone sort/view controls sit
beside the filter heading. Recommendation criteria and the star-snapshot date
remain available in the sort menu. Menus retain full option labels.

After consolidation, another 265 production-build combinations passed:

- 112 home, refinement, and representative reader cases: all seven locales at
  320, 390, 768, and 1280px. Reader controls align on one row; phone icon targets
  are at least 46px, with no page/panel overflow or clipped controls.
- All 111 English recipe details at 320px.
- 42 light/dark menu and dialog cases using the portrait, landscape, and tablet
  sizes above.

Guide/Markdown selection has distinct selected styling in both themes, and
switches the visible panel. The Markdown copy icon reaches its success state
and updates its accessible name. Sort and source menus keep their full options,
including the dated GitHub-star explanation. Opening refinement focuses its
heading without automatically showing a tooltip; keyboard Tab reaches sorting.
Existing reader tests assert the accessible action names instead of requiring
visible copy/source text.

## Repository checks

- `npm run lint` — passes; existing Agora logo `<img>` warning only.
- `npm run build` — passes, including TypeScript and 1,520 static pages.
- `node --test scripts/*.test.mjs` — 87 pass, 0 fail; run after the build so
  generated artifacts are stable while tests read them.

Changes are submitted to staging through PR #93. Production promotion remains
subject to the requested maintainer review.
