---
name: Agora Recipes — Website 2026 and Glass
description: Compact real-project discovery in the Agora visual family.
colors:
  background: "#fcf9f8"
  foreground: "#0f0f0f"
  signal: "#075c9a"
  muted: "#626262"
  border: "#d6d6d6"
  background-dark: "#000000"
  raised-dark: "#0a0a0a"
  card-dark: "#1a1a1a"
  signal-dark: "#00c2ff"
  glass-action: "oklch(25% .009 255 / .98)"
  glass-action-ink: "oklch(97% .003 255)"
typography:
  display:
    fontFamily: "MiSans, Helvetica Neue, sans-serif"
    fontSize: "clamp(1.65rem, 2.4vw, 2rem)"
    fontWeight: 600
    lineHeight: 1.16
    letterSpacing: "-.035em"
  title:
    fontFamily: "MiSans, Helvetica Neue, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-.02em"
  body:
    fontFamily: "MiSans, Helvetica Neue, sans-serif"
    fontSize: "14px"
    lineHeight: 1.45
rounded:
  control: "6px"
  group: "8px"
  surface: "12px"
spacing:
  tight: "4px"
  small: "8px"
  card: "12px"
  grid: "16px"
components:
  button-primary:
    backgroundColor: "{colors.glass-action}"
    textColor: "{colors.glass-action-ink}"
    rounded: "{rounded.control}"
---

# Design System: Agora Recipes

## Overview

Use Agora Website 2026 foundations with the user's Agora Glass control family. Real project thumbnails and clear actions carry the catalog. The homepage is one list, with six recommendations first and a visible continuation into the remaining recipes. The large promotional feature and event collection are removed.

## Colors

Warm neutral light surfaces and black dark layers follow the current website foundation. Blue remains the Agora brand signal. Scoped Glass controls retain Crystal/Obsidian materials and their dark primary action; they do not replace the website's overall palette. Source commits and adaptations are in `components/agent-ui/README.md`.

Dark is the first-visit default, independent of the system preference. The header's sun/moon control switches themes and persists the visitor's choice. The mobile browser color follows the selected theme.

## Typography

MiSans is used throughout, with official unmodified Latin slices for regular and semibold. Other scripts use the host sans-serif fallback. Gallery titles use 16px on desktop and 15px on phones; author bylines use 12px beside a 20px avatar. Controls and guide excerpts use 13px. Compact tags use 11px; media durations use 10–11px. Recipe pages retain full reading content. Technical code retains a monospace face. Keep the Xiaomi attribution in the footer.

## Layout

The catalog shell is at most 1200px, with 32px desktop and 12px phone gutters. Search and quick tags precede all cards and remain reachable while scrolling. At 1200px and wider they share one row. The gallery has three columns above 900px and two below, including phones; phone gaps are 12px horizontally and 20px vertically. Media cards contain a 16:9 preview, title, concise outcome, and author/avatar with selected tags. Desktop shows at most two tags and phones one. Summaries are bounded to one line on desktop and two on phones. Setup notes and duplicate action rows stay off the gallery. Search results reveal every matching entry. Remaining default entries are disclosed through a native details element with real preview titles, authors, and a faded edge.

## Elevation & Depth

Only the search field uses the original GlassSurface refraction and pointer light. Its input shares that single plane without a second border or fill. Topic controls use quiet neutral selected states. Media cards have no surrounding tinted panel; title and author sit on the page canvas. Text-only guide cards retain a light boundary. Foreground text and images are never filtered. Use the supplied frosted fallback for WebKit and solid surfaces for reduced transparency or unsupported backdrop filtering.

## Shapes

Retain the source's control, group, and surface geometry. Controls use 32/36/44px source sizes; coarse pointers get at least 44px targets. Small play circles belong to media actions rather than decoration.

## Components

Use the adopted GlassSurface, Button, and Input components without registry replacement. A media thumbnail plays its recording or opens the existing live demo; its title and summary link to the recipe. Verified author avatars are bundled locally and link to their GitHub profiles, with initials for unavailable images or unknown authors. Tags are quiet context, not another button row. Gallery framing removes browser chrome from existing media; React Live Video uses the existing entry screen instead of empty black call tiles. Remove repeated Watch/Try buttons, full capability lists, and setup notes from media cards. Video dialogs retain setup notes, an original-video recovery link, the recipe link, and one live-demo action where available. Recipe links do not prefetch implementation documents during browsing. Filters use a dismissible Radix popover, consistent select geometry, and an inline reset for advanced selections. Retain native continuation keyboard behavior, pressed topic states, focus return, video recovery, and reduced-motion support.

## Do's and Don'ts

- Do retain real media, source attribution, setup notes, and clear demo versus guide destinations.
- Do search every recipe regardless of the collapsed catalog state.
- Don't add an event-specific collection or a separate View all destination.
- Don't put refractive glass behind dense reading text or stack filtered layers.
- Don't add simulated Agent activity to a catalog that is not running an Agent session.
