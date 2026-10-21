---
name: Agora Recipes
description: Agora Website 2026 directory language with real recipe media.
colors:
  signal: "#00c2ff"
  signal-ink: "#04111d"
  signal-text-light: "#075c9a"
  canvas-dark: "#000000"
  card-dark: "#0a0a0a"
  card-hover-dark: "#1a1a1a"
  ink-dark: "#fcf9f8"
  muted-dark: "#b3b3b3"
  line-dark: "#383838"
  control-dark: "#626262"
  focus-dark: "#a0faff"
  canvas-light: "#fcf9f8"
  card-light: "#f0f1f3"
  card-hover-light: "#e7e8eb"
  panel-light: "#f1f0f0"
  ink-light: "#0f0f0f"
  muted-light: "#626262"
  line-light: "#d6d6d6"
  control-light: "#8a8a8a"
  code-bg-dark: "#0a1114"
  code-header-dark: "#12191c"
  code-text-dark: "#e6edf3"
  code-border-dark: "#2c2c2c"
  code-bg-light: "#f2f7f8"
  code-header-light: "#eaeff0"
  code-text-light: "#1f2328"
  footer-bg: "#050708"
  footer-ink: "#f3f6f7"
typography:
  display: {"fontFamily": "MiSansLatin, MiSans, Helvetica Neue, Arial, sans-serif", "fontSize": "clamp(1.75rem, 2.5vw, 2.125rem)", "fontWeight": 400, "lineHeight": 1.02, "letterSpacing": "-0.035em"}
  headline: {"fontFamily": "MiSansLatin, MiSans, Helvetica Neue, Arial, sans-serif", "fontSize": "clamp(2.25rem, 3.055556vw, 2.75rem)", "fontWeight": 400, "lineHeight": 0.94, "letterSpacing": "-0.04em"}
  title: {"fontFamily": "MiSansLatin, MiSans, Helvetica Neue, Arial, sans-serif", "fontSize": "20px", "fontWeight": 400, "lineHeight": 1.2, "letterSpacing": "-0.025em"}
  body: {"fontFamily": "MiSansLatin, MiSans, Helvetica Neue, Arial, sans-serif", "fontSize": "16px", "fontWeight": 400, "lineHeight": 1.58}
  small: {"fontFamily": "MiSansLatin, MiSans, Helvetica Neue, Arial, sans-serif", "fontSize": "13px", "fontWeight": 400, "lineHeight": 1.5}
  label: {"fontFamily": "MiSansLatin, MiSans, Helvetica Neue, Arial, sans-serif", "fontSize": "13px", "fontWeight": 500, "lineHeight": 1.5}
  code: {"fontFamily": "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", "fontSize": "13px", "fontWeight": 400, "lineHeight": 1.5}
rounded: { square: "0px", technical: "2px", circular: "50%" }
spacing: { base: "4px", sm: "8px", md: "12px", gutter-phone: "16px", gap: "20px", lg: "24px", section: "32px", wide: "48px", footer: "64px" }
components:
  button-primary: {"backgroundColor": "{colors.signal}", "textColor": "{colors.signal-ink}", "typography": "{typography.label}", "rounded": "{rounded.technical}", "padding": "12px 20px"}
  button-outline: {"typography": "{typography.label}", "rounded": "{rounded.technical}", "padding": "12px 20px"}
  directory-filter: {"typography": "{typography.label}", "rounded": "{rounded.square}"}
  search: {"rounded": "{rounded.technical}", "height": "52px"}
  media-card: {"backgroundColor": "{colors.card-dark}", "rounded": "{rounded.technical}"}
  media-card-light: {"backgroundColor": "{colors.card-light}", "rounded": "{rounded.technical}"}
  metadata: {"rounded": "{rounded.technical}", "padding": "2px 6px"}
---

# Design System: Agora Recipes

## Overview

**Creative North Star: "The Agora Website Directory"**

The Agora website directory is the visual home for Recipes: quiet regular-weight type, matte black or warm-light surfaces, rectilinear controls, and official cyan signals. Real product media supplies the variety; the shared shell supplies continuity.

This Recipes-scoped record merges the website-family foundations from Omja’s #68 with the media and discovery work from #70. The implemented CSS is normative where the imported multi-product specification differed; SSO migration recommendations do not apply here.

**Key Characteristics:**
- MiSans Latin, official Agora wordmark, and a restrained cyan signal.
- Content-sized particle introduction followed immediately by discovery.
- Real media, compact two-column phone browsing, and readable implementation guides.

Provenance: [Omja #68](https://github.com/AgoraIO-Community/agora-recipes/pull/68) (`da99e784`) and [media/discovery #70](https://github.com/AgoraIO-Community/agora-recipes/pull/70) (`6afa3d9`). The [website renderer record](lib/website-hero/README.md) identifies `agora-website-2026` commit `1f8f4f1e8d2601dffe42ba51b280815014446ad8` and pinned `shaders@4.0.0`. The [font attribution](public/font/README.md) records unmodified `misans@4.1.0/lib/Latin/` faces and the [MiSans license source](https://hyperos.mi.com/font/en/). Preserve per-asset media provenance when replacing files.

## Colors

### Primary
Official Signal is the action fill, logo, selection underline, and graphic accent. Signal Ink carries text on that fill. Small light-theme blue text uses Signal Text Light; light prose links use neutral ink with a signal underline. Primary hover uses warm ink with dark text in dark mode, and dark ink with warm text in light mode.

**The Signal Rule.** Keep official cyan for action fills, active rules, and graphics in both themes. Small blue text on light surfaces uses the companion signal-text shade; body copy remains neutral.

### Neutral
Dark canvas, card, and hover planes step upward from black. Light canvas is warm, with cooler card and hover planes. Muted ink distinguishes secondary information; decorative lines and stronger control boundaries have separate roles. The footer retains its dark website palette in either appearance. Code uses its own theme-aware surface and ink tokens.

## Typography

**Display and Body Font:** MiSansLatin, with MiSans, Helvetica Neue, Arial, and sans-serif fallbacks. **Code Font:** system monospace. Local font faces retain source weights (380 and 520); UI styles request (400), (500), and (600), with font synthesis disabled.

Use regular weight and tight tracking for headings. The compact intro uses the display token, becoming (28px) on phones; detail hero headings use headline. Media-card titles use title, becoming (16px/1.25) on phones. Detail section headings retain (20px/1.08) with (-0.035em) tracking. Card summaries are (13px/1.5), reducing to (12px) on phones; author and metadata text are (12px). Reader prose uses body with a maximum measure (68ch); code can extend wider. Avoid promoting existing uppercase technical metadata into a new decorative eyebrow convention.

## Layout

The shell uses a content width up to (1600px), plus gutters of (clamp(24px, 4vw, 64px)); phones at or below (640px) use (16px) gutters. Navigation is (62px) tall, becoming (58px) at (900px). The intro sizes to its content, with desktop padding (24px 0 20px) and phone padding (20px 0); its particle host follows the intro dimensions.

Search and topics stick below the measured navigation height. Visible platforms follow; advanced facets expand inline. The media grid has three columns and (20px) gaps, changing directly to two columns at (640px), with (12px) horizontal and (16px) vertical gaps. The first six recommendations lead; a fading native disclosure previews subsequent real entries. Search/filter results bypass that initial truncation. Media stays (16:9).

Detail pages use a main column and (240–280px) sticky rail with a (clamp(24px, 3vw, 60px)) gap. At (900px), the layout becomes one column, capped at (688px), with the rail flowing after the content.

## Elevation & Depth

**The Matte Surface Rule.** Use tonal planes and hairlines for structure. Cards, controls, and dialogs carry no drop shadows.

Scrolled header and sticky catalog controls use translucent backgrounds with (20px) blur and (1.15) saturation. Code has an inset signal rule (3px). Layer order is catalog bar (60), header (80), dialog overlay (100), dialog content (110), and focused skip link (150); dialogs must cover both sticky surfaces.

State changes use the shared easing, with (200ms) color transitions and (360ms) header changes. Fine-pointer action hover lifts (2px); active media cards change tone without lifting. The website Voice/Video/Agent formations retain their source geometry, host-scaled rendering, accessible pause, off-screen suspension, and reduced-motion treatment. Reduced motion shortens transitions and disables hover translation.

## Shapes

Technical corners (2px) unify controls, media cards, menus, dialogs, labels, and code. Text filters have square corners and no filled container. Hairlines are (1px); selected controls use a (2px) signal underline. Author avatars and video-play markers are circular. Do not generalize those exceptions into pill-shaped controls.

## Components

### Buttons and fields
Primary buttons pair Signal with Signal Ink; outline buttons use the control boundary and neutral text; text actions use the theme's signal-text role. Shared actions have (46px) minimum targets, (12px 20px) padding, and visible focus. Focus is a (2px) outline with (3px) offset; light appearance adds an outer signal ring. Search has a secondary surface, strong boundary, and (16px) input text: outer height (52px), reducing to (48px) on phones.

### Directory filters and metadata
**The Directory Control Rule.** Interactive catalog filters are plain text with a signal underline for selection. Bordered metadata labels remain noninteractive.

Quick topics and visible platform choices scroll horizontally when needed. Platforms and use cases match any selected value (OR); capabilities match every selected value (AND). Secondary platforms use More; type/use-case/capability controls expand inline. Has a demo, native sorting, result status, and reset stay compact. The empty state explains the mismatch and provides a clear reset.

### Media cards and continuation
Card bodies use desktop padding (16px 18px 10px), reducing to (10px 10px 6px) on phones. Titles and summaries each clamp to two lines. Author links retain a (46px) target and a (20px) avatar with initials fallback. Show at most two metadata labels, reducing to one on phones. Video covers open on-site playback; non-video demo covers open the existing external demo; titles open the guide. Guide-only entries use the same text and author hierarchy without fabricated media. Native inline continuation reveals the remaining catalog in place.

### Navigation, dialogs, and reading
Use the official wordmark and restrained website header/footer. Desktop navigation becomes a keyboard-operable menu at (900px); appearance follows the system without a selector. Video and help dialogs use the shared corrected layers, (46px) close targets, scrollable content, and focus restoration. Video includes native controls, setup notes, original-source and recipe links, optional HTTPS demo actions, and a load-failure fallback. Optional Demo links belong to recipe metadata independently of curation. Detail reading preserves true Rendered/Raw tabs, Shiki dual-theme highlighting, copy feedback, horizontal code scrolling, and the narrower prose measure.

## Do's and Don'ts

### Do:
- **Do** follow live device appearance and ignore legacy stored theme choices.
- **Do** preserve real thumbnails, source attribution, setup notes, and truthful demo availability.
- **Do** keep visible focus, 46px control targets, keyboard disclosure, and reduced-motion support.
- **Do** keep all recipes in one catalog; search and filters must reach beyond the initial recommendations.

### Don't:
- **Don't** add a theme selector, hero mode tabs, a viewport-height intro, or a separate mobile animation band.
- **Don't** turn catalog filters into filled pills or add card drop shadows.
- **Don't** use the small-text companion blue as a replacement brand fill.
- **Don't** fabricate media, live demos, or a separate View all destination.
