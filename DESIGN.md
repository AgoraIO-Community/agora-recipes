# Agora Recipes design guide

Recipes is a compact catalog that follows the system theme, for finding working Voice AI and RTC projects,
trying their demos, and following their implementation guides. Keep the interface
in the Agora website family: official cyan wordmark, local MiSans typography,
quiet charcoal controls, and real project media.

## Component standard

Recipes owns one component kit, token scale, and interaction grammar. The shared
primitives, this guide, and the development-only `/design-system` page define
the implementation contract. Interface choices remain consistent across routes,
languages, and appearances. Extend that contract before introducing a new control.
The Agora palette, brand assets, typography, and system appearance remain the
visual baseline. Component refinement improves composition and behavior within
that identity; it does not introduce a different site theme.

## System ownership

This guide defines the visual and interaction rules for Recipes. Shared tokens
and components apply across the catalog, filters, recipe pages, and navigation.

- `app/globals.css` owns page layout, typography, and reading styles.
- `components/design-system/controls.css` owns solid control materials, sizes, and states.
- `components/design-system/panels.css` owns floating panel geometry and header/body/footer anatomy.
- `components/design-system/glass.css` and `glass-surface.tsx` own floating Liquid Glass.
- `components/ui/` provides the shared interactive primitives.
- Recipe metadata and existing media remain the source of titles, authors,
  platforms, durations, and demo availability.

Extend these patterns rather than adding page-specific button, input, tab, or
select skins. Design proposals and temporary review captures do not belong in
application assets unless the interface actually uses them.

Page CSS may position controls, but it must not redefine their colors, type,
corners, padding or height. `npm run lint` checks page styles against the shared
control classes and classes attached to actual control instances. Extend a
component variant when geometry must differ by role.

- `Button edge` aligns a quiet action to a content edge; `wrap` handles long
  translated labels. Menu rows use `size="menu"`; footer resource actions use
  `size="resource"`. Field-like menu pickers use `variant="field"` and share the
  input/Select field geometry and mobile entry type.
- `TabsTrigger size="icon"` and `SelectTrigger size="icon"` own their 32/46px
  square bounds and 16px, 1.6px-stroke icons. Feature code does not apply control
  skin classes. `InputGroup size="search"` owns the 48/46px hero search; docking
  returns it to the default field size while retaining the same input.
- Catalog and reader headers use `Toolbar` with `ToolbarActions`: choices start
  at the left, commands align to the right, and related commands use ButtonGroup.
- Native disclosures use the shared Disclosure / DisclosureTrigger /
  DisclosureContent slots. Triggers share the 32/46px control rhythm, 13px text
  and icon stroke. Keep section seams and body layout in the page layer.
- CodePanel uses its normal reading frame in documents and an explicit
  `variant="embedded"` within a floating panel's opaque Body. Embedded code uses
  the parent's scroller without feature-specific frame or padding overrides.
- Tooltip composition must preserve the wrapped control's `data-slot`, selected
  state and expanded state, alongside its focus and event handlers.

The reference page mounts the actual recipe reader and prompt actions. Compare
their computed styles and state behavior with the header and catalog controls,
as well as checking their bounds. Geometry-only probes do not establish visual
consistency across component roles.

## Component composition

The shared Recipes components are the implementation standard. Reuse the
existing primitives and tokens before adding a dependency or a new variant.
Each control has one semantic role and one canonical location in a flow.

| Intent | Component | Composition rule |
| --- | --- | --- |
| Run a command or open a picker | `Button`, `IconButton`, `Select` | Group related commands with `ButtonGroup`; join their edges and name the group |
| Choose one persistent mode | `ToggleGroup` | Keep the selected state explicit; use `SelectionIndicator` beneath stationary labels or icons |
| Switch reader content | `Tabs` | Use connected controls with a neutral selected fill |
| Refine a collection | `Sheet`, `Checkbox`, disclosures | One entry point, metadata-driven options, visible removable conditions beside the result count |
| Open a floating surface | `GlassSurface` with the existing dialog, menu, or sheet primitive | Preserve dismissal, focus return, optical layers, and an opaque reading or form body |

Keep domain choices such as All / Voice AI / RTC labeled. Familiar commands such
as view, sort, filter, and copy may use icon buttons with localized accessible
names and tooltips. Full option names belong inside their picker. Metadata is
content, not a button. Use a small seam or space between controls with different
roles instead of a separate label or container for each action.

Keep control order stable as a layout condenses: state selectors come before
commands, and dismissal stays last on the right. The catalog uses view, sort,
then filter; the compact sheet keeps view before sort, followed by its close
button. Text actions precede language and menu utilities in the site header.
Back arrows lead their label; opt-in CTA direction cues trail it. Copy stays beside
the content it copies. Recipe and Topic pages share one Share menu, including
Copy link. Material links use Demo, Guide, then Source order when available.
Do not expose a shortcut beside another visible entry for the same task.

Motion explains a state change: the selection underlay travels, a disclosure
opens, a floating surface enters or leaves, and a copy action confirms success.
Use the shared 200/360/600ms tokens. Labels, icons, cards, and images keep their
geometry on hover and focus. Transitions must tolerate rapid reversal and
preserve focus; reduced motion goes directly to the usable state. Keep frequent
catalog actions quiet and reading content stable.

### Direction cues

Arrows communicate direction or hierarchy; an external URL alone does not earn
an arrow. Header/footer resource navigation, repeated Demo links, card titles,
related-entry lists, source links and menu rows use clear text without trailing
direction decoration. Retain accessible new-tab labels and actual destinations.

| Intent | Treatment |
| --- | --- |
| Return, back to top, expand/collapse, sort, enter a submenu | Keep the functional direction icon; disclosure rotation describes its state |
| A section's main navigation CTA | Opt into `ButtonArrow` after the label; at most one directional CTA in an action group |
| Continue within the site | `ButtonArrow` with `direction="forward"` |
| Main CTA leading to another product | `ButtonArrow` with `direction="outbound"` |
| Icon-only external resource command | Keep a named `ExternalLink` icon when it is the command's identifying glyph |

Get started and the footer submission invitation are the production CTA uses.
Do not attach animated arrows to every button or infer them from `target`.
The shared cue makes one 200ms exit/re-entry inside a fixed 16px clipped slot
on fine-pointer hover and keyboard focus. Only these decorative arrow glyphs
move; the button, label, spacing and hit area remain fixed. Leaving reverses the
transition; there is no ambient loop. Touch and reduced-motion appearances keep
a static arrow. Disabled and busy controls do not trigger the motion.

Check new compositions with real content in light and dark system appearances,
at 320px, a representative phone size, and the affected desktop breakpoints.
Exercise long translated labels, selected and disabled states, keyboard entry
and dismissal, empty results, and return navigation. A new composition belongs
here only when its role is reusable; a one-page layout belongs in `globals.css`.

## Color and material

Follow `prefers-color-scheme` before first paint on every route and on live system
changes. There is no manual theme control. Ignore previous `recipes:theme`
overrides. Theme changes keep the same layout, typography, imagery, and geometry.

The theme covers the catalog, filters, reading, dialogs, native browser surfaces,
syntax highlighting, and diagrams. Theme selection does not depend on storage.

| Role | Dark | Light | Usage |
| --- | --- | --- | --- |
| Canvas | `#000000` | `#fcf9f8` | Page background |
| Secondary | `#0a0a0a` | `#ffffff` | Footer and recessed areas |
| Surface | `#1a1a1a` | `#ffffff` | Project tiles and panels |
| Raised / muted | `#242424` | `#f0eeec` | Hover and quiet metadata surfaces |
| Text | `#fcf9f8` | `#0f0f0f` | Main text |
| Secondary text | `#b3b3b3` | `#626262` | Descriptions, metadata, secondary links |
| Border | `#383838` | `#d6d6d6` | Structural seams and panel edges |
| Input edge | `#626262` | `#8b8581` | Fields and brand separator |
| Agora cyan | `#00c2ff` | `#00c2ff` | Official wordmark and brand signal |
| Link text | `#00c2ff` | `#075c9a` | Readable links on each canvas |
| Focus | `#a0faff` | `#075c9a` | Keyboard outline |
| Error | `#ff7b7b` | `#b42335` | Failure feedback |

Use the two materials by role:

| Role | Material | Treatment |
| --- | --- | --- |
| Buttons, inputs, search, filter items, toggles, copy | Solid controls | Solid fills, clear edges, independent text |
| Guide / Markdown and source actions | Connected solid controls | Neutral selected view; explicit Copy Markdown split action |
| Cards, reading, code, filter form body | Solid | Opaque, stable reading contrast |
| Sticky header and topic toolbar | Solid | Theme canvas with a structural seam |
| Video play control, demo action over media | Liquid Glass | Full refraction over the actual image |
| Navigation, select menu, modal, bounded filter sheet | Liquid Glass | Full refraction with solid controls inside |

Primary buttons use foreground fill and opposite canvas ink: warm white in dark,
charcoal in light. Hover uses the theme's readable Agora signal color. Secondary
actions use a bordered neutral fill; quiet actions gain that fill on hover.
Selected toggle underlays use a neutral raised surface. Media metadata labels
use solid dark fill and light text.

Control feedback is owned by `controls.css`, not the primitive's implementation
library. Button and Select triggers share the same state tokens, including icon
ink: hover uses `--control-hover-fill` and `--control-hover-edge`; held press uses
`--control-pressed-fill`; an open picker retains its hover fill and edge until
dismissed. Press changes the surface, never the whole control's opacity or size.
Primary and destructive actions override these tokens to retain their hierarchy.
Quiet controls keep their border transparent. Persistent choices use
`--basic-selected`; their underlay receives the same hover/press feedback while
labels remain stationary. Underline navigation and text links retain their text
feedback instead of gaining a button frame.

Menu items, checked menu options, submenu triggers and Select options share one
highlight/press treatment; checkmarks identify selection separately. Hover is
limited to a fine pointer, while press also works on touch. Disabled and busy
controls do not acquire interactive fills. Validation borders outrank hover,
open and press. Keyboard focus uses the shared outline independently of these
fills. Verify the full state cycle when composing unlike primitives in a group.

Liquid Glass means the complete geometry-sized SVG displacement map, separate
red/green/blue refraction, edge highlights, transmission, and elevation. Reuse
`GlassSurface material="liquid"`; a translucent blur-only shell is not an
alternative material. Keep the optical and highlight layers behind foreground
content. Forms and long instructions inside floating surfaces have an opaque
reading plane. Do not add glass to ordinary controls or reading surfaces.

In light mode, floating panels use one continuous opaque interior across their
header, content, and footer. Keep the complete optical engine with a quiet edge.
The opaque backing belongs to the panel itself so scrolling never moves its
reading plane or exposes background imagery behind menu text. Do not split the
filter sheet into glass headers/footers around a white form block. Use neutral
muted selection fills without an extra selection shadow inside these panels.
Media-overlay actions retain their existing optical material in both themes.

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

Ordinary buttons, toggles, single-line fields, selects, and reader tabs use the header navigation
as their reference: 32px high, 13px text, and 6px corners. Selected states use a
solid neutral fill and one fine border. Toggle groups add no padded tray or
selection shadow. Connected controls keep that same outer height. All interface
labels use weight 400. Project tiles and floating
panels use 16px; phone tiles and select menus use 12px. Media actions use 10px.
Metadata chips use 4px. Input, InputGroup, and Select share `--field-size`: 32px
on desktop and 46px for phone/coarse-pointer layouts. Multiline textareas start
at 96px. Field labels are 13px; phone text-entry controls use 16px to remain
readable without focus zoom. Keep long selected values on one line; menu options
show their full wrapping labels.
Phone and coarse-pointer actions use at least 46px targets. The standalone
catalog search is 48px; docked search matches the adjacent buttons at 32px on
desktop and 46px on phones. Align actual outer bounds and centers, without
per-control optical offsets for text actions.

All pages share one shell, at most 1504px including gutters. Header, catalog,
recipe overview, guide layout, and footer use the same outer edges. Gutters scale
up to 60px and become 16px at 640px. Keep prose constrained inside the reading
column rather than narrowing the entire detail page.

`--page-columns` and `--page-column-gap` define the shared column grid: three
columns with 20px gaps on desktop, two with 16px gaps at 900px, and 12px horizontal
gaps at 640px. Footer resources and legal links align to these catalog column
starts. Avoid independent fractional columns or distributed spacing for them.

## Floating panel anatomy

Dialog, Sheet, and form Popover use a shared Header / Body / Footer composition.
The close action sits in the header flow, beside the title and optional actions;
never position it with page-specific offsets or reserve an estimated text gutter.
Use the shared 16px title and 13px description. Header and footer padding is
12px by 16px, becoming 8px by 12px on phones. Controls retain their 32/46px bounds.

Use `DialogBody`, `SheetBody`, or `PopoverBody` as the one scrolling, opaque plane.
Keep header and footer outside that scroller. Do not nest another bordered card
or scrolling code plane inside it. The form body uses the existing canvas color;
the full optical engine remains on the outer surface and its chrome.

Default dialogs are bounded to 480px; the help layout can use 720px and video
can use its existing wider media layout. A desktop drawer is 384px wide with
12px outer clearance and 16px corners. Bottom sheets use the screen width,
16px top corners, and at most 88dvh, including a safe-area footer. Plain popovers
use 12px corners and padding; structured form popovers use the shared slots.
Select menus anchor below their trigger, with full labels and 16px collision
clearance. Menu rows share the 32/46px control rhythm.

## Header and footer

The header has a 64px content height, becoming 60px at 640px, plus its 1px seam.
Keep that height stable across scrolling and navigation states. The official
wordmark and the fixed English `recipes` product name form one shared lockup,
without a divider. Header and footer use the same `RecipesBrand` component.
The product name uses locally bundled Outfit regular at 28px on desktop, 25px
on phones, and 24px below 376px. The official Agora mark remains 86px, reduced
to 72px below 376px. Outfit's SIL Open Font License is bundled with the font.
Interface text continues to use MiSans and localized navigation labels. Align
the visual center of the wordmark's main letter body with the Recipes text,
excluding the long g descender. The current asset needs a 7.5px optical offset,
reduced to 7px on phones. Do not align the full SVG box or only its baseline. On desktop, center the
Recipes / Topics / Docs / GitHub / Discord navigation between the brand and right-hand actions.
Between 901px and 1200px, navigation buttons use 8px horizontal padding to keep
translated labels clear of the brand and actions. Navigation, header actions,
and docked search share a center line. Recipes carries the collection context; Contribute is secondary
to Get started.
The header gains its seam after scrolling and retains an opaque theme canvas. Keep the
search available after its original position scrolls away: move the same input
into the header slot and replace desktop navigation with it. Preserve the draft,
focus, composition, debounce, and keyboard shortcut. Keep one visible filter
entry: the sticky desktop toolbar owns it; on phones, the docked search takes
over when the original control passes behind the header, hiding that original
control for an exclusive handoff. Closing the sheet
returns focus to the entry that opened it without scrolling.
At 1100px, Contribute moves out of the header action row; the footer retains its
contribution link. On phones, the docked search replaces the brand while language
and navigation remain available. The header keeps its original height.

At 900px the main links move into a bounded floating navigation panel. On phones,
keep the language and menu icon buttons in the header; GitHub remains in the panel. Opening navigation must
not shift page content. Use the existing Popover for outside dismissal, Escape,
and focus return. Close it on navigation and when returning to desktop width.
The phone panel shares the page's left and right gutters; tablet panels stay
bounded and align to the right gutter.
The compact header has no extra GitHub shortcut. Get started appears in the
panel only when its header button is hidden on phones.

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

## Privacy choices

Agora/Securiti owns the initial notice, the only preference center, and all
optional analytics decisions. The footer opens that center directly. Do not add
a Recipes preference editor, local consent storage, or a second banner in
unconfigured development environments. Product and traffic analytics use
separate managed categories. Basic anonymous statistics remain always on and
are disclosed in the footer; no optional choice controls them.

Adapt the SDK's actual notice with the shared managed-consent adapter. Keep its
full corporate copy, policy and opt-out links, action handlers and dismissal
behavior. Use an opaque attached bottom bar, system theme and Recipes typography.
Accept and Reject have equal widths, separate outlines, full corners and an 8px
gap. Keep the choices and close action on one center line; place the managed
preferences link with the notice copy on desktop. Preserve the SDK’s keyboard
order and original action nodes. Controls are 32px on desktop and at least 46px on phones/coarse pointers.
Long labels wrap without horizontal clipping; short viewports scroll the notice
copy while actions remain reachable. The SDK's preference center is the sole
place to edit choices. Its close action stays in the title row, centered beside
the title with the shared 32/46px target and 16px icon, rather than an absolute offset. Failure can offer retry, never an alternate consent form.
The design-system reference opens the live managed notice instead of rendering
a separate imitation. Verify the same SDK locally on product routes.

## Interface copy

Use visible copy for identity, real content, requirements, current state and a
useful recovery action. Do not narrate implementation, add picker footnotes,
repeat a status already shown by a label, or restate the next button's action.
Put extended contribution instructions in the linked guide or the requested
help disclosure. Keep account/publication requirements and real access errors
concise. Accessible names, useful icon tooltips and live status remain available.

## Catalog and discovery

Lead with a short centered introduction and a search field up to 610px wide.
Command/Control K focuses search. One category/action toolbar follows, with
All / Voice AI / RTC always visible; platforms, use cases, and capabilities
belong in the refinement sheet with available materials. Do not add an independent
topic shortcut bar or repeat the category selection inside the sheet. Sorting
and the explicit card/list view selection move beside the sheet title at 900px.
Keep the view mode separate from the connected sort/filter commands. Show the
result count, non-default sort and removable refinements in one compact status area.
The sort condition resets only sorting; the filter reset retains sorting. Clearing
refinements keeps category, search, sort, and view. Legacy shortcut URLs remain
usable and expose their condition as a removable chip.

Curated collections belong in Topics navigation. Topics and recommendations
remain editorial selections, not automatically ranked categories. Keep the
curated order until reviewed.

The toolbar sticks below the measured header on desktop and scrolls normally on
phones. Single selection uses the shared
moving underlay; state must also remain explicit in control semantics.

Default catalog browsing starts with the curated media gallery, followed by a
directory grid. Both grids use three columns on desktop and two at 900px. Phone
cards remain in two columns. Desktop gaps are 20px; phone gaps are 12px across
and 16px down. A charcoal tile contains an inset real preview, title, concise
outcome, author, and one meaningful platform or capability label. Gallery crops
are 16:8.4; detail previews retain 16:9. Preserve the chosen crop origin.
Directory cards share one layout for title, summary, technology, difficulty,
author, and available preview actions.
Keep actual media as a full-width cover on desktop and phones. Cap covers at
240px high and summaries at two lines; titles use up to two lines on desktop
and three on phones. All cards in a grid share the same height, derived from bounded content rather
than a fixed pixel height.
Keep technology and author/action rows anchored at the bottom. Every card keeps
its cover frame. Missing or failed images use the shared `EmptyMedia` cover
variant with a centered image glyph; this is a static placeholder, not a loading
state. Titles and summaries use the same size and placement as media cards.
Available video playback and Demo links remain independent.
Bound media and copy rather than clipping a whole card's content or controls.

The title always opens recipe details. The cover opens the live Demo when one
exists, and otherwise opens details. A separate centred play control
opens the inline video dialog; search results use a labelled Video action.
An explicit Try demo text link remains available in either
layout whenever a demo exists. Do not use an unexplained display icon. Desktop
card footers align author, metadata, and Demo on one center line. Phone footers
place metadata above the author/Demo row, retaining a shared bottom baseline.
On phones the label shortens to Demo, and the video target is bounded to 46px
so that the rest of the cover remains available for the Demo. These three
destinations stay independent; do not replace one with another. Titles and Demo
links have no decorative arrows. Preview images retain their crop and scale. The default play control
and its labelled hover state both remain centred within the preview. Touch
controls remain visible. Do not invent
favorites, ratings, demo links, or availability claims.

Search, filters, and explicit sorts retain the selected layout. Cards are the
default; only the explicit view control switches to aligned text rows on desktop
and two-column text cards on phones. Store this choice as `view=list` in shared
URLs and preserve it when clearing filters. Keep actual demo actions available.
Most popular sorts by the committed GitHub-star snapshot;
unknown counts follow zero-star repositories. Refresh with `npm run stars:refresh`
using the maintainer’s GitHub CLI login; neither builds nor visitors require a
GitHub credential. Guide-only entries do not
reserve empty thumbnail space. Search covers the entire catalog, including
entries not yet visible. Render the first 12 entries and automatically reveal
batches of 12 as the visitor approaches the end. Announce loading/end status
without moving keyboard focus. Where IntersectionObserver is unavailable, show
all matches. There is no click-to-load control.

The bounded filter sheet has searchable groups, counts, and a fixed action area.
Its form scrolls vertically only; horizontal touch panning and overscroll are
disabled. Options and translated footer actions wrap within the panel at narrow
phone widths, with no clipped labels or horizontal scrollbar.
Use a compact title without introductory copy. On phones, sorting and card/list
selection share one row; omit redundant visible control labels and the category
group already available in the catalog toolbar. Keep accessible control names,
46px touch targets, and immediate result counts.
The Filters action uses a small active-count badge at its upper-right corner,
including when it docks in search. Keep the square target and the glyph clear;
the category choices stay visible. Long activity action labels wrap inside their
buttons. Centered dialogs retain at least 16px of horizontal viewport clearance
at every breakpoint, including tablet and landscape widths.
Use named icon actions for copying, GitHub, sharing, sorting, and reader
format/language/source controls. Keep related actions in compact button groups
and keep reader tools on one row on phones. Picker menus contain choices without
explanatory footers. Use full labels in menus and accessible names/tooltips on every icon;
retain short text for category choices, result counts, and task-specific links.
Platforms and use cases match any selected value; capabilities require all
selected values. Search, filters, sorting, and loaded count live in the URL
(`loaded=24`); old `all=1` links remain supported. New search/filter/sort conditions
reset the batch count. Returning from a recipe restores the same conditions,
loaded entries, and scroll position. Search still covers the entire catalog.

## Topic directory

Use two columns of thematic illustrations or organizer artwork, at a steady
16:9 ratio. A short title, one-line introduction, entry count, and current status
are enough for the directory. Keep the full name, background, dates, and source
references on the detail page. On phones, keep two compact columns and omit the
extra introduction. Do not crop out essential content by zooming media on hover.
Titles stay stationary; feedback uses the existing border and underline.
Collection art can use a clear #Topic identity; it does not act as a technical
tag. Keep the hackathon organizer poster and the adapted official iRTE2026 art.
Recipe cards still contain no Topic names or membership badges. Activities shows
ongoing and upcoming activities; Past activities shows completed activities only.
All includes both groups and collections.

## Recipe pages and reading

Lead with the outcome, technology, author, and Copy recipe prompt action. Demo
and source actions follow in priority. Use actual preview media and truthful
setup requirements. The prompt copy action and its setup chevron form one primary split button.
Keep author, difficulty, and update date together in the hero metadata; do not
repeat them in a second About panel beside the same guide.
The chevron opens a bounded Popover containing the prompt and, when supported,
an Agora CLI tab. Top-10 recipes with setup metadata instead use an English
Start building panel with AI Assistant and Manual Setup tabs. The AI prompt
directs the coding assistant through recipe discovery, project confirmation,
CLI initialization and the returned installation/start steps. Manual Setup
shows versioned npm creation, credential configuration, installation and a
scenario-specific voice test only for an available package; otherwise show a
clear availability message directing users to AI Assistant. Keep existing CLI
metadata intact for API consumers. Keep the complete GlassSurface with opaque code planes; do
not add a separate setup link or accordion row below the buttons.

Inside the shared page shell, the desktop guide uses a 216px left contents rail
and 48px gap. Reduce these at
intermediate widths; on phones the rail follows the content and a local contents
disclosure sits near the guide. The current section uses `aria-current` and the
shared moving selection underlay. Anchors must clear the sticky header.

The recipe overview uses the full shared shell width and starts at the page gutter.
On wide guide-only pages, place metadata at the left and primary actions at the
right of the overview’s final row. Keep media previews in the existing right column.

The document is an opaque reading panel. Its header separates view choice from
document actions: Guide / Markdown form a solid segmented tab group at the left;
Copy Markdown and its source chevron form one split action at the right. The
source menu contains View on GitHub and Open raw Markdown, with no generic More
menu or standalone Raw control. Keep author-language selection with the document
actions and put fallback details in its tooltip. Preserve Radix tab semantics and
keyboard navigation. Use the full available main column while constraining prose
to 68ch inside the panel. Place
optional machine metadata after the authored guide, not before its introduction. Preserve the fetched source
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
checklist and one concise review/Issue status line in the page. Keep direct PR instructions
in a secondary disclosure, targeting staging. An unavailable GitHub form has a
regular Issue draft recovery link with the same fields.

Topic association is optional and explicit. Current collections and activities
are offered first; ended activities stay in a collapsed group within the same menu. An inherited or
manually selected ended activity remains visible with its ended status, and its
checked historical choice is visible when the menu opens. Expand history in place
on phones and desktop; do not require a side menu to reach archived activities. Ordinary
collections and entries are not hidden merely because they were published earlier.

Topic-page actions, shared header,
and footer links carry that Topic. A recipe reached from a validated Topic list
retains that source when contributing; a direct detail visit or legacy quick
filter does not guess an association. The contributor can change or clear the
Topic. Its URL state drives the prompt, GitHub form, recovery draft, reload, and
website-language changes. Keep the validated returnTo source independent from
the selected association: changing the Topic must not change where Back returns.
Technical tags never choose a Topic.

## Interaction and accessibility

Use the shared control timing: control feedback 200ms and surfaces/selection 360ms. Longer
content may use the 600ms slow token when needed. Selection underlays move for 360ms with `cubic-bezier(.16,1,.3,1)`.
Hover and keyboard focus keep control bounds, cards, images, links and labels
stationary. Ordinary icons retain their position, size, spacing and crop. The
opt-in `ButtonArrow` is the bounded glyph-motion exception defined above.
Do not translate, scale, lift or expand components for hover feedback. Feedback
otherwise uses text color, fill, border, underline and opacity. Press feedback
also keeps geometry fixed.

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

Video hosting stays in `media.videoUrl`. Direct browser-playable HTTPS files
(including storage/CDN hosts) retain native playback and the delayed hover
preview. YouTube video links retain the poster on hover and load their official
privacy-enhanced player only when the dialog opens. Do not autoplay an external
embed or load provider scripts from catalog cards. Keep the original-video link,
localized loading/error/retry states, and actual-play-only measurement. Embedded
players have a 200px minimum height; the bounded dialog scrolls on short screens.

State changes may animate when they explain an action: selection indicators,
expanded disclosures, copy confirmation, theme changes, and opening or closing
floating surfaces. These transitions start from an explicit state change rather
than pointer hover. Feedback is local, reversible, and honors reduced motion.

The shared Button accepts `busy`, marks the action busy/unavailable, retains its
accessible name and keyboard focus, and blocks repeated activation before child
link handlers. Its overlay progress icon preserves geometry. Explicit `disabled`
remains native; slotted unavailable links block navigation. Copy controls opt out
of the generic spinner and use their existing local idle/pending/success/failure
feedback. Primary/secondary/quiet express hierarchy; existing variant names remain
compatible.

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
checked language menu. Keep it visible on phones. Share uses one menu within the primary action group, with Copy link inside;
do not expand platform links
into a separate toolbar. Guide-language selection belongs beside the reader
heading, with full option labels in the menu and the actual source language below.

## Interaction continuity

- Keep filter options in a stable base order while their live counts change.
  Selecting a checkbox must not move that target under the pointer or focus.
  Filter disclosure headings support Up/Down/Home/End without collapsing other
  selected groups. Native Enter/Space toggles the focused group.
  Material options share a two-column grid; the opaque form body scrolls between
  the fixed sheet heading and result/reset actions.
- Topic filters use the shared moving surface indicator. Reader modes use
  connected bordered controls; guide section navigation uses a 2px underline. Retain Radix arrow-key focus and Space/Enter
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


## Search interaction

Keep the existing solid search field and compact catalog. Draft typing is immediate;
commit results and URL state after 250 ms, flush on Enter, and clear immediately.
Do not commit during IME composition or restore old scroll snapshots while typing.
Show pending and failed guide-index states honestly; keep metadata search usable
with a retry action. Guide-only matches can use two lines of attributed source
excerpt within the selected card or result row. A sole compact phone result spans the
available row and allows four excerpt lines; multiple results keep two columns. Topic search terms do not add membership
badges or links to content cards.
