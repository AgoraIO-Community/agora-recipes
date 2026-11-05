# UI consistency review — 2026-11-05

The review covers the shared header, footer, catalog, refinement sheet, recipe
reader, Topic pages, contribution flow, sharing, and video dialogs.

| Finding | Result |
| --- | --- |
| Docked search and sticky toolbar exposed the same filter action | Desktop keeps the toolbar entry. Phone search takes over as that entry passes behind the header; both controls switch visibility together. Dismissal restores the invoking control without scrolling. |
| Compact header added a GitHub shortcut beside the navigation menu | GitHub has one entry in compact navigation. |
| Tablet navigation repeated the visible Get started button | The panel shows Get started only at phone widths, when the header button is hidden. |
| Sheet view/sort controls reversed the desktop order | View precedes sort in both layouts; close stays last. Header text actions precede language/menu utilities. |
| Recipe and Topic sharing used different control groups | Both use one Share menu containing Copy link. |
| List rows repeated the detail link as a separate arrow button | The title and summary form one detail link; material actions retain their own destinations. |
| Cover clicks did not open an available Demo | Covers open Demo when provided, with details as fallback. Titles always open details; the independent play control opens video. The footer retains Try demo. |
| Recipe metadata repeated author and difficulty beside the guide | Author, difficulty, and update date appear together in the hero. |
| Video material actions used a different sequence | Available actions follow Demo, Guide, Source order. |
| Header/footer product lettering differed by interface language | Both use the same fixed `recipes` wordmark in locally hosted Outfit regular. The SIL Open Font License notice is bundled with the font. |

The shared kit now normalizes buttons, toggles, connected reader modes, selects,
fields, cards, dialogs, menus, and recovery states. Ordinary controls use 32px
outer geometry on desktop, 13px regular labels, 16px icons, and 6px corners.
Phone and coarse-pointer actions use at least 46px targets. Selected controls
use a neutral fill and fine border. Docked search matches adjacent action height;
toggle groups have no padded tray or raised selection shadow. Card Demo links
use a visible text label without a decorative arrow. Phone playback targets are
bounded to 46px so they do not cover most of a two-column card preview.

The component composition rules and wordmark specifications are recorded in
`DESIGN.md`. Font provenance and license details are in `public/font/README.md`.
Copy actions remain scoped to their prompt, Markdown document, or code block;
repository links and guide-file links keep distinct destinations and names.

## Durable component contract

- `DESIGN.md` owns role, material, geometry, composition, and motion decisions.
- `components/design-system/README.md` documents shared integration.
- `components/design-system/component-kit.mjs` registers supported primitives.
- ESLint blocks direct interaction-library imports, unregistered UI templates,
  and native feature controls outside the explicit media/checklist exceptions.
  Alias and relative imports were both checked with rejected stdin examples.
- `AGENTS.md` requires the shared contract and visual checks for future UI work.
- The development-only `/design-system` route renders real primitives and state
  examples. Production returns 404. New shared variants need a reference case.

## Verification

- `npm run lint`: passed with the existing Agora logo image warning.
- `npm run build`: passed, including TypeScript and 1,521 static pages.
- `node --test scripts/*.test.mjs`: 87 passed.
- Phase-one and LLM-discovery checks: passed, covering seven locales and 111 entries.
- Catalog and sheet geometry: seven locales at 320, 390, 768, 900, 901, and
  1280px, totaling 84 states.
- Six page families across seven locales at 320, 768, and 1280px: 126 states.
- All 111 English recipe details at 320px; vertical control bounds and touch
  heights were also checked.
- Representative dark appearances: 24 states across English and Portuguese,
  four page families, and 390, 768, and 1280px.
- Expanded surfaces and reader modes: 58 states across language/navigation/sort
  menus, video/help dialogs, Share, source menus, prompt popovers, and Markdown.
- Shared reference states include selected, disabled, busy, invalid, long labels,
  recovery, keyboard reader selection, and light/dark with reduced motion.
  Real copying retained its measured 157.02px width through success; dialog
  Escape restored the invoking button. Physical touch hardware was not used.
- Coarse-pointer emulation verified 46×46px reader actions and aligned sheet
  headings at tablet/desktop widths. Narrow menu and reset actions are at least
  46px. Long select menus remain bounded within a 320px viewport.

Geometry probes checked page overflow, control clipping, target dimensions,
and floating surface bounds. Representative screenshots were inspected; the
route matrix is not a pixel-by-pixel review of every source document. Browser
checks used Chromium. Local captures, measurements, and the source-hashed
receipt accompany this review outside application assets.

## Card action follow-up

The cover opens an available live Demo, with details as fallback. The title
always opens details, and the separate play control opens the video dialog.
Try demo remains explicit in the footer, shortened to Demo on phones. Phone
playback targets measure 46×46px and leave the rest of the cover clickable.
The existing Agora palette, fonts, and light/dark materials are retained.

The cover and footer links were clicked and opened the expected Demo page;
video opened an embedded player and the title reached the recipe route.
Availability, destinations, and layout passed 70 rendered grid/list states
across seven locales and 320, 390, 768, 901, and 1280px widths. These checks
compared the rendered actions against the entry metadata. External Demo calls
and credentials were not exercised.

## Forms and floating panels

Single-line Input, InputGroup, and Select now share the navigation's 32px
outer geometry instead of mixed 40/44px defaults. Phone and coarse-pointer
fields use 46px targets and 16px entry text. Labels, helper text, invalid and
disabled states use the same scale; the reference form grid aligns paired rows.

Dialog, Sheet, and form Popover share header/body/footer slots. Close controls
sit in header flow. Only the opaque body scrolls; no nested reading card or code
scroller is required. Desktop drawers use a 384px frame with 12px clearance;
phone sheets remain bounded with safe-area actions. Titles are 16px, descriptions
13px, and the form body uses the existing theme canvas. The three-channel
optical engine remains on floating frames. The page palette and typography
remain in the Agora family.

ESLint rejects panel padding/scroll utility overrides in feature code. The
shared slots, geometry, and extension rules are recorded in DESIGN.md and
AGENTS.md. Long select menus no longer repeat the trigger minimum width inside
the padded viewport. Invalid fields retain their error border while hovered.

Verification covered 60 geometry states: seven-language phone/desktop drawers
and sorting, video/help/prompt panels in English, Portuguese, Japanese and
Chinese, reference forms across four widths, long values, coarse-pointer
layouts, short screens, and dark appearance. Settled measurements use reduced
motion where needed; ordinary open/close and focus return were also exercised.
The invalid border matched its error text color, and the full optical surface
retained three displacement channels. This is viewport evidence, without a
physical-device or frame-rate claim.

## Control state consistency

The connected sort and filter commands previously shared dimensions but differed
in feedback: Select changed only its edge and muted the command icon, while
Button changed its fill and reduced whole-control opacity on press. They now
share default ink, hover fill/edge, held-press fill, open feedback and the same
keyboard outline. Primary and destructive variants retain their semantic colors
through the same state tokens. Persistent selections remain separate from open
pickers and receive local hover/press feedback on their neutral underlay.
Expansion also follows `aria-expanded`, so a composed tooltip's independent
`data-state` cannot mask the open picker feedback.

The pass also aligned menu, checked-menu and submenu rows with Select options;
removed feature-specific and floating-container control state overrides; added
missing disabled-tab and textarea hover handling; and kept invalid borders above
interactive states. Disabled checkbox rows apply opacity once. Fine-pointer
hover does not become sticky touch feedback. ESLint rejects feature-level
hover/press/focus material utilities, and the live reference includes a connected
Select/Button composition plus checked and nested menu examples.

The shared reference's 37 controls were probed in default, hover, held-press and
focus states at 320, 390, 768 and 1280px in both appearances, plus coarse-pointer
tablet emulation. Product probes covered six route families at 320 and 1280px in
both appearances (24 configurations). State probes checked fixed geometry,
disabled/busy precedence and validation borders. The two reported commands also
matched their actual computed fills, edges, icon ink/stroke, dimensions and focus
outlines in both appearances.

Real interactions exercised Select changes, checkbox menu selection, nested-menu
keyboard entry, reader arrow-key selection, Escape focus return and a translated
phone refinement sheet. Representative screenshots were inspected. DevTools
pseudo-class probes and reduced-motion captures establish state styling, not
physical-device behavior or animation performance. The existing media-hover
interaction, native media controls and authored links retain their documented
roles. Unregistered, unused component templates were not promoted into the kit.

## Direction cue follow-up

Decorative arrows were removed from resource navigation, repeated Demo links,
card and Topic titles, related lists, source links and menu rows. Functional
back/top, sorting, disclosure and submenu icons remain. The main Get started
action uses an outbound cue; the footer submission invitation uses a forward
cue. Link destinations, new-tab names and the independent Demo/video/details
actions remain intact.

`ButtonArrow` owns the opt-in cue and its single 200ms exit/re-entry within a
fixed 16px clipped slot. Native capture recorded intermediate glyph transforms
and the return to idle while button and label bounds stayed fixed. Keyboard
focus also triggers it. Reduced motion uses a static glyph; coarse-pointer hover
does not animate, and a disabled cue remained static under forced hover/focus.
The local recording preserves native frame timestamps; it is not a device
frame-rate or animation-performance claim.

Eight reference width/appearance configurations verified reduced-motion and
geometry behavior. Product checks covered six route families at desktop and
phone widths in both appearances, plus Portuguese and Chinese samples. No raw
decorative directional arrows remained in repeated content. The Podcast cover
and Demo link still point to the live app, the title points to its recipe, and
the video dialog still opens a player. The updated contract is recorded in
DESIGN.md and AGENTS.md; ESLint rejects raw forward/outbound arrow imports in
feature code in favor of the explicit shared cue.

## Inner-page integration

Recipe readers, Topic pages and contribution forms still contained local control
skins after the catalog pass. Those pages now compose the shared Toolbar,
Disclosure, field picker, icon Select and icon Tab APIs. Choice groups stay on
the left and commands on the right. Native disclosures share the same 32px
desktop and 46px phone/coarse-pointer targets. Ordinary control icons use 16px
bounds and a 1.6px stroke. Reading typography retains its separate document role.

Tooltip composition now preserves the wrapped primitive's state and slot.
Connected-button edges count visible controls rather than copy-status live
regions. Prompt and CLI code use the shared embedded code plane; contribution,
diagram and authored Markdown disclosures use the same native primitive.
Recovery content uses shared Empty and Alert components. Unmatched URLs also
receive the site layout and shared recovery page instead of the framework's
unstyled fallback. The global fallback uses English when no route locale exists.

The development reference mounts the actual RecipeDocument and prompt actions.
A computed-style comparison of its four reader controls with a production
recipe matched dimensions, typography, fill, ink, border, corner geometry and
icon metrics. A new lint check rejects feature CSS that repaints or resizes
ordinary shared controls; component variants own those decisions.

Final-build checks covered six route families in 20 viewport/appearance
configurations: 1280px and 390px light, 768px dark, plus 320px dark reader and
contribution pages. All 385 inspected control instances matched their shared
role specifications, toolbar actions aligned, and pages had no horizontal
overflow. Additional checks exercised a Portuguese 320px refinement sheet,
a Chinese author document in dark appearance, and the global recovery page.

Real interactions covered reader pointer and keyboard selection, visible
tooltips without lost Tab state, copying the displayed prompt, Prompt/CLI tab
switching, Escape focus return, activity/history selection, keyboard disclosure
navigation, search draft/focus through header docking, language selection, and
the recovery link. Lint, the production build and all 88 tests passed. Browser
evidence uses Chromium viewport emulation, with representative pixels inspected;
it does not claim a physical-device test or an audit of every authored document.

## Copy and active-condition cleanup

Removed picker footnotes, filter-combination hints, repeated CLI setup text,
duplicate Topic status/source explanations, generic footer descriptions and
redundant recovery prose. Contribution preparation now has a short instruction,
an account/publication requirement and one review-status line. Extended steps
remain in the contribution guide. Six dictionaries received the concise copy
and dropped 36 unused explanatory messages. The design contract now separates
useful requirements, state and recovery from narration of obvious controls.

Non-default sorting appears beside the result count and removable refinements.
Removing it resets sorting independently; clearing filters preserves sorting.
Filter counts use a shared 16px corner badge rather than a metadata tag over
the icon. Buttons retain their square 32px desktop / 46px phone targets, and the
same badge follows the filter action when search docks in the header. The
reference covers one- and two-digit counts without changing button width.

The final build passed layout probes on six routes in 24 width/theme
configurations and 12 translated phone configurations. Representative desktop,
phone, dark, long-label, refinement-sheet and contribution captures were
inspected. Sort selection/removal, independent filter clearing and docked
filter entry were exercised. Lint, the production build and all 88 tests passed.
These are Chromium viewport checks and representative visual inspection, not
physical-device verification or an audit of every authored recipe document.
