---
name: Agora Recipes
description: Search-first recipe discovery with Agora typography and agent-ui liquid glass controls.
colors:
  signal: "#00c2ff"
  signal-ink: "#04111d"
  canvas-dark: "#000000"
  card-dark: "#0a0a0a"
  card-hover-dark: "#1a1a1a"
  ink-dark: "#fcf9f8"
  muted-dark: "#b3b3b3"
  line-dark: "#383838"
  control-dark: "#626262"
  focus-dark: "#a0faff"
  code-bg-dark: "#0a1114"
  code-header-dark: "#12191c"
  code-text-dark: "#e6edf3"
  code-border-dark: "#2c2c2c"
  footer-bg: "#050708"
  footer-ink: "#f3f6f7"
  glass-fill-dark: "rgba(28, 31, 34, .62)"
  glass-highlight-dark: "rgba(255, 255, 255, .3)"
  glass-low-edge-dark: "rgba(0, 0, 0, .5)"
  glass-control-dark: "rgba(255, 255, 255, .075)"
  glass-control-hover-dark: "rgba(255, 255, 255, .13)"
typography:
  headline: {"fontFamily": "MiSansLatin, MiSans, Helvetica Neue, Arial, sans-serif", "fontSize": "clamp(2.25rem, 3.055556vw, 2.75rem)", "fontWeight": 400, "lineHeight": 0.94, "letterSpacing": "-0.04em"}
  title: {"fontFamily": "MiSansLatin, MiSans, Helvetica Neue, Arial, sans-serif", "fontSize": "20px", "fontWeight": 400, "lineHeight": 1.2, "letterSpacing": "-0.025em"}
  body: {"fontFamily": "MiSansLatin, MiSans, Helvetica Neue, Arial, sans-serif", "fontSize": "16px", "fontWeight": 400, "lineHeight": 1.58}
  small: {"fontFamily": "MiSansLatin, MiSans, Helvetica Neue, Arial, sans-serif", "fontSize": "13px", "fontWeight": 400, "lineHeight": 1.5}
  label: {"fontFamily": "MiSansLatin, MiSans, Helvetica Neue, Arial, sans-serif", "fontSize": "13px", "fontWeight": 500, "lineHeight": 1.5}
  code: {"fontFamily": "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", "fontSize": "13px", "fontWeight": 400, "lineHeight": 1.5}
rounded: { square: "0px", technical: "2px", search: "12px", search-phone: "12px", sort: "12px", selection: "12px", preview: "12px", metadata: "4px", circular: "50%" }
spacing: { base: "4px", sm: "8px", md: "12px", gutter-phone: "16px", gap: "20px", lg: "24px", section: "32px", wide: "48px", footer: "64px" }
components:
  button-primary: {"backgroundColor": "{colors.signal}", "textColor": "{colors.signal-ink}", "typography": "{typography.label}", "rounded": "{rounded.technical}", "padding": "12px 20px"}
  button-outline: {"typography": "{typography.label}", "rounded": "{rounded.technical}", "padding": "12px 20px"}
  directory-filter: {"typography": "{typography.label}", "rounded": "{rounded.selection}", "padding": "0 12px"}
  search: {"rounded": "{rounded.search}", "height": "50px"}
  search-phone: {"rounded": "{rounded.search-phone}", "height": "46px"}
  sort: {"rounded": "{rounded.sort}", "padding": "0 12px"}
  media-preview: {"rounded": "{rounded.preview}"}
  guide-card: {"backgroundColor": "{colors.card-dark}", "rounded": "{rounded.preview}"}
  metadata: {"rounded": "{rounded.metadata}", "padding": "2px 6px"}
---

# Design System: Agora Recipes

## Overview

**Creative North Star: "The Agora Website Directory"**

Recipes retains the Agora site header and opens directly into discovery below it. Agora Website typography, black surfaces, lightweight media previews, and official cyan signals pair with the supplied agent-ui liquid glass controls. Rounded search and static reflective selections provide the material character while independent foreground text stays clear.

This Recipes-scoped record preserves the website fonts, palette, and detail reader from Omja’s #68 and the media/discovery work from #70. The homepage retains the site header and navigation, followed by search with no introduction, hero, or ambient animation. Secondary navigation is also in the footer. The implemented CSS is normative where older website-directory guidance differed.

**Key Characteristics:**
- MiSans Latin, Agora website colors, and readable implementation guides.
- Search first, with static liquid glass controls and solid accessibility fallbacks.
- Real media, visible platform selection, and compact two-column phone browsing.

Provenance: [Omja #68](https://github.com/AgoraIO-Community/agora-recipes/pull/68) (`da99e784`) and [media/discovery #70](https://github.com/AgoraIO-Community/agora-recipes/pull/70) (`6afa3d9`). The restored [agent-ui material](components/agent-ui/README.md) comes from the user-supplied [`shczhen/agent-ui` source](https://github.com/shczhen/agent-ui/tree/9ca9d39be0037adf34a8984b1ab3a8383df0477c) (`9ca9d39be0037adf34a8984b1ab3a8383df0477c`). Its measured refraction map and separate RGB displacement are retained; pointer-following light and ambient animation are omitted. The [font attribution](public/font/README.md) records unmodified `misans@4.1.0/lib/Latin/` faces and the [MiSans license source](https://hyperos.mi.com/font/en/). Preserve per-asset media provenance when replacing files.

## Colors

### Primary
Official Signal is the action fill, detail-navigation logo, reader-tab underline, and graphic accent. Signal Ink carries text on that fill. Primary hover uses warm ink with dark text.

**The Signal Rule.** Keep official cyan for action fills, active rules, links, and graphics on the dark canvas; body copy remains neutral.

### Neutral
Canvas, card, and hover planes step upward from black. Muted ink distinguishes secondary information; decorative lines and stronger control boundaries have separate roles. The footer and code use their dark surface and ink tokens. System appearance does not change the site.

## Typography

**Display and Body Font:** MiSansLatin, with MiSans, Helvetica Neue, Arial, and sans-serif fallbacks. **Code Font:** system monospace. Local font faces retain source weights (380 and 520); UI styles request (400), (500), and (600), with font synthesis disabled.

Use regular weight and tight tracking for headings. Detail hero headings use headline; the homepage has no visible display heading above search. Media-card titles use (17px/1.35) at weight (500), becoming (16px/1.35) on phones. Detail section headings retain (20px/1.08) with (-0.035em) tracking. Card summaries are (13px/1.5), reducing to (12px) on phones; author and metadata text are (12px). Reader prose uses body with a maximum measure (68ch); code can extend wider. Avoid promoting existing uppercase technical metadata into a new decorative eyebrow convention.

## Layout

The shell uses a content width up to (1600px), plus gutters of (clamp(24px, 4vw, 64px)); phones at or below (640px) use (16px) gutters. Site navigation is (62px) tall, becoming (58px) at (900px), and remains visible on the homepage. Search follows immediately with phone top padding (6px). On larger screens its sticky offset tracks the measured header, including the mobile menu.

Search and topics stick beneath the site header on larger screens. On phones, only the site header stays fixed; search and filters scroll with the catalog. Phone search padding is (6px 0), with a (4px) gap before topics. Visible platforms follow; advanced facets expand inline. The media grid has three columns and (20px) gaps, changing directly to two columns at (640px), with (12px) horizontal and (16px) vertical gaps. The first six recommendations lead; a fading native disclosure previews subsequent real entries. Search/filter results bypass that initial truncation. Media stays (16:9).

Detail pages use a main column and (240–280px) sticky rail with a (clamp(24px, 3vw, 60px)) gap. At (900px), the layout becomes one column, capped at (688px), with the rail flowing after the content.

## Elevation & Depth

**The Matte Surface Rule.** Media entries show rounded previews with text directly below, without a large filled card plane. Guide entries and dialogs use matte tonal planes without drop shadows. Reserve refraction, specular rims, and restrained elevation for the supplied glass controls.

The detail header and sticky catalog bar use translucent backgrounds with (20px) blur and (1.15) saturation. Search uses its dark glass fill, a static specular rim, and low elevation. Chromium applies the original measured map with RGB displacement scales (-50/-47/-44), followed by (5px) blur and (1.4) saturation; the frosted path uses (7px) blur. Selected filters and sort use (8px) blur with (1.3) saturation. Foreground input text remains outside the filtered backdrop. Reduced transparency, forced colors, and unsupported backdrop filtering have readable solid fallbacks. Code has an inset signal rule (3px). Layer order is catalog bar (60), header (80), dialog overlay (100), dialog content (110), and focused skip link (150); dialogs must cover both sticky surfaces.

State changes use the shared easing, with (200ms) color transitions and (360ms) header changes. Fine-pointer action hover lifts (2px); media title links change color without moving. Homepage material has no pointer-following light, particle renderer, or autoplay. Glass reflections are static; only interaction states transition. Reduced motion shortens transitions and disables hover translation.

## Shapes

Search, selected filters, sorting, preview corners, guide cards, and continuation previews share a (12px) corner treatment. Shared website/detail controls, dialogs, and code retain technical (2px) corners. Metadata labels use (4px) corners. Hairlines and specular rims are (1px). Author avatars and video-play markers remain circular.

## Components

### Buttons and fields
Primary buttons pair Signal with Signal Ink; outline buttons use the control boundary and neutral text; text actions use the theme's signal-text role. Shared actions have (46px) minimum targets, (12px 20px) padding, and visible focus. Focus is a (2px) outline with (3px) offset. Search uses the restored liquid GlassSurface, (16px) input text, and independent foreground controls: height (50px), reducing to (46px) on phones. A visible outer focus outline replaces an input-level ring so it does not obscure the glass rim.

### Directory filters and metadata
**The Directory Control Rule.** Keep unselected filters quiet and transparent. Selected filters use rounded glass fill, a static highlight and low edge, a faint boundary, and readable neutral ink. Quiet tinted metadata labels remain noninteractive.

Quick topics and visible platform choices scroll horizontally when needed. Platforms and use cases match any selected value (OR); capabilities match every selected value (AND). Secondary platforms use More; type/use-case/capability controls expand inline. Has a demo and native sorting sit at the top of the expanded Filters panel. Result status and reset stay compact; on phones the default result status is visually hidden, then appears after search, filtering, or a sorting change. It remains available to screen readers. The empty state explains the mismatch and provides a clear reset.

### Media cards and continuation
Media bodies use desktop padding (10px 2px 0), reducing to (8px 2px 0) with a (4px) content gap on phones. Phone title/summary links size to their content rather than reserving a fixed-height text block. Guide entries retain (16px) internal spacing. Titles and summaries each clamp to two lines. Author links retain a (46px) target and a (20px) avatar with initials fallback. Show at most two metadata labels, reducing to one on phones. Video covers open on-site playback; non-video demo covers open the existing external demo; titles open the guide. Guide-only entries use the same text and author hierarchy without fabricated media. Native inline continuation reveals the remaining catalog in place.

### Navigation, dialogs, and reading
All pages retain the official wordmark and website header; desktop navigation becomes a keyboard-operable menu at (900px). The homepage places search directly below the header, with secondary navigation also in the footer. Appearance is fixed to dark without a selector. Video and help dialogs use the shared corrected layers, (46px) close targets, scrollable content, and focus restoration. Video includes native controls, setup notes, original-source and recipe links, optional HTTPS demo actions, and a load-failure fallback. Optional Demo links belong to recipe metadata independently of curation. Detail reading preserves true Rendered/Raw tabs, Shiki dark highlighting, copy feedback, horizontal code scrolling, and the narrower prose measure.

## Do's and Don'ts

### Do:
- **Do** render dark from the initial HTML, including controls, code, diagrams, and browser chrome, regardless of system or saved preferences.
- **Do** preserve real thumbnails, source attribution, setup notes, and truthful demo availability.
- **Do** keep visible focus, 46px control targets, keyboard disclosure, reduced-motion support, and solid glass fallbacks.
- **Do** keep all recipes in one catalog; search and filters must reach beyond the initial recommendations.

### Don't:
- **Don't** remove the site header or add an intro, hero, particles, ambient animation, pointer-following light, or theme selector.
- **Don't** add glass backgrounds behind recipe descriptions or the detail reader.
- **Don't** use the small-text companion blue as a replacement brand fill.
- **Don't** fabricate media, live demos, or a separate View all destination.
