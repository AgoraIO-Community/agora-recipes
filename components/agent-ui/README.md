# Recipes controls and floating surfaces

The shared component layer implements the Recipes design system. DESIGN.md
owns visual rules; this file describes component integration.

## Solid controls

`controls.css` defines buttons, inputs, toggle groups, underline tabs,
checkboxes, and selection states using Recipes tokens. Existing primitives
preserve native links, keyboard behavior, focus, dismissal, and accessible names.
Controls have 6px corners, trays 10px, desktop heights 32/40/44px, and phone or
coarse-pointer targets of at least 46px. Search stays 48px. Primary fill follows
the foreground in each theme; secondary controls use solid neutral surfaces.

Hover, focus, and press preserve the bounds of controls, labels, and icons.
Cards and images keep their size and crop. Use color, border, underline, and
opacity for feedback; reserve space for icons that fade in. Keep hover free of
translation, scaling, expanding labels, and moving arrows.

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

## State feedback

`SelectionIndicator` moves the neutral underlay when the selected topic,
category, or guide section changes. Reader tabs use an underline. Copy states
reserve width and transition to a check with accessible success or failure
feedback. Disclosures, theme changes, and floating-surface entry respond to
explicit state changes. Layout and reading styles belong in `app/globals.css`.
