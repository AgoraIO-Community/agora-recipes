# Agora Recipes design guide

Recipes is a compact catalog, dark by default, for finding working Voice AI and RTC projects,
trying their demos, and following their implementation guides. Keep the interface
in the Agora website family: official cyan wordmark, local MiSans typography,
quiet charcoal controls, and real project media.

## System ownership

This guide defines the visual and interaction rules for Recipes. Shared tokens
and components apply across the catalog, filters, recipe pages, and navigation.

- `app/globals.css` owns page layout, typography, and reading styles.
- `components/agent-ui/controls.css` owns solid control materials, sizes, and states.
- `components/agent-ui/glass.css` and `glass-surface.tsx` own floating Liquid Glass.
- `components/ui/` provides the shared interactive primitives.
- Recipe metadata and existing media remain the source of titles, authors,
  platforms, durations, and demo availability.

Extend these patterns rather than adding page-specific button, input, tab, or
select skins. Design proposals and temporary review captures do not belong in
application assets unless the interface actually uses them.

## Color and material

First visits use dark, regardless of the system setting. The header toggle
switches between dark and light and saves an explicit choice in `recipes:theme`.
Apply a saved choice before paint on every route. Theme changes keep the same
layout, typography, imagery, and component geometry.

The theme covers the catalog, filters, reading, dialogs, native browser surfaces,
syntax highlighting, and diagrams. Storage failures leave the toggle usable for
the current page. Tabs from the same origin synchronize explicit changes.

| Role | Dark (default) | Light | Usage |
| --- | --- | --- | --- |
| Canvas | `#000000` | `#f8f9fb` | Page background |
| Secondary | `#101010` | `#f0f2f5` | Footer and recessed areas |
| Surface | `#121212` | `#ffffff` | Project tiles and panels |
| Raised / muted | `#1a1a1a` | `#e9edf2` | Hover and quiet metadata surfaces |
| Text | `#fcf9f8` | `#20252b` | Main text |
| Secondary text | `#b3b3b3` | `#59636d` | Descriptions, metadata, secondary links |
| Border | `#292929` | `#d9dee4` | Structural seams and panel edges |
| Input edge | `#484848` | `#89949f` | Fields and brand separator |
| Agora cyan | `#00c2ff` | `#00c2ff` | Official wordmark and brand signal |
| Link text | `#00c2ff` | `#006c93` | Readable links on each canvas |
| Focus | `#a0faff` | `#007da8` | Keyboard outline |
| Error | `#ff7b7b` | `#b42335` | Failure feedback |

Use the two materials by role:

| Role | Material | Treatment |
| --- | --- | --- |
| Buttons, inputs, search, filter items, toggles, copy | Solid controls | Solid fills, clear edges, independent text |
| Guide / Markdown tabs | Underline tabs | Cyan current indicator, no surrounding tray |
| Cards, reading, code, filter form body | Solid | Opaque, stable reading contrast |
| Sticky header and topic toolbar | Solid | Theme canvas with a structural seam |
| Video play control, demo action over media | Liquid Glass | Full refraction over the actual image |
| Navigation, select menu, modal, bounded filter sheet | Liquid Glass | Full refraction with solid controls inside |

Primary buttons use foreground fill and opposite canvas ink: warm white in dark,
charcoal in light. Hover uses the theme's readable Agora signal color. Secondary
actions use a bordered neutral fill; quiet actions gain that fill on hover.
Selected toggle underlays use a neutral raised surface. Media metadata labels
use solid dark fill and light text.

Liquid Glass means the complete geometry-sized SVG displacement map, separate
red/green/blue refraction, edge highlights, transmission, and elevation. Reuse
`GlassSurface material="liquid"`; a translucent blur-only shell is not an
alternative material. Keep the optical and highlight layers behind foreground
content. Forms and long instructions inside floating surfaces have an opaque
reading plane. Do not add glass to ordinary controls or reading surfaces.

Move glass surfaces during entry and exit; fade the separate modal backdrop.
Animating opacity or filter on a glass ancestor can stop the browser from sampling
the page behind it. Do not leave animation fill or `will-change: opacity` on
these surfaces. Reduced transparency, forced colors, and unsupported filtering
use opaque accessibility fallbacks. Reduced motion removes spatial feedback.

## Typography and geometry

MiSans Latin is bundled locally at weights 380 and 520, matching the Agora
website. Use the regular face at CSS weight 400 for interface text, including
titles, navigation, buttons, and cards. Use size and spacing for hierarchy;
reserve semibold for emphasis inside authored reading content. Do not reintroduce
semibold interface labels when adding controls.
Monospace is reserved for code and commands.

| Element | Desktop | Phone |
| --- | --- | --- |
| Catalog title | 40px, weight 400, line height 1.1 | 30px |
| Recipe title | 44px maximum | 30px |
| Showcase title | 18px, weight 400 | 15px |
| Body / guide | 16px, line height 1.7 | 16px |
| Description / metadata | 12–15px by role | 12–15px |
| Footer invitation | 28px, weight 400 | 24px |

Use the 4px spacing rhythm: 8–12px inside small groups, 16–24px between related
parts, and 28–40px between sections. Compactness comes from grouping and
progressive disclosure. Preserve readable text and distinct section spacing.

Controls have 6px corners; grouped trays use 8px. Project tiles and floating
panels use 16px; phone tiles and select menus use 12px. Media actions use 10px.
Metadata chips use 4px. Desktop control heights are 32/36/44px; phone and
coarse-pointer actions retain at least 46px targets. Search is 48px.

All pages share one shell, at most 1504px including gutters. Header, catalog,
recipe overview, guide layout, and footer use the same outer edges. Gutters scale
up to 60px and become 16px at 640px. Keep prose constrained inside the reading
column rather than narrowing the entire detail page.

`--page-columns` and `--page-column-gap` define the shared column grid: three
columns with 20px gaps on desktop, two with 16px gaps at 900px, and 12px horizontal
gaps at 640px. Footer resources and legal links align to these catalog column
starts. Avoid independent fractional columns or distributed spacing for them.

## Header and footer

The header has a 64px content height, becoming 60px at 640px, plus its 1px seam.
Keep that height stable across scrolling and navigation states. The official
wordmark and Recipes label share a vertical separator. Header and footer use
the same 86px wordmark and label: 15px regular on desktop, 14px on phones. Align
the visual center of the wordmark's main letter body with the Recipes text,
excluding the long g descender. The current asset needs a 7.5px optical offset,
reduced to 7px on phones. Do not align the full SVG box or only its baseline. On desktop, center the
Recipes / Topics / Docs / GitHub navigation between the brand and right-hand actions.
The smaller navigation controls use a 1px optical offset to share the brand
label's baseline. Recipes carries the collection context; Contribute is secondary
to Get started.
The header gains its seam after scrolling and retains an opaque theme canvas. Keep the
sun/moon toggle visible in the header. At 1100px, Contribute moves out of the
header action row; the footer retains its contribution link. On phones, the
toggle replaces the GitHub shortcut, which remains in the navigation panel.

At 900px the main links move into a bounded floating navigation panel. On phones,
keep the language, theme, and menu icon buttons in the header; GitHub remains in the panel. Opening navigation must
not shift page content. Use the existing Popover for outside dismissal, Escape,
and focus return. Close it on navigation and when returning to desktop width.
The phone panel shares the page's left and right gutters; tablet panels stay
bounded and align to the right gutter.

The footer has three distinct rows: a short contribution invitation, a resource
directory, and a quiet copyright/legal line. The invitation links to the existing
GitHub contribution guide. Group links under Explore and Build with Agora.
On desktop, the three resource columns follow the project grid. Their headings
share a 44px row and 20px line height with the brand label; resource links use
consistent 36px rows. The invitation action aligns to its heading baseline.

At 900px, span the brand across the footer and keep two resource columns. On
phones, also stack the invitation. Legal links use those same two column starts;
phone and coarse-pointer links retain 46px targets. Back to top is a native anchor
aligned to the shell's right edge. Do not compensate with negative margins.

## Catalog and discovery

Lead with a short centered introduction and a search field up to 610px wide.
Command/Control K focuses search. One topic/action toolbar follows; platforms,
use cases, and capabilities belong in the refinement sheet. Sorting moves into
the sheet at 900px. Show active conditions above the result count.

The toolbar sticks below the measured header on desktop and scrolls normally on
phones. Overflowing topics scroll horizontally. Single selection uses the shared
moving underlay; state must also remain explicit in control semantics.

Curated recommendations use three columns on desktop and two at 900px. Phone
cards remain in two columns. Desktop gaps are 20px; phone gaps are 12px across
and 16px down. A charcoal tile contains an inset real preview, title, concise
outcome, author, and one meaningful platform or capability label. Gallery crops
are 16:8.4; detail previews retain 16:9. Preserve the chosen crop origin. Guide
cards keep their natural height instead of stretching to fill neighboring rows.

The media opens the actual video or external live demo; the title opens the
recipe. Hover and keyboard focus may fade in the title arrow within its reserved
space. Preview images retain their crop and scale. The default play control
and its labelled hover state both remain centred within the preview. Touch
controls remain visible. Do not invent
favorites, ratings, demo links, or availability claims.

Search and explicit sorts show aligned text rows on desktop and two-column text
cards on phones. Keep actual demo actions available. Guide-only entries do not
reserve empty thumbnail space. Search covers the entire catalog, including
entries under the native inline continuation. Render continuation rows only
while expanded, keeping the initial page light as the catalog grows.

The bounded filter sheet has searchable groups, counts, and a fixed action area.
Platforms and use cases match any selected value; capabilities require all
selected values. Search, filters, sorting, and continuation state live in the
URL. Returning from a recipe restores the catalog conditions and scroll position.

## Recipe pages and reading

Lead with the outcome, technology, author, and Copy recipe prompt action. Demo
and source actions follow in priority. Use actual preview media and truthful
setup requirements. Full prompts and CLI commands remain available in native
disclosures rather than repeating the primary action in a separate pitch.

Inside the shared page shell, the desktop guide uses a 216px left contents rail
and 48px gap. Reduce these at
intermediate widths; on phones the rail follows the content and a local contents
disclosure sits near the guide. The current section uses `aria-current` and the
shared moving selection underlay. Anchors must clear the sticky header.

Guide / Markdown, Raw, and Copy share one toolbar. Preserve the fetched source
document and assets. Center source introduction wrappers within the reading
column. Exposed edge links remove extra inline padding so Back to recipes,
section navigation, and right-hand document actions follow the content edges.
Code is highlighted once with light/dark variables; CSS switches its palette
immediately. Diagrams redraw with the active shared tokens.
Prose is at most 68ch. Code and tables may use the wider column and
scroll horizontally; keep their overflow inside the reading area.

## Contribution journey

Use one preparation flow with a copyable submission prompt and a direct GitHub
form action. The prompt helps Codex, Cursor, or Claude Code read existing project
materials and prepare an English Issue draft for the contributor to review;
it does not edit author files or publish anything. Show the small material
checklist and the review-to-release steps in the page. Keep direct PR instructions
in a secondary disclosure, targeting staging. An unavailable GitHub form has a
regular Issue draft recovery link with the same fields.

Topic association is optional and explicit. Topic-page actions, shared header,
and footer links carry that Topic. A recipe reached from a validated Topic list
retains that source when contributing; a direct detail visit or legacy quick
filter does not guess an association. The contributor can change or clear the
Topic. Its URL state drives the prompt, GitHub form, recovery draft, reload, and
website-language changes. Keep the validated returnTo source independent from
the selected association: changing the Topic must not change where Back returns.
Technical tags never choose a Topic.

## Interaction and accessibility

Use the shared control timing: press 140ms, control feedback 160ms, surfaces
180–280ms. Selection underlays move for 240ms with `cubic-bezier(.16,1,.3,1)`.
Hover and keyboard focus keep every component and its contents stationary.
Cards, images, links, buttons, labels, and icons retain their
position, size, spacing, and crop. Do not translate, scale, lift, expand, or swap
arrows on hover. Reserved-space icons may fade in; feedback otherwise uses text
color, fill, border, underline, and opacity. Press feedback also keeps geometry
fixed.

Video cards have one deliberate hover interaction: a centred play icon fades
into a centred icon-and-label group inside a fixed frame. The decorative glass
backing expands equally on both sides of the preview centre. Keep each state
vertically centred; no content slides between positions. Mouse hover prepares
video metadata; playback begins
after a continuous two-second dwell, muted and inline. Keep the poster visible
until playback starts. Leaving, clicking, hiding the page, or removing the card
cancels the preview and restores the poster. Failed or blocked playback leaves
the manual video action usable. Touch and reduced-motion/data preferences use
the poster and explicit playback action. Keyboard focus may reveal the label
but never starts automatic playback.

State changes may animate when they explain an action: selection indicators,
expanded disclosures, copy confirmation, theme changes, and opening or closing
floating surfaces. These transitions start from an explicit state change rather
than pointer hover. Feedback is local, reversible, and honors reduced motion.

Copy actions reserve their text width across idle, success, and failure. The
copy icon transitions into a drawn check, with accessible status feedback.
Disclosures coordinate height and chevron changes. Glass dialogs use a small
entrance movement while the separate backdrop fades. Avoid autonomous animation and scroll interception.
Reduced motion keeps every state and action usable without spatial effects.

Ordinary controls use a 2px cyan keyboard outline with 3px offset.
Menu and select options use that outline inset by 2px so the popup cannot clip it;
selection remains a checkmark while hover and keyboard highlight identify the
current action separately. Keep native links,
buttons, video controls, and Radix semantics. Dialogs cover the header, close
with Escape, and return focus. Layer order is catalog 30, header 40, popovers and
dialogs 50, focused skip link 150. Verify desktop, tablet, and narrow phone
layouts, touch, keyboard, empty recovery, copy failures, and reduced motion when
changing these patterns.

Header language selection is an icon action with a named tooltip and a compact,
checked language menu. Keep it visible on phones. Share controls are a copy icon
and a share menu within the primary action group; do not expand platform links
into a separate toolbar. Guide-language selection belongs beside the reader
heading, with full option labels in the menu and the actual source language below.

## Interaction continuity

- Keep filter options in a stable base order while their live counts change.
  Selecting a checkbox must not move that target under the pointer or focus.
  Material options share a two-column grid; the opaque form body scrolls between
  the fixed sheet heading and result/reset actions.
- Topic filters use the shared moving surface indicator. Reader tabs use the same
  measurement with a 2px underline. Retain Radix arrow-key focus and Space/Enter
  activation; reduced motion moves directly to the selected state.
- Copy actions share idle, copying, copied, and recoverable failure states.
  Reserve label width, retain keyboard focus during the pending operation, block
  duplicates, and confirm only after the clipboard write succeeds. Success
  returns to idle after 2.5 seconds; failures remain available for retry.
- Topic directory cards have one full-area link with a title-based accessible
  name. Keep every card and icon stationary; color, border, and underline carry
  hover/focus feedback. Content cards still never carry Topic membership.
- Contributions show the GitHub form and direct PR as two aligned paths on
  desktop and one sequence on phones. Keep public-submission guidance visible,
  place review details in a disclosure, and omit the footer's repeated submission
  invitation on this page while retaining its resources and legal links.
