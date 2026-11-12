# Recipes controls and floating surfaces

The shared component layer implements the Recipes design system. DESIGN.md
owns visual rules; this file describes component integration.

## Solid controls

`controls.css` defines buttons, inputs, toggle groups, underline tabs,
checkboxes, and selection states using Recipes tokens. Existing primitives
preserve native links, keyboard behavior, focus, dismissal, and accessible names.
Buttons, toggles, icon selects, and reader tabs share the header navigation's
32px outer height, 13px regular text, and 6px corners. Single-line Input,
InputGroup, and Select use the same `--field-size` geometry. Phone and coarse-pointer
targets are at least 46px. Selected controls use a fine border and a neutral
fill; toggle groups have no padded tray or selection shadow. Multiline fields
start at 96px. Phone text-entry controls use 16px text. Standalone search is 48px; docked search matches adjacent
actions at 32px on desktop and 46px on phones. Primary fill follows
the foreground in each theme; secondary controls use solid neutral surfaces.

## Composing controls

Use `components/ui/` as the shared component API and the composition rules in
DESIGN.md as its contract. Compose commands with `ButtonGroup`; compose a
persistent choice with `ToggleGroup`; use `Tabs` for reader content. A connected
action group can combine icon buttons, a select trigger, and a menu or sheet
trigger. Preserve the actual button/link/select element through `asChild`.
Use a seam or gap to separate actions from a state selector.

Keep category labels visible. Familiar actions can use `IconButton`, whose
localized accessible name and tooltip agree. An icon select keeps the selected
value accessible and lists complete option names in the menu. Do not add a
second selector for the same intent at the same breakpoint. When a command
moves into a compact sheet header, hide its desktop instance and keep the same
state. Long labels wrap inside bounded panels; phone targets remain at least
46px, including selected-condition chips.

Checkbox option rows pair Label and Checkbox with `facet-option`. Shared styles
own their complete 32px desktop / 46px phone hit area and selected, disabled,
hover, press, and focus feedback; page styles only place the rows.

Use `IconButton count` or `ButtonCount` inside an input action for a command's
active count. Use a small badge on the button's upper-right corner, clear of the
glyph. Preserve the square target and do not use the larger metadata Badge for
this role. Include the count in the accessible command name.

Keep visible copy to identity, content, requirements, state and recovery. Do not
add explanatory footers to pickers, repeat labels as paragraphs, or narrate
internal preparation steps. Show non-default sorting beside removable filters;
removing its condition resets only the sort.

Use `Toolbar` / `ToolbarActions` for catalog and reader control bars: choices
start at the left and commands align to the right. Icon TabsTrigger and
SelectTrigger use `size="icon"`; feature code supplies no width or icon skin.
Button's `edge`, `wrap`, field variant, menu size and resource size cover content
edges, long labels, field pickers and directory rows. InputGroup's search size
owns hero search geometry. Tooltip adapters preserve the target's own slot and
state attributes. Native Disclosure slots own host summary controls, including
reader metadata, diagram source, filters and contribution disclosures.
The embedded CodePanel variant belongs in a floating panel Body and delegates
scrolling to that body. Its copy action sits beside the code at the top right,
without a separate header or repeated label. A dedicated grid column keeps the
copy target clear of wrapped commands, including on phones.

The style check included in `npm run lint` rejects page-level control type,
material, padding and height overrides. Keep placement in page CSS and extend
shared variants for new reusable roles. The reference mounts real reader and
prompt compositions rather than separate imitations of them.

Hover, focus, and press preserve the bounds of controls and labels.
Cards and images keep their size and crop. Use color, border, underline, and
opacity for feedback. Ordinary icons stay stationary. A main navigation CTA can
opt into `ButtonArrow`: `forward` continues within the site; `outbound` leads to
another product. Keep at most one directional CTA per action group. The arrow
makes one 200ms exit/re-entry inside its fixed 16px slot on fine-pointer hover or
keyboard focus. Reduced motion, touch, disabled and busy controls remain static.
Do not infer arrows from external URLs or repeat them in navigation, menu rows,
cards or metadata. Functional back, top, sort and disclosure icons remain.

Video previews retain their separate interaction:
the centred icon crossfades to a centred icon-and-label group inside a fixed
frame. The decorative glass backing expands equally to both sides. A two-second mouse dwell starts muted inline video;
leaving restores the poster. Touch and reduced-motion/data preferences retain
explicit playback.

## Floating surfaces

`GlassSurface` and `glass.css` provide complete Liquid Glass for floating media
actions, navigation and select menus, dialogs, and the bounded filter sheet.
The geometry-sized map drives three displaced color channels, blended behind
independent foreground content. Keep refraction, transmission, edge highlights,
and elevation together. Reading and form bodies remain opaque. Accessibility
preferences and unsupported filtering use solid fallbacks.

Content uses `asChild` to make `GlassSurface` the content element, retaining its
slot, role, ref, and event handlers. Keep the optical and highlight layers behind
content. Opening and closing may translate the glass with no persistent
animation fill. Ancestor opacity animation creates a backdrop root that blocks
page sampling; fade the separate modal overlay instead.

Menu options use 32px reading rows on desktop and at least 46px on phones
and coarse pointers. Compact navigation uses 46px rows. `panels.css` owns
Dialog, Sheet, and form Popover geometry. Use their Header, Body, and Footer
slots: the header owns the in-flow close action, the opaque Body is the only
scroller, and the footer remains fixed. Headers can group actions beside a
16px title. Do not add page-specific close offsets, title padding, nested cards,
or a second scrolling code plane.

## State feedback

Button and Select use the same hover, held-press, open, icon-ink and focus rules.
Shared `--control-hover-*` and `--control-pressed-fill` tokens own these states;
only primary/destructive variants override their materials. Disabled/busy
controls stay quiet. Hover requires a fine pointer. Validation borders always
win, including while a picker is open. Selection is separate from interaction:
neutral underlays mark a persistent mode, while hover/press adds local feedback.
Menus and Select options share highlights and press fills; selected options keep
their checkmarks. Feature classes must not reskin these states. Use the connected
Select/Button example in `/design-system` to compare unlike primitives together.

`SelectionIndicator` moves the neutral underlay when the selected category,
view, or guide section changes. Reader modes use connected bordered controls;
guide section navigation uses an underline. Copy states
reserve width and transition to a check with accessible success or failure
feedback. Disclosures, theme changes, and floating-surface entry respond to
explicit state changes. Layout and reading styles belong in `app/globals.css`.

## Implementation contract

`component-kit.mjs` registers the supported primitives. Feature code imports that
kit through `components/ui/`; direct interaction-library imports and unregistered
templates are rejected by ESLint. The shared optical surface is available for
media compositions. Native media targets and read-only Markdown task checkboxes
are the explicit native-control exceptions.

Run the app in development and open `/design-system` to inspect the actual
components, pinned states, and compositions. This route is unavailable in
production. Update it with any new primitive, variant, or interaction contract.
Keep all examples product-owned and describe decisions through behavior and tokens.

Before extending the kit:

1. Select the semantic primitive and use its existing variants.
2. Put reusable geometry, materials, and states in the shared layer; page CSS
   owns placement and reading layout.
3. Add default, selected, disabled, busy, error, long-label, and keyboard examples
   that apply to that component.
4. Inspect the reference page and affected product routes in both appearances,
   narrow phones, and desktop layouts. Compare actual outer dimensions and
   centers with the navigation sample. Keep one visible entry per task.

Card Demo actions use Try demo (Demo on phones) without a decorative arrow.
Covers open an available Demo; titles always open details, and a separate
play control opens video. Keep all provided materials reachable in both views. State
selectors keep their labels and geometry while the selection underlay moves.
All ordinary control icons are 16px. Docked search shares the adjacent action
height. Reduced motion reaches the usable state directly.

`Button busy` preserves layout, accessible names, and focus while capture guards
block repeated actions and slotted navigation. `busyIndicator={false}` allows the
copy control's existing four states to render once. Explicit disabled buttons keep
native semantics. Existing variant names remain compatible with primary, secondary,
and quiet roles. Filter disclosure keyboard navigation retains independent groups.

Theme selection follows the operating system before paint and on live changes.
Shared controls do not expose a manual theme override.

## Managed consent notice

`managed-consent.css` adapts the external SDK's attached notice layout. The narrow
Securiti selectors in `controls.css` apply shared control tokens to the SDK's
existing elements; those elements retain their managed handlers and persistence.
A layout-only wrapper groups the original choice nodes without replacing their
handlers or changing their keyboard order. This is an external-DOM adapter,
not another React control API or consent form.
The reference opens the actual managed notice to expose wrapping and equal choice
geometry, rather than rendering a separate copy. Verify product routes too.

## Media placeholders

`EmptyMedia variant="cover"` fills an existing bounded media frame with a muted
surface and a centered image glyph. Use it for missing or failed covers; it is
static and does not imply loading. Keep the accessible destination name on the
containing link. The mixed-card reference demonstrates this variant alongside
real media, including matching title and byline placement.

The managed preference center keeps its original close node and handlers. The
adapter places it in the title row with shared 32/46px bounds and a 16px icon.
