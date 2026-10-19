---
name: Agora 2026
version: 1.2.0
updated: 2026-10-19
source: agora.io marketing site (2026 redesign), measured in a browser at 1440px and 390px
scope: >
  Visual spec for restyling Agora SSO (login, signup) and Agora Recipes so they
  match the agora.io website. Values are measured from the rendered site unless
  marked "recommendation".
brand_blue: "#00c2ff"   # the official Agora logo colour; the brand blue in BOTH themes
theme:
  site: { default: dark, user_toggle: false }       # agora.io itself (measured)
  sso: { default: dark, user_toggle: false }         # recommendation: SSO stays dark-only
  recipes:                                           # recommendation: owner direction
    default: system          # always follows prefers-color-scheme
    user_toggle: false       # owner direction: never restore theme-setting UI
    attribute: 'data-theme="dark|light" on <html>'
    storage_key: null         # legacy saved choices are ignored
colors:
  dark:                       # default page theme
    canvas: "#000000"         # page background
    raised: "#0a0a0a"         # panels, form shells, cards, menus
    card: "#1a1a1a"           # borderless interactive card plane
    card-hover: "#242424"
    ink: "#fcf9f8"            # primary text
    muted: "#b3b3b3"          # secondary text, labels, placeholders, inactive nav
    line: "#383838"           # hairlines, panel borders, dividers
    line-strong: "#626262"    # input borders, secondary-button border (3:1 control boundary)
    signal: "#00c2ff"         # primary action fill, links, active indicators, logo color
    signal-ink: "#04111d"     # text on signal fill
    signal-ink-hover: "#00111e"
    focus: "#a0faff"          # focus outline on dark surfaces
    accent-secondary: "#c46ffb"   # violet; rare, decorative only
    error: "#ff7b7b"          # the only approved error foreground (dark surfaces only)
  light:                      # full light theme (Recipes). Surfaces, ink and lines are the
                              # site's own light tokens; signal usage rules are a recommendation (§2.2)
    canvas: "#fcf9f8"         # page background (site light surface)
    raised: "#f1f0f0"         # panels, form shell, menus (site light-alt)
    card: "#f0f1f3"           # borderless interactive card plane (site light band)
    card-hover: "#e7e8eb"     # recommendation
    ink: "#0f0f0f"            # primary text
    muted: "#626262"          # secondary text, labels, placeholders
    line: "#d6d6d6"           # hairlines (decorative)
    line-strong: "#8a8a8a"    # input borders, secondary-button border (3:1 control boundary)
    signal: "#00c2ff"         # SAME official blue: fills, large graphics, rules, indicators, underlines
    signal-ink: "#04111d"     # text and icons on a signal fill (9.21:1)
    signal-hover-bg: "#04111d"    # recommendation: primary hover inverts to dark ink fill
    signal-hover-ink: "#fcf9f8"
    signal-text: "#075c9a"    # companion shade, TEXT ONLY (small blue text that must read as blue)
    focus-inner: "#04111d"    # recommendation: two-tone focus, dark ring carries the 3:1
    focus-outer: "#00c2ff"    #   brand ring outside it
    accent-secondary: "#9443c7"   # site's violet for light surfaces; rare, decorative only
    error: "#b42318"          # recommendation; the site has no light error colour
    input-bg: "#fcf9f8"
    header-scrolled-bg: "rgba(252, 249, 248, 0.96)"   # recommendation, mirrors dark
  light-band:                 # light panels inside a dark page ("chapter reset"), measured
    band: "#f0f1f3"
    surface: "#fcf9f8"
    surface-alt: "#f1f0f0"
    ink: "#0f0f0f"
    muted: "#626262"
    line: "#d6d6d6"
    line-strong: "#8a8a8a"
    link: "#075c9a"           # site value for links/focus on light
    action-site: "#168cff"    # what the site uses today; SSO/Recipes use signal #00c2ff + #04111d instead
  chrome:
    footer-bg: "#050708"
    footer-ink: "#f3f6f7"
    footer-muted: "rgba(232, 239, 243, 0.62)"   # ~#92979a on footer-bg
    footer-line: "rgba(236, 243, 247, 0.13)"
    header-scrolled-bg: "rgba(0, 0, 0, 0.96)"
  code:                       # GitHub Dark Default (Shiki "github-dark-default")
    bg: "#0a1114"             # #0a0a0a mixed with 4% signal
    border: "#2c2c2c"         # #383838 at 78% on black
    header-bg: "#12191c"      # ink at 3.5% over code bg
    accent-rule: "rgba(0, 194, 255, 0.52)"
    text: "#e6edf3"
    keyword: "#ff7b72"
    string: "#a5d6ff"
    constant: "#79c0ff"
    function: "#d2a8ff"
    variable: "#ffa657"
    tag: "#7ee787"
    comment: "#8b949e"
    inline-bg: "rgba(0, 194, 255, 0.10)"
    inline-ink: "#00c2ff"
  code-light:                 # GitHub Light Default (Shiki "github-light-default"), same structure
    bg: "#f2f7f8"             # recommendation: #fcf9f8 mixed with 4% signal (mirrors dark)
    border: "#d6d6d6"
    header-bg: "#eaeff0"      # ink at 3.5% over code bg
    header-ink: "#626262"
    accent-rule: "rgba(0, 194, 255, 0.52)"   # same signal rule; it is a graphic, not text
    text: "#1f2328"
    keyword: "#cf222e"
    string: "#0a3069"
    constant: "#0550ae"
    function: "#8250df"
    variable: "#953800"
    tag: "#116329"
    comment: "#57606a"        # recommendation: theme ships #6e7781 (4.21:1 on bg, fails)
    inline-bg: "rgba(0, 194, 255, 0.10)"
    inline-ink: "#075c9a"
  field:                      # hero graphic particle palette (§7.2), as "r, g, b"
    dark:                     # measured from the homepage
      neutral: "121, 148, 174"
      bright: "225, 237, 246"
      cyan: "72, 197, 225"
      violet: "139, 112, 228"
      composite: screen
    light:                    # recommendation (§7.2.7)
      neutral: "98, 98, 98"
      bright: "0, 194, 255"   # the official blue becomes the lead colour
      cyan: "0, 144, 189"     # #00c2ff at 74%
      deep: "7, 92, 154"      # #075c9a
      violet: "148, 67, 199"  # #9443c7
      composite: "source-over (dots), multiply (glows)"
hero_graphic:                 # §7.2; measured unless marked
  states: [voice, video, agent]
  site_cycle_ms: { voice: 2800, video: 2800, agent: 14400 }   # then replays; stops after any tab click
  sso_cycle_ms: { voice: 10000, agent: 10000, morph: 1200 }   # recommendation
  recipes_cycle_ms: { voice: 8000, video: 8000, agent: 12000 } # recommendation
  particles: { desktop: 7200, wide_over_1500: 9000, low_power: 5200, mobile_under_680: 3600, mobile_low_power: 2400 }
  dpr_cap: { default: 1.1, low_power: 0.9 }
  low_power: "hardwareConcurrency <= 4 or deviceMemory <= 4"
typography:
  families:
    sans: '"MiSansLatin", "MiSans", "Helvetica Neue", Arial, sans-serif'
    display: '"MiSansLatin", "MiSans", "Helvetica Neue", Arial, sans-serif'
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
  weights: { regular: 400, medium: 500, strong: 600 }
  rendering: { font-synthesis: none, text-rendering: geometricPrecision }
  scale:   # size desktop(1440) -> mobile(390); line-height; letter-spacing
    hero:    { size: "clamp(2.25rem, 3.055556vw, 2.75rem)", px: "44 -> 36", line-height: 0.94, letter-spacing: "-0.052em", weight: 400 }
    display: { size: "clamp(1.75rem, 2.361111vw, 2.125rem)", px: "34 -> 28", line-height: 0.98, letter-spacing: "-0.045em", weight: 400 }
    title:   { size: "1.25rem", px: 20, line-height: 1.08, letter-spacing: "-0.035em", weight: 400 }
    body:    { size: "1rem", px: 16, line-height: 1.58, letter-spacing: 0, weight: 400 }
    small:   { size: "0.8125rem", px: 13, line-height: 1.5, letter-spacing: 0, weight: 400 }
    label:   { size: "0.75rem", px: 12, line-height: 1.3, letter-spacing: "0.08em", weight: 500, transform: uppercase }
    button:  { size: "0.8125rem", px: 13, line-height: 1.5, letter-spacing: 0, weight: 500 }
    code:    { size: "0.8125rem", px: 13, line-height: 1.5, family: mono }
  minimum_visible_size: 12px
  reading_measure: { normal: 55ch, max: 68ch }
spacing:
  base: 4px
  scale: [4, 8, 12, 16, 20, 24, 32, 48, 64, 96]
  page-gutter: "clamp(24px, 4vw, 64px)"
  section-block: "clamp(76px, 7vw, 112px)"   # ~64px on phones
  heading-gap: "clamp(32px, 4vw, 52px)"
radii:
  none: 0          # inputs, form submit, listing cards, full-bleed
  technical: 2px   # buttons, panels, form shell, code blocks, search field
  editorial: 22px  # large feature panels only
  pill: 9999px     # floating assistant button, round icon buttons
borders:
  width: 1px
  hairline: "1px solid #383838"
  control: "1px solid #626262"
  light-hairline: "1px solid #d6d6d6"
shadows:
  default: none    # cards, buttons, inputs, panels are matte
  header-scrolled: "backdrop-filter: blur(20px) saturate(1.15)"   # no drop shadow
  code-accent: "inset 3px 0 0 rgba(0, 194, 255, 0.52)"
  header-cta-hover: "inset 0 -2px 0 #00c2ff"
motion:
  duration: { instant: 1ms, fast: 200ms, standard: 360ms, slow: 600ms, press: 100ms }
  easing:
    standard: "cubic-bezier(0.22, 0.61, 0.36, 1)"
    enter: "cubic-bezier(0.16, 1, 0.3, 1)"
    exit: "cubic-bezier(0.4, 0, 1, 1)"
  button-hover-lift: "translateY(-2px)"   # fine pointers only
  button-press: "scale(0.98)"
breakpoints:
  mobile: 640px          # max-width
  stack: 780px           # intermediate stacking
  nav: 900px             # navigation + major layout change
  header-compress: 1080px
  header-reflow: 1180px
layout:
  shell-max: 1600px
  content-inset: "max(page-gutter, 50vw - 800px)"
  header-height: { desktop: 62px, mobile: 58px }
  header-padding-x: { desktop: "content-inset (57.6px at 1440)", mobile: 16px }
  form-max: 720px
  narrative-column: 430px
  target-min: 46px
focus:
  width: 2px
  offset: 3px
  color-on-dark: "#a0faff"
  color-on-light: "#075c9a"   # site value (single colour)
  light-theme: "outline: 2px solid #04111d; outline-offset: 3px; box-shadow: 0 0 0 3px #00c2ff"   # recommendation
---

# Agora 2026 design spec (for SSO and Recipes)

## Current Recipes owner direction — do not regress

These requirements override older website measurements or recommendations when
styling Recipes:

- No light/dark/system switcher, theme menu, or appearance setting. Follow the
  device's `prefers-color-scheme`, including live changes. Ignore legacy manual
  preferences.
- The intro uses 45% of the usable viewport below the compact navigation.
  The recipe directory starts immediately afterward in the remaining space,
  with card titles visible on first load on common laptop and phone viewports.
  Never use a full-viewport hero or add a tall animation-only band on mobile.
- All interactive recipe filters use the website's plain-text directory controls:
  transparent background, no box or pill, and a 2px signal underline beneath
  selected choices. Card metadata tags are noninteractive and may retain their
  metadata treatment.
- Retain the website's Voice/Video/Agent formations without mode tabs. Both
  renderers use the intro's own dimensions and area-scaled particle budget.
  Light-mode particles must be clearly visible, with stronger blue depth and
  shared light-surface exposure in Canvas and WebGPU.

This document describes how the 2026 agora.io website looks and behaves. Use it
to restyle **Agora SSO** (login, signup) and **Agora Recipes** (index and
detail) so they read as part of the same product family. Every value was
measured from the rendered website at 1440px and 390px. Anything the website
doesn't have is labelled **Recommendation**.

Suggested CSS custom-property names use a `--ds-` prefix (for example
`--ds-signal`). They are only a suggestion; adopt them or map them to your own
tokens.

## 1. Overview and brand feel

- **Dark and technical.** The page ground is pure black (`#000000`). Panels
  sit one step up at `#0a0a0a`. Text is a warm off-white (`#fcf9f8`), not pure
  white. Secondary text is a neutral grey (`#b3b3b3`).
- **One loud color.** Cyan `#00c2ff` is the only saturated color in normal UI.
  It marks the primary action, links, active states, and the logo. Everything
  else is greyscale. Violet (`#c46ffb`) is rare and decorative.
- **Rectilinear and matte.** Buttons have a 2px radius; inputs and most cards
  have none. There are no drop shadows on cards or buttons. Structure comes from
  1px hairlines, a one-step surface change and whitespace.
- **Quiet, tight headlines.** Large type is regular weight (400) with strong
  negative tracking (−0.045em to −0.052em) and tight leading (0.94–0.98).
  Hierarchy comes from size and space, not boldness.
- **Instrument, not billboard.** Small uppercase labels with wide tracking
  (12px, +0.08em) and monospace metadata give an engineering feel. Motion is
  short and functional.
- **One signature texture.** A faint, slowly drifting field of cyan dots sits
  behind non-home pages (see §7.1). It's subtle enough that most screenshots
  read as flat black.
- **One signature graphic.** The homepage hero is a particle field that morphs
  between three states: an audio wave of 13 light shafts (Voice), a rigid grid
  of tiles (Video) and a two-layer particle sphere (Agent). §7.2 describes it so
  SSO and Recipes can recreate it without our code.
- **Themes.** The site is dark-only. **Recipes follows the device's light/dark
  preference with no theme selector**, and SSO stays dark (recommendation). The official blue `#00c2ff`
  is the brand blue in both themes; §2.2 explains how it's used on light.

## 2. Colors

### 2.1 Roles (dark, the default)

| Role | Hex | Suggested token | Use |
| --- | --- | --- | --- |
| Canvas | `#000000` | `--ds-canvas` | Page background |
| Raised | `#0a0a0a` | `--ds-raised` | Panels, form shell, cards, menus, banners, secondary-button hover fill |
| Card | `#1a1a1a` | `--ds-card` | Borderless interactive card that needs a visible plane |
| Card hover | `#242424` | `--ds-card-hover` | Hover for the above |
| Ink | `#fcf9f8` | `--ds-ink` | Headings, body on panels, input text |
| Muted | `#b3b3b3` | `--ds-muted` | Intro copy, labels, placeholders, inactive tabs and nav |
| Line | `#383838` | `--ds-line` | Panel borders, dividers, separators (decorative) |
| Line strong | `#626262` | `--ds-line-strong` | Input borders, secondary-button border |
| Signal | `#00c2ff` | `--ds-signal` | Primary button fill, links, active tab rule, required marker, checkbox accent |
| Signal ink | `#04111d` | `--ds-signal-ink` | Text and icons on a signal fill |
| Focus | `#a0faff` | `--ds-focus` | Focus outline on dark |
| Error | `#ff7b7b` | `--ds-error` | Error foreground on dark only (see §2.4) |

### 2.2 Light theme (Recipes)

The website itself has **no light theme or theme switch**. It does carry a
dormant light token set (canvas `#fcf9f8`, ink `#0f0f0f`, muted `#626262`,
lines `#d6d6d6` / `#8a8a8a`, link `#075c9a`, violet `#9443c7`), and it uses light
surfaces as deliberate "chapter reset" bands (for example the closing "Talk to
Us / Developer Resources" band on use-case pages). The Recipes light theme is
built from those measured tokens. **How the official blue behaves on light is a
recommendation** (owner direction), defined below.

| Role | Light hex | Dark hex | Suggested token |
| --- | --- | --- | --- |
| Canvas | `#fcf9f8` | `#000000` | `--ds-canvas` |
| Raised (panels, form shell, menus) | `#f1f0f0` | `#0a0a0a` | `--ds-raised` |
| Card plane | `#f0f1f3` | `#1a1a1a` | `--ds-card` |
| Card hover | `#e7e8eb` (rec.) | `#242424` | `--ds-card-hover` |
| Ink | `#0f0f0f` | `#fcf9f8` | `--ds-ink` |
| Muted | `#626262` | `#b3b3b3` | `--ds-muted` |
| Line (decorative) | `#d6d6d6` | `#383838` | `--ds-line` |
| Line strong (controls) | `#8a8a8a` | `#626262` | `--ds-line-strong` |
| Input background | `#fcf9f8` | `#000000` | `--ds-input-bg` |
| **Signal (official blue)** | **`#00c2ff`** | **`#00c2ff`** | `--ds-signal` |
| Signal ink (on signal fill) | `#04111d` | `#04111d` | `--ds-signal-ink` |
| Signal text (companion, text only) | `#075c9a` | n/a (use `#00c2ff`) | `--ds-signal-text` |
| Focus | two-tone, see below | `#a0faff` | `--ds-focus` |
| Error | `#b42318` (rec.) | `#ff7b7b` | `--ds-error` |
| Violet (decorative) | `#9443c7` | `#c46ffb` | `--ds-accent-secondary` |
| Header after scroll | `rgba(252,249,248,0.96)` + same blur (rec.) | `rgba(0,0,0,0.96)` | |

Define every component against these tokens and swap the set with
`html[data-theme="light"]`; components never hard-code a theme.

#### How the official blue reads on light

`#00c2ff` is only **1.97:1 on `#fcf9f8`** (2.07:1 on white, 1.82:1 on
`#f1f0f0`). It can't carry text on light, but it still has to be the colour
people see as "Agora". The rule: **on light, the official blue is a fill, a
graphic or a line, never the letters.**

| Use on light | Spec | Contrast |
| --- | --- | --- |
| Primary button / form submit | bg `#00c2ff`, text `#04111d` (same as dark). Hover: bg `#04111d`, text `#fcf9f8` (rec.) | 9.21 / 18.17 |
| Header CTA (outline signal) | 1px `#00c2ff` border is not enough on light; use a **filled** signal CTA, or ink text with a 2px `#00c2ff` bottom rule (rec.) | text 18.30 |
| Prose and form links | text `#0f0f0f`, `text-decoration: underline 2px #00c2ff`, offset 4px. Hover: text and underline `#075c9a` | 18.30 (text) |
| Small blue text that must look blue (required `*`, "VIEW RECIPE" mono action, inline code, active filter label) | `#075c9a` | 6.67 on canvas, 6.14 on raised |
| Active tab / current nav | ink text + 2px `#00c2ff` bottom rule (state is also in `aria-selected`/`aria-current` and the muted→ink text change) | ink 18.30 vs muted 5.82 |
| Checkbox / radio | `accent-color: #00c2ff`; the browser draws the check in dark ink; keep the 1px `#8a8a8a` box | box 3.30 |
| Input focus | border `#00c2ff` plus the two-tone focus ring | ring 18.17 |
| Rules, indicators, the code block's left rule, selected-chip border, live dots, the 3px alert rule | `#00c2ff` as is | decorative / paired with text |
| Large graphics (hero particles, wave, sphere) | lead colour `#00c2ff` (§7.2.7) | decorative |
| Logo | the blue `#00c2ff` wordmark, unchanged (logotypes are exempt from contrast rules) | n/a |

**The companion shade `#075c9a`** (the site's own light-surface link colour) is
allowed **only for text and text-sized glyphs** where blue meaning has to come
through the letters. Never use it as a button fill, a large graphic, a rule or
a replacement brand colour; `#00c2ff` keeps those jobs. Don't introduce
`#168cff` or any other blue on SSO or Recipes.

**Focus on light (recommendation):** a two-tone ring, so the brand blue shows
and the dark ring carries the contrast:
`outline: 2px solid #04111d; outline-offset: 3px; box-shadow: 0 0 0 3px #00c2ff`.
The dark ring is 18.17:1 against the canvas. If `box-shadow` is already used,
fall back to the site's single-colour `outline: 2px solid #075c9a`.

**Light chapter bands on a dark page** (the site's existing pattern) use the
same rules: `#00c2ff` fill with `#04111d` text for the primary action, ink text
with a blue underline or `#075c9a` for links.

### 2.3 Usage rules

1. SSO and the site stay dark. On a dark page, use a light band at most once,
   as a deliberate break. Never set body text in signal cyan, in either theme.
2. Each view gets **one** filled signal button. Everything else is a secondary
   (outlined) button or a text link.
3. On light (theme or band), `#00c2ff` stays the fill and graphic colour; text
   that must read blue uses `#075c9a`; focus uses the two-tone ring (§2.2).
4. Gradients aren't used for buttons, cards, form controls or text. See §7 for
   the few allowed atmospheric effects.
5. Never show meaning through color alone. Pair states with text or an icon.

### 2.4 Status colors

The website has no general success, warning or info palette. Functional status
colors are gated by the Agora design owner. The only approved status color is
**error `#ff7b7b`**, a foreground on dark surfaces (`#000`, `#0a0a0a`). It's
used for a destructive voice-session control. A filled variant `#d93636` with
white text (4.63:1) exists for that single control only.

**Recommendation for SSO and Recipes:** use `#ff7b7b` for error text, error
icons and the invalid-field border on dark surfaces. Don't introduce green or
amber. Express success in copy plus ink or signal color.

**Recommendation for the Recipes light theme:** the site has no light error
colour (`#ff7b7b` is 2.39:1 on `#fcf9f8` and fails; the site's filled
`#d93636` is 4.42:1 as text and also fails). Use `#b42318` for error text,
icons and the invalid-field border on light (6.28:1 on canvas, 5.78:1 on
raised).

### 2.5 Contrast pairs (WCAG 2.1, all measured)

**Dark (site, SSO, Recipes dark):**

| Foreground | Background | Ratio | Passes |
| --- | --- | --- | --- |
| `#fcf9f8` ink | `#000000` / `#0a0a0a` / `#1a1a1a` | 20.04 / 18.90 / 16.61 | AA, AAA |
| `#b3b3b3` muted | `#000000` / `#0a0a0a` / `#1a1a1a` | 10.02 / 9.44 / 8.30 | AA, AAA |
| `#00c2ff` signal | `#000000` / `#0a0a0a` / `#1a1a1a` | 10.16 / 9.58 / 8.42 | AA, AAA |
| `#04111d` | `#00c2ff` (primary button) | 9.21 | AA, AAA |
| `#00111e` | `#fcf9f8` (primary hover) | 18.24 | AA, AAA |
| `#a0faff` focus | `#000000` / `#0a0a0a` | 17.61 / 16.60 | ≥3:1 non-text |
| `#626262` control border | `#000000` | 3.44 | ≥3:1 non-text |
| `#383838` hairline | `#000000` | 1.79 | Decorative only; don't use it as the only boundary of a control |
| `#ff7b7b` error | `#000000` / `#0a0a0a` | 8.37 / 7.89 | AA, AAA |
| `#c46ffb` violet | `#000000` | 7.01 | AA |
| `#0f0f0f` | `#fcf9f8` | 18.30 | AA, AAA |
| `#626262` | `#fcf9f8` / `#f0f1f3` | 5.82 / 5.40 | AA |
| `#075c9a` | `#fcf9f8` / `#f0f1f3` | 6.67 / 6.18 | AA |
| `#04111d` | `#168cff` (site light-band button; not used by SSO/Recipes) | 5.65 | AA |
| `#fcf9f8` | `#075c9a` | 6.67 | AA |
| Footer muted (`#92979a` effective) | `#050708` | 6.84 | AA |
| Code text `#e6edf3` | `#0a1114` | 16.11 | AA, AAA |
| Syntax colors (lowest: comment `#8b949e`) | `#0a1114` | 6.19–12.39 | AA |

**Light (Recipes light theme; computed from the token values):**

| Foreground | Background | Ratio | Passes |
| --- | --- | --- | --- |
| `#0f0f0f` ink | `#fcf9f8` / `#f1f0f0` / `#f0f1f3` | 18.30 / 16.85 / 16.96 | AA, AAA |
| `#626262` muted | `#fcf9f8` / `#f1f0f0` / `#f0f1f3` | 5.82 / 5.36 / 5.40 | AA |
| `#04111d` | `#00c2ff` (primary button, light and dark) | 9.21 | AA, AAA |
| `#fcf9f8` | `#04111d` (primary hover on light, rec.) | 18.17 | AA, AAA |
| `#075c9a` signal text | `#fcf9f8` / `#f1f0f0` / `#f0f1f3` | 6.67 / 6.14 / 6.18 | AA |
| `#075c9a` inline code | `#e3f4f9` (10% signal over canvas) | 6.18 | AA |
| **`#00c2ff` signal** | `#fcf9f8` / `#ffffff` / `#f1f0f0` | **1.97 / 2.07 / 1.82** | **Fails as text and as a sole non-text boundary.** Fills, graphics, rules and underlines only |
| `#04111d` focus ring | `#fcf9f8` / `#f1f0f0` | 18.17 / 16.74 | ≥3:1 non-text |
| `#8a8a8a` control border | `#fcf9f8` / `#f1f0f0` | 3.30 / 3.04 | ≥3:1 non-text (put inputs on canvas or raised only) |
| `#d6d6d6` hairline | `#fcf9f8` | 1.39 | Decorative only |
| `#b42318` error (rec.) | `#fcf9f8` / `#f1f0f0` | 6.28 / 5.78 | AA |
| `#9443c7` violet | `#fcf9f8` / `#f1f0f0` | 5.16 / 4.75 | AA (decorative use only) |
| Code text `#1f2328` | `#f2f7f8` | 14.62 | AA, AAA |
| Light syntax colors (lowest: function `#8250df`) | `#f2f7f8` | 4.67–11.85 | AA |
| Code comment `#57606a` (rec.; theme's `#6e7781` is 4.21) | `#f2f7f8` | 5.91 | AA |
| Code strip label `#626262` | `#eaeff0` | 5.22 | AA |

## 3. Typography

### 3.1 Fonts and loading

- **Sans and display: MiSans Latin** (Xiaomi). The site self-hosts the
  subsetted WOFF2 files from the npm package `misans` (v4.1.0, files under
  `lib/Latin/`). Those files and their CSS are published under Apache-2.0. The
  **font itself** is under Xiaomi's *MiSans Font IP License Agreement*. It's
  free and royalty-free, including commercial use, on three conditions: you
  credit MiSans in the product, you don't modify or re-engineer the font, and
  you don't redistribute or sell the font files on their own. Have legal
  confirm the attribution wording. Source: hyperos.mi.com/font.
- **Mono: system stack.** No web font is used:
  `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`.
- **Fallback stack:** `"MiSansLatin", "MiSans", "Helvetica Neue", Arial, sans-serif`.

**Weight mapping (important for matching).** The package declares unusual
`font-weight` values: Regular = 330, Medium = 380, Semibold = 520. The site's
CSS asks for 400, 500 and 600. Under standard font matching, **400 and 500
both render the Medium file (380), and 600 (and 700) render Semibold (520)**.
The browser loads only those two faces. To look identical, copy the site's
declarations exactly:

```css
@font-face { font-family: MiSansLatin; font-style: normal; font-weight: 380;
  font-display: swap; src: url(/fonts/MiSansLatin-Medium.woff2) format("woff2"); }
@font-face { font-family: MiSansLatin; font-style: normal; font-weight: 520;
  font-display: swap; src: url(/fonts/MiSansLatin-Semibold.woff2) format("woff2"); }
/* The site also declares Regular at 330, but it never renders at 400/500/600. */
```

Then use only `font-weight: 400 | 500 | 600` in components. In practice, 400
and 500 look the same, so emphasis comes from color and size, and 600 is the
only visibly heavier weight. Preload `MiSansLatin-Medium.woff2` on auth pages.
Set `font-synthesis: none` so browsers never fake bold or italic.

### 3.2 Type scale

These are the page-content roles. At 1440px, Hero is 44px and Display is 34px.
At 390px they shrink to 36px and 28px. The other roles are fixed.

| Role | Size | Line height | Tracking | Weight | Color | Use |
| --- | --- | --- | --- | --- | --- | --- |
| Hero | `clamp(2.25rem, 3.055556vw, 2.75rem)` | 0.94 | −0.052em | 400 | ink | One H1 per page |
| Display | `clamp(1.75rem, 2.361111vw, 2.125rem)` | 0.98 | −0.045em | 400 | ink | Section H2 |
| Title | 20px | 1.08 | −0.035em | 400 | ink | Card and panel headings, article H2/H3 |
| Body | 16px | 1.58 (25.28px) | 0 | 400 | muted (intro) / ink-82% (article) | Paragraphs, inputs |
| Small | 13px | 1.5 (19.5px) | 0 | 400 | muted | Card descriptions, nav, help text, consent text |
| Button | 13px | 1.5 | 0 | 500 | per variant | All buttons and button-like links |
| Label / eyebrow | 12px | 1.3 | +0.08em, UPPERCASE | 500 | muted | Form labels, eyebrows, section labels, status text |
| Mono meta | 12px mono | 1.3 | +0.13em, UPPERCASE | 500 | muted | Dates, categories, card meta |
| Mono action | 12px mono | 1.3 | +0.10em, UPPERCASE | 600 | signal | "Read article" style card affordance |
| Code | 13px mono | 1.5 | 0 | 400 | `#e6edf3` | Code blocks |

Rules:

- No visible text below **12px**, anywhere.
- Headings are weight 400. Don't bold headlines.
- Use 600 only for real emphasis (`strong`). Never load or use weights above 600.
- Long reading text is capped at **68ch** (about 690px at 16px). Normal prose
  targets 55ch.
- Descriptive sentences end with a period. Button labels, titles and labels
  don't.
- Mono is only for code, commands, dates, technical metadata and tiny labels.
  Never use it for body copy.

## 4. Layout and spacing

- **Spacing scale (4px base):** 4, 8, 12, 16, 20, 24, 32, 48, 64, 96.
- **Shell:** max 1600px. The horizontal inset is
  `max(clamp(24px, 4vw, 64px), 50vw − 800px)`, which is 57.6px at 1440px. At
  390px, content sits 24px from the edge; the header uses 16px.
- **Section rhythm:** `clamp(76px, 7vw, 112px)` vertical padding, about 64px on
  phones. Heading-to-content gap: `clamp(32px, 4vw, 52px)`.
- **Grids:** card grids use a 20px gap. They run 3 columns, then 2 below
  roughly 1100px, then 1 at 640px. Two-column hero/form layouts stack at 900px.
- **Form page geometry** (from the website's contact page): a narrative column
  up to 430px plus a form column up to 720px, with a
  `clamp(56px, 7vw, 128px)` gap. They stack at 900px with a 56px gap. Top
  padding is 154px desktop, 132px when stacked, 108px on mobile. Bottom
  padding is 96px desktop, 64px mobile.
- **Article geometry:** a 3-column grid of `minmax(136px, 200px)` contents rail,
  then `1fr` content, then `minmax(72px, 112px)` share rail, with
  `clamp(24px, 3vw, 60px)` column gap. Prose is capped at 68ch and centred.
  Code blocks may break out wider, up to 960px (60rem). Below 900px it becomes
  one column, max 640px.
- **Breakpoints:** 640px (mobile), 780px (intermediate stacking), 900px
  (navigation and major layout), plus 1080px and 1180px for header density only.
- Layout height is intrinsic on mobile. No horizontal scrolling at any width.

## 5. Components

The states below are measured unless marked as a recommendation. Every
interactive element has an effective hit area of at least **46×46px**.

### 5.1 Buttons

Shared base: `display:inline-flex; align-items:center; justify-content:center;
gap:12px; min-height:46px; padding:12px 20px; border:1px solid transparent;
border-radius:2px; font:500 13px/1.5 MiSansLatin…; white-space:nowrap;
text-decoration:none`. Transition: `background 200ms ease, color 200ms ease,
border-color 200ms ease, transform 240ms cubic-bezier(0.16,1,0.3,1)`.

| Variant | Default | Hover | Focus-visible | Active | Disabled |
| --- | --- | --- | --- | --- | --- |
| **Primary** | bg `#00c2ff`, text `#04111d` | bg `#fcf9f8`, text `#00111e`, `translateY(-2px)` | `outline:2px solid #a0faff; outline-offset:3px` | `scale(0.98)`, 100ms | opacity 0.52, `cursor:not-allowed` |
| **Secondary** | transparent, 1px `#626262` border, text `#fcf9f8` | border `#fcf9f8`, bg `#0a0a0a`, lift 2px | same outline | `scale(0.98)` | opacity 0.52 |
| **Tertiary / text** | no border, `padding-inline:0`, text `#b3b3b3` | text `#fcf9f8` (underline optional) | same outline | `scale(0.98)` | opacity 0.52 |
| **Text-accent link** | text `#00c2ff`, 1px underline at 65% opacity, offset 4px | text `#fcf9f8`, underline full color | same outline | none | none |
| **Header CTA (outline signal)** | transparent, 1px `#00c2ff` border, text `#00c2ff`, padding `0 16px`, height 46px | text `#fcf9f8`, bg `rgba(0,194,255,0.10)`, `inset 0 -2px 0 #00c2ff`, lift 1px | same outline | none | none |
| **Form submit (full width)** | width 100%, radius **0**, bg and border `#00c2ff`, text `#000`, padding `8px 24px` | bg `#fcf9f8`, text `#000` | same outline | bg `#0a0a0a`, text `#fcf9f8` | opacity 0.52 |

Notes:

- The hover lift only applies under `@media (hover:hover) and (pointer:fine)`.
- Trailing arrow icons nudge on hover: `translateX(3px)` for internal links,
  `translate(2px,-2px)` for external links (240ms, enter easing).
- Under `prefers-reduced-motion: reduce`, buttons get no transform and no
  transition.
- On a light surface (Recipes light theme or a light band), primary keeps bg
  `#00c2ff` with text `#04111d`; hover is bg `#04111d` with text `#fcf9f8`
  (recommendation; the site's own light bands use `#168cff`, which SSO and
  Recipes don't adopt). Secondary uses border `#8a8a8a`, text `#0f0f0f`, hover
  border `#0f0f0f` and bg `#f1f0f0`. Text-accent links follow §2.2 (ink text,
  2px `#00c2ff` underline). Focus is the two-tone ring (§2.2).
- **Loading (recommendation):** keep the label, add a 16px spinner (§5.15)
  before it, set `aria-busy="true"`, and block repeat clicks without dimming
  the button.

### 5.2 Text inputs

| Property | Value |
| --- | --- |
| Box | `width:100%; min-height:46px; padding:8px 16px; border:1px solid #626262; border-radius:0; background:#000; appearance:none` |
| Text | 16px/1.58 MiSansLatin 400, `#fcf9f8`, `caret-color:#00c2ff` |
| Placeholder | `#b3b3b3`, opacity 1 |
| Hover | unchanged |
| Focus | border `#00c2ff`, background `#0a0a0a`, plus `outline:2px solid #a0faff; outline-offset:3px` on `:focus-visible` |
| Invalid | **Recommendation:** border `#ff7b7b`, `aria-invalid="true"`, and the error text below (§5.6) |
| Disabled | opacity 0.52, `cursor:not-allowed` |
| Autofill | `-webkit-text-fill-color:#fcf9f8; box-shadow:0 0 0 1000px #000 inset` |
| Textarea | min-height 8rem (128px), `padding-block:12px`, `resize:vertical` |
| Transition | border-color and background-color, 200ms `cubic-bezier(0.22,0.61,0.36,1)` |

Inputs are 16px on every breakpoint, which also prevents iOS zoom on focus. Set
`color-scheme: dark` on the form (`color-scheme: light` under the Recipes light
theme).

**Light theme (Recipes, recommendation):** bg `#fcf9f8`, border `#8a8a8a`,
text `#0f0f0f`, placeholder `#626262`, `caret-color:#00c2ff`; focus border
`#00c2ff`, bg `#ffffff`, two-tone ring; invalid border `#b42318`; autofill
`-webkit-text-fill-color:#0f0f0f; box-shadow:0 0 0 1000px #fcf9f8 inset`.

**Password reveal (recommendation):** a 46×46 icon button inside the right
edge (add 48px right padding to the input). Use a Lucide `eye` / `eye-off`
icon, 20px, `#b3b3b3`, turning `#fcf9f8` on hover. Give it
`aria-label="Show password"` and `aria-pressed`.

### 5.3 Select

Same box as the text input, plus `padding-right:48px`, with a CSS chevron made
of two 5×5px triangles in `#b3b3b3`:

```css
background-image:
  linear-gradient(45deg, transparent 50%, #b3b3b3 50%),
  linear-gradient(135deg, #b3b3b3 50%, transparent 50%);
background-position: calc(100% - 19px) 50%, calc(100% - 14px) 50%;
background-size: 5px 5px, 5px 5px;
background-repeat: no-repeat;
```

Use the native `<select>` so keyboard and mobile pickers work. For a long
country list, a native select is acceptable. If you build a searchable combobox
instead, style its listbox as a panel (§5.8) with 46px rows.

### 5.4 Checkbox and radio

Native inputs, 18×18px, with `accent-color:#00c2ff`. The checkmark is drawn by
the browser. The label row is a grid of `auto 1fr`, 12px gap, items centred,
min-height 46px, with the whole row clickable. Label text is 13px/1.5, 400,
`#b3b3b3`, sentence case. Links inside are `#00c2ff` with a 4px underline
offset. Focus-visible uses the standard outline (2px `#a0faff`, 3px offset).
Disabled uses opacity 0.52.

### 5.5 Form labels

12px, 500 weight, 1.3 line height, letter-spacing 0.08em, UPPERCASE,
`#b3b3b3`, 8px below to the control. The required marker is an `*` in
`#00c2ff` directly after the text. Always use a visible `<label for>`; never
rely on placeholder-only fields.

### 5.6 Helper and error text

- **Helper:** 13px/1.5, `#b3b3b3`, 8px below the control.
- **Error (site):** 13px/1.5, 500 weight, sentence case, 8px below the control.
  The site colors it ink `#fcf9f8`.
- **Error (recommendation for SSO):** keep that size and position, color it
  `#ff7b7b`, and put a Lucide `circle-alert` icon (16px) before the text.
  Connect it with `aria-describedby`. On submit, move focus to the first
  invalid field. For a server error (wrong password), use an inline alert
  (§5.7) above the form.

### 5.7 Inline alerts and banners

The site has two patterns. Use them for SSO messages ("Check your email",
"Session expired") and Recipes notices.

- **Status panel** (inside a form shell): padding 28px (20px mobile), a
  `display:grid; gap:12px` stack. It has a Title (20px ink), Body (16px
  `#b3b3b3`, max 55ch), an optional inline link (`#00c2ff`, underlined, 4px
  offset), and an optional secondary action. The action is min-height 46px,
  1px `#626262` border, `#000` background, 13px/500 ink text, padding `0 20px`,
  with the border turning `#00c2ff` on hover.
- **Floating banner** (the cookie notice): `width:min(560px, 100vw − 32px)`,
  pinned 16px from the bottom-left. Padding `12px 16px`, 1px `#626262` border,
  2px radius, `#0a0a0a` background, no shadow, 13px/1.5 text in `#b3b3b3`. The
  close button is 46×46 in the top-right corner. Actions form a 2-column grid
  with an 8px gap.
- **Recommendation for state color:** add a 3px left rule
  (`box-shadow: inset 3px 0 0 <color>`). Use `#00c2ff` for info and `#ff7b7b`
  for errors. Use `role="status"` for info and `role="alert"` for errors.

### 5.8 Cards and panels

| Variant | Spec |
| --- | --- |
| **Form shell / panel** | bg `#0a0a0a`, 1px `#383838` border, radius 2px. Optional toolbar row: min-height 46px, `padding:10px 20px`, bottom border 1px `#383838`, title 13px/500 ink on the left, status on the right (6px round dot `#b3b3b3` plus 12px uppercase 0.08em label). Body padding 28px (20px mobile). |
| **Listing card** (blog) | bg `#0a0a0a`, radius 0, no border, full card is one link. Optional media on top with `object-fit:cover`. Content stack: mono meta row (category on the left, date on the right), Title 20px ink, description 13px `#b3b3b3`, then the mono action label ("READ ARTICLE", 12px, 600, 0.10em, `#00c2ff`) pushed to the bottom with 24px top padding. Hover: lifts about 3px over 200ms (standard easing); no hover on touch. |
| **Feature panel** | bg `#0a0a0a`, 1px `#383838` border, **22px** radius, `overflow:hidden`. Use only for one large featured group per page. |
| **Light card** | bg `#fcf9f8` on a `#f0f1f3` band, 1px `#d6d6d6` border, radius 0, padding 32px, Title 20px `#0f0f0f`, body 16px `#626262`. |

Don't nest bordered boxes inside bordered boxes. A card doesn't also need
borders around each child.

### 5.9 Links

- **In prose:** `#00c2ff`, 500 weight in articles (400 in legal text). Legal
  and form text links are underlined with a 4px offset. Article links show no
  underline at rest. Hover changes color to `#fcf9f8`.
- **Navigation-style:** `#b3b3b3`, turning `#fcf9f8` on hover over 200ms. No
  underline.
- Mark external links with a trailing Lucide `arrow-up-right` (16px). Opening a
  new tab must be announced in the accessible name.

### 5.10 Header / top bar

| Property | Desktop | Mobile (≤900px) |
| --- | --- | --- |
| Height | 62px | 58px |
| Position | `sticky; top:0; z-index:80` | same |
| Padding | content inset (57.6px at 1440) | 16px |
| Layout | grid `1fr auto 1fr`: logo, centred nav, right actions | logo, actions, 46px menu button |
| Background at top | transparent, transparent bottom border | same |
| Background after scroll | `rgba(0,0,0,0.96)`, `backdrop-filter: blur(20px) saturate(1.15)`, bottom border 1px `#383838` | same |
| Nav items | 13px, `#b3b3b3`, gap `clamp(18px, 2.2vw, 34px)`, 46px tall; hover/current `#fcf9f8` | in the menu |
| Right actions | text actions 13px/500 `rgba(238,244,247,0.84)`, padding `0 12px`, 46px tall, 4px gap; then the outline-signal CTA (§5.1) | |

**Logo:** the official Agora wordmark, single color `#00c2ff`, SVG with a
1000×342.7 viewBox. It's **86px wide** (about 29.5px tall) in the header and
104px wide in the footer, vertically centred in a 46px hit area that links
home. Use only the supplied asset; never recreate it in type. Don't recolor it
grey. On light surfaces (the Recipes light theme), keep the same blue
`#00c2ff` wordmark: it is the official colour, and logotypes are exempt from
text-contrast rules.

**Recommendation (SSO header):** logo on the left linking to agora.io. On the
right, a single text link ("Docs" or "agora.io"). No full site navigation, no
search. **Recommendation (Recipes header):** logo plus a 12px muted
"/ Recipes" label. Right side: Docs and GitHub as text actions, then
**one** outline-signal CTA ("Get started"). "Submit a recipe" becomes a text
action. Do not add a theme control; appearance follows the device (§5.17).

### 5.11 Footer (minimal variant)

The site footer: bg `#050708`, top border 1px `rgba(236,243,247,0.13)`,
padding `72px <inset> 26px` (16px sides on mobile).

**Recommendation (minimal variant for SSO and Recipes):** drop the link
columns and keep the legal row and meta row.

- **Legal row:** links in 13px, `rgba(232,239,243,0.62)`, with
  `font-variant-caps: small-caps`. Each is 46px tall, centred, with a 28px
  column gap (20px mobile) and a top border 1px `rgba(236,243,247,0.13)`
  with 20px padding above. Hover is `#ffffff`. Links: Privacy Policy, Cookie
  Policy, Terms of Service, Acceptable Use Policy (all on agora.io).
- **Meta row:** min-height 46px, mono 12px/1.3,
  `rgba(232,239,243,0.62)`, with "Copyright © 2026 Agora | All rights
  reserved." on the left. It stacks on mobile with an 8px gap.
- **Group headings** (if you keep columns): 12px uppercase, 0.08em, `#ffffff`.

### 5.12 Tabs

Underline tabs, measured on the blog category bar:

- **Bar:** height 62px, items are links or buttons 13px/500. The bar has
  1px `#383838` borders top and bottom, full width.
- **Inactive:** `#b3b3b3`, `border-bottom: 2px solid transparent`.
- **Hover:** `#fcf9f8`.
- **Active:** `#fcf9f8`, `border-bottom: 2px solid #00c2ff`. Use
  `aria-current="page"` for link-tabs, or `aria-selected="true"` for true tabs.
- **Focus-visible:** 2px `#a0faff` outline, 3px offset.
- True tabs follow the ARIA tabs pattern (arrow keys, Home/End, `tabpanel`
  linkage). They never autoplay.
- On mobile, scroll the bar horizontally; don't wrap it into two lines.

### 5.13 Code blocks (key for Recipes)

**Block** (measured on articles):

```css
pre.code {
  position: relative;
  margin: 28px 0;
  padding: 52px 20px 18px;          /* 52px top leaves room for the header strip */
  background: #0a1114;
  border: 1px solid #2c2c2c;
  border-radius: 2px;
  box-shadow: inset 3px 0 0 rgba(0, 194, 255, 0.52);   /* signal rule on the left */
  font: 400 13px/1.5 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: #e6edf3;
  overflow-x: auto;
}
pre.code::before {                  /* language strip */
  content: attr(data-language);     /* rendered uppercase, e.g. "TSX" */
  position: absolute; inset: 0 0 auto;
  height: 34px; display: flex; align-items: center; padding-inline: 16px;
  border-bottom: 1px solid #2c2c2c; background: #12191c;
  font: 500 12px/1.3 ui-monospace, monospace; letter-spacing: 0.08em; color: #b3b3b3;
}
pre.code code { display: block; width: max-content; min-width: 100%; }
```

- **Syntax theme:** GitHub Dark Default (Shiki `github-dark-default`). Colors:
  text `#e6edf3`, keyword `#ff7b72`, string `#a5d6ff`, constant/number/attr
  `#79c0ff`, function `#d2a8ff`, variable/parameter `#ffa657`, tag
  `#7ee787`, comment `#8b949e`.
- **Inline code:** mono at the surrounding size, `#00c2ff` on
  `rgba(0,194,255,0.10)`, padding `2px 5px`, radius 2px. On light: `#075c9a`
  on the same 10% signal tint (6.18:1).
- **Light theme (Recipes, recommendation):** same block structure with
  GitHub Light Default (Shiki `github-light-default`): bg `#f2f7f8` (canvas
  mixed with 4% signal), border `#d6d6d6`, strip bg `#eaeff0` with a
  `#626262` label, the same `rgba(0,194,255,0.52)` left rule. Colors: text
  `#1f2328`, keyword `#cf222e`, string `#0a3069`, constant `#0550ae`, function
  `#8250df`, variable `#953800`, tag `#116329`, comment **`#57606a`**
  (override; the theme's `#6e7781` is 4.21:1 on this bg). Use Shiki's
  dual-theme output (`themes: { light, dark }`, CSS variables) so a theme
  switch recolours code without re-highlighting.
- **Copy control (recommendation, based on the site's "Copy code" text
  button):** a text-variant button in the strip's right end. 13px/500
  `#b3b3b3`, hover `#fcf9f8`, Lucide `copy` icon 16px, 46px target. On success,
  swap to `check` and the label "Copied" for 2s, and announce it through an
  `aria-live="polite"` region. Copy only on an explicit click.
- **Command/terminal blocks:** same style, with a strip label like "SHELL"
  or "AGORA CLI". Don't fake window chrome (traffic-light dots).
- **Multi-file or multi-language:** put tabs (§5.12, 46px tall, 13px) in the
  strip instead of the language label. The copied text must match the visible
  tab.
- Long lines scroll horizontally. Never wrap them in code. Scrollbars are thin,
  10px, with a `#626262` thumb at 72% on a `#383838` track at 28%. The thumb
  turns signal on hover and active.

### 5.14 Tags, badges and labels

The website doesn't use rounded chips. Metadata is set as text:

- **Eyebrow / category:** 12px uppercase, 0.08em, 500, `#b3b3b3`. When it
  marks live or active state, add a 6px dot in `#00c2ff`.
- **Mono meta:** 12px mono uppercase, 0.13em, `#b3b3b3`, for things like
  "DEVELOPER", "OCTOBER 11, 2026", "INTERMEDIATE".
- **Metadata tag (noninteractive) for Recipes:** inline-flex,
  min-height 28px (inside a 46px hit row when interactive), padding `4px 10px`,
  1px `#383838` border, radius 2px, transparent background, 12px/1.3 `#b3b3b3`
  (sentence case for tags, uppercase mono for levels). These labels have no
  interactive or selected state. No pill radius or filled colors.
  Interactive filters do not use chips: use plain text, a
  transparent background, and a 2px signal underline when selected (§11.3).

### 5.15 Loading: spinner and skeleton

Not present on the website. **Recommendation:**

- **Spinner:** a 16px (inline) or 24px (page) ring, 2px stroke. The track is
  `#383838`, the arc is `#00c2ff`, rotating at 800ms linear. Under reduced
  motion, swap it for static text such as "Loading…".
- **Skeleton:** blocks in `#1a1a1a` with radius 0, matching the final geometry.
  Optional shimmer: a `#242424` sweep at 1200ms, disabled under reduced motion.
  Prefer the skeleton for the Recipes grid and the spinner for SSO buttons.

### 5.16 Modal / dialog

The site's assistant opens dialogs above everything else (layer order: dialog
120, header 100, header menus 84, floating dock 80). Visual specs below are a
**recommendation** built from the panel and banner tokens:

- **Backdrop:** `rgba(0,0,0,0.72)`, no blur needed.
- **Panel:** `width:min(560px, 100vw − 32px)`, bg `#0a0a0a`, 1px `#626262`
  border, radius 2px, no shadow. Header row: Title 20px plus a 46×46 close
  button (Lucide `x`, 20px). Body padding 24px. Actions are right-aligned, one
  primary plus one secondary or text action, with an 8px gap.
- **Behavior:** trap focus, restore focus on close, close on Escape, make the
  background inert, and label it with `aria-labelledby`. On mobile, use full
  width with 16px margins.

### 5.17 Automatic appearance (Recipes only; no theme selector)

**Owner requirement:** do not add a light/dark/system button, menu, or setting.
Recipes always follows the device preference. SSO remains dark-only.

| Property | Spec |
| --- | --- |
| Resolution | Read `matchMedia('(prefers-color-scheme: dark)')` and subscribe to its live `change` events |
| Persistence | Do not read or write a manual preference. Ignore legacy saved theme choices |
| Applying | Set `data-theme="light|dark"` and `style.colorScheme` on `<html>`. Canvases re-read their palette on attribute changes |
| No flash | A blocking head script resolves the device preference before first paint; ship `<meta name="color-scheme" content="dark light">` |
| Motion | Switch appearance without a global color animation; reduced-motion graphics redraw one static frame |

```html
<meta name="color-scheme" content="dark light">
<script>
  (() => {
    const t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const r = document.documentElement;
    r.dataset.theme = t;
    r.style.colorScheme = t;
  })();
</script>
```

## 6. Iconography

- **Library:** Lucide (lucide.dev; `lucide-react` on the site).
- **Stroke:** 1.5 (default for content icons). The search icon in fields uses
  1. Don't mix stroke widths within one component.
- **Sizes:** 16px inline (buttons, links, copy), 20px in fields and controls,
  24px for feature icons.
- **Color:** `currentColor`. Content icons are `#b3b3b3`; icons in active
  controls take the control's text color.
- Decorative icons get `aria-hidden="true"`. Icon-only buttons need an
  `aria-label` and a 46×46 target.
- Brand marks (GitHub, Google, X, LinkedIn) use the official glyphs, never
  Lucide look-alikes. The site's social icons sit in 40px round outlines
  (1px `rgba(236,243,247,0.13)`) with 16px glyphs.
- Don't put icons in decorative badges, don't number features (01/02/03), and
  don't use emoji.

## 7. Imagery and backgrounds

### 7.1 Backgrounds and media

- **Default:** flat `#000`. Most of the look comes from black plus hairlines.
- **Signature effect: drifting particle field.** It's a full-viewport fixed
  `<canvas>` behind content (`z-index:-2`) with opacity 0.72 and
  `pointer-events:none`. Dot count is `min(900, width × height ÷ 3200)`. Radius
  is 0.6–1.5px, with every 17th dot at 1.8px. Alpha is 0.08–0.43. Colors are
  `rgb(104,201,255)`, with every 5th dot `rgb(145,169,183)`. Each dot drifts at
  up to ±0.035px per frame horizontally and ±0.025px vertically, wrapping at
  the edges. Dots within 260px of the pointer brighten (+0.22 alpha) and grow
  (+0.8px). Device-pixel ratio is capped at 1.5. **It isn't rendered at all
  under reduced motion.**
  - **Simple approximation:** a static CSS background of two sparse
    radial-gradient dot layers, `radial-gradient(rgba(104,201,255,0.25) 0.8px,
    transparent 1px)` at about 56px and 83px tile sizes, offset, at 0.72
    opacity. Or skip it; flat black is on-brand.
- **Allowed atmospheric gradient** (closing or brand surface only):
  `radial-gradient(circle at 82% 38%, rgba(22,140,255,0.2), transparent 28%),
  linear-gradient(110deg, #030608, #07131b)`.
- **Hover glow on large planes** (optional): `radial-gradient(circle at 82% 8%,
  rgba(22,140,255,0.16), transparent 43%)`, fading in over 360ms.
- **Media:** `width:100%; height:auto`. Screenshots and diagrams use
  `object-fit:contain`. Only editorial card thumbnails crop with `cover`. Use
  one border owner and never double-frame an image. Use real product
  screenshots and avatars; no stock 3D blobs.
- **Not used:** gradient text, glassmorphism on cards, glowing cards,
  multi-color corner glows, grid-paper backgrounds.

### 7.2 Signature hero graphic (Voice, Video, Agent)

The homepage hero is one particle field that morphs between three
formations. It's the site's single autonomous animation. Everything in this
section is measured from the site's renderer unless marked
**Recommendation**. Positions are fractions of the field's width `W` and
height `H`; the field is a full-viewport canvas behind the hero.

#### 7.2.1 Composition and layers

Drawn back to front, every frame:

1. **Hero ground:** `#050708` plus `radial-gradient(circle at 75% 40%,
   rgba(26,89,138,0.12), transparent 30%)`.
2. **Atmosphere** (soft light, no hard edges), composited with `screen` on
   dark:
   - Four "refractive panes", wide radial glows that read as a lit room:
     ceiling at (0.71W, 0.02H), radius 0.54·min(W,H), squashed 1.42×0.34,
     bright, alpha 0.075; floor at (0.66W, 0.98H), radius 0.58·min, 1.56×0.30,
     cyan, 0.085; a violet pocket at (0.82W, 0.19H), radius 0.31·min,
     0.58×1.38, 0.05; a bright pocket at (0.52W, 0.82H), radius 0.28·min,
     0.72×1.18, 0.045. All alphas are multiplied by an activity factor
     `0.16 + 0.56·video + 0.62·agent` (clamped to 1). Gradient stops: 100%,
     46% at r=0.32, 8% at r=0.72, 0 at r=1. The two pockets slide sideways by
     ±0.018W on `sin(t·0.21)`.
   - **Source bloom** at (0.69W, 0.50H): radius 0.34·min(W,H), squashed
     1.55×0.72. Stops: bright 0.22 → cyan 0.13 at 0.16 → violet 0.05 at 0.45
     → 0.
   - **The 13 shafts** (§7.2.3).
   - Atmosphere strength is ×1.42 on dark, ×(1 + 0.38·voice), and drops to
     6% (×(1 − 0.94·max(video, agent))) in the Video and Agent states.
3. **Particles** (dots), composited with `screen` on dark.
4. **Copy scrim** over the left of the field:
   `linear-gradient(90deg, rgba(5,7,8,0.98) 0%, rgba(5,7,8,0.74) 42%,
   transparent 72%), linear-gradient(0deg, rgba(5,7,8,0.86) 0%, transparent
   30%)`. Particles near the headline area (an ellipse centred at 0.23W,
   0.69H, radii 0.40W × 0.34H) are also dimmed by up to 68%. Text never sits on
   bright particles.

#### 7.2.2 Particles and palette

| Item | Value |
| --- | --- |
| Count | 7,200 at 680–1500px wide, 9,000 above 1500px, 3,600 under 680px. Low-power devices: 5,200 (desktop), 2,400 (mobile) |
| Low-power test | `navigator.hardwareConcurrency <= 4` or `navigator.deviceMemory <= 4` |
| Groups | 38% **floor field** (a right-weighted bed of dots in the lower third), 56% **formation motes** (the only dots that form the wave, grid and sphere), 6% **suspended media** (sparse dots near the top and bottom edges) |
| Depth | each dot has a depth 0.1–1.0. Depth scales size (×0.68–1.38) and alpha, and drives parallax |
| Size | floor and formation: 0.72 + 1.72·depth px (1 dot in 233 gets +1.15px); media: 0.55 + 1.15·depth px |
| Alpha | floor 0.18 + 0.34·depth; formation 0.28 + 0.50·depth; media 0.035 + 0.09·depth (capped at 0.96) |
| Shape | dots under 2.3px are drawn as **squares** (`fillRect`), larger ones as circles. The square-ness at small sizes is part of the look |
| Colours (dark) | neutral `rgb(121,148,174)`, bright `rgb(225,237,246)`, cyan `rgb(72,197,225)`, violet `rgb(139,112,228)`. Deep formation dots are bright, other deep dots cyan, the rest neutral |
| Drift | every dot flows slowly through depth (formation 0.052, floor 0.026, media 0.014 depth-units per second, wrapping) and fades in/out at the depth ends, so the field is never static |
| Pointer camera | the pointer tilts a virtual camera: up to ±1.8% sideways shift of the shafts and parallax by depth, eased at rate 2.7/s. No pointer = centred. Touch has no camera |

**Recommendation (SSO and Recipes, dark):** keep the measured palette, but
use the official blue `rgb(0,194,255)` in the cyan slot. The hues are only
about 3° apart (`#00c2ff` is more saturated), so the look holds and the
graphic ties to the logo next to it.

#### 7.2.3 Voice: the audio wave

Thirteen vertical light shafts, centred on 0.495H, with formation motes
streaming up and down inside them. Together they read as a symmetric audio
level meter: short at both ends, tallest just left of centre.

| Band | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Centre x (·W) | .405 | .450 | .494 | .539 | .583 | .628 | .672 | .717 | .761 | .806 | .850 | .895 | .939 |
| Top value | .58 | .50 | .40 | .28 | .16 | .21 | .10 | .17 | .25 | .33 | .41 | .51 | .60 |
| Full height (·H) | .28 | .38 | .51 | .66 | .81 | .74 | .88 | .79 | .69 | .59 | .50 | .37 | .26 |
| Core width (·W) | .022 | .020 | .021 | .027 | .025 | .026 | .032 | .026 | .025 | .027 | .021 | .020 | .022 |
| Peak alpha | .19 | .22 | .25 | .28 | .30 | .33 | .36 | .33 | .30 | .28 | .25 | .22 | .19 |
| Colour | cyan | cyan | cyan | cyan | bright | bright | bright | bright | bright | violet | violet | violet | violet |

- Half-height = `H × (0.13 + max(0, 0.6 − top) × 0.62)`. Core width =
  `W × (0.018 + (1 − |band − 6|/6) × 0.010)`, +0.004W on every third band.
- **Each shaft is four soft glow lobes**, not a rectangle: a radial gradient
  sprite (stops 1, 0.72 at 18%, 0.28 at 52%, 0.055 at 82%, 0) stretched to the
  shaft height. Lobes (width × core width, height ×, opacity): (3.25, 1.08,
  0.50), (1.36, 0.98, 0.76), (0.54, 0.92, 0.32), (0.30, 0.84, 0.19). The
  second to fourth lobes sway sideways by up to 0.28 core widths on slow sines
  (0.17–0.23 rad/s), so the light shimmers without moving.
- **The wave moves.** While Voice is active each shaft's half-height gains
  `0.018 + 0.014·sin(t·2.15 − band·0.72) + 0.008·sin(t·0.83 + band·0.41)`
  (·H) plus up to 0.018H at the centre. The phase offset per band makes a
  slow ripple travel across the meter, period about 2.9s.
- **Motes:** formation dots snap to their band's centre (±1.5–2.7% W jitter)
  and spread over its height, bobbing 0.8% H. Dots inside a lit shaft turn
  bright, grow 26% and gain up to +0.96 alpha, so the shafts look volumetric.
- **WebGPU only:** the GPU renderer replaces the shafts with ray-marched
  volumetric "curtains" (12 samples through 13 bands, 5 broader bands on
  phones) and a faint upward density drift. It's dark-theme only. Canvas
  teams can skip this; the four-lobe shafts are the approved baseline.

#### 7.2.4 Video: the tile grid

Formation motes form one rigid **8 × 5 grid** of square tiles.

- Cell size `min(0.061W, 0.092H)` on desktop, `min(0.092W, 0.074H)` under
  680px. Gap 14% of the cell. Grid centre (0.70W, 0.43H) desktop, (0.62W,
  0.41H) mobile. Each dot sits at a random spot inside its tile.
- Tiles alternate cyan and neutral like a checkerboard. A slow "reflection"
  sweeps diagonally across the grid (phase `t·0.48 + column·0.91 + row·1.27`);
  where it peaks, dots turn bright, grow 34%, and every 11th dot gets a soft
  halo at 2.6× its size (alpha ≤ 0.16).
- Two in three formation dots dim by 48% so the grid reads as tiles, not
  noise. The grid tilts with the pointer camera as one plane; tiles never
  stretch individually.

#### 7.2.5 Agent: the two-layer sphere

One sphere made of **two concentric layers**, not two separate balls.

| Item | Value |
| --- | --- |
| Centre | (0.715W, 0.42H) desktop; (0.63W, 0.43H) under 680px |
| Outer radius | 0.265 × min(W, H) in the hero preview; 0.285 in a live session; 0.22 on mobile |
| Outer layer = **the agent** | 84% of formation dots. 70% sit on a shell (0.74–1.0 of the radius), 30% fill the volume |
| Inner layer = **the user/visitor** | 16% of formation dots, radius 49% of the outer. 56% on a soft shell (0.61–1.05), the rest in the volume, so it dissolves into the outer layer rather than drawing a second ring |
| Rotation | both layers turn together at 0.045 rad/s (about 140s per turn) with a ±0.018 rad wobble |
| Colours | 58% bright, 28% cyan, 14% violet; any dot on a passing wave front turns bright |
| Turn-taking pulse (preview) | the layers take turns "speaking": `sin(t·1.42 + (inner ? 0 : π))`, so each layer leads for about 2.2s of a 4.4s cycle. The speaking layer breathes (radius +5–6%), ripples on its surface, and sends a wave front outward (inner 0.52, outer 0.38 fronts per second). Wave-front dots gain +0.42 alpha and +44% size |
| Live session | the real microphone and agent audio drive the same pulse: the inner layer swells with the visitor's voice and the outer layer with the agent's |

The same sphere, at 32–72px with 300–600 dots, is the Ask Agora voice orb.
It scales down well, which matters for SSO and Recipes (§11).

#### 7.2.6 Motion, transitions and the cycle

- **State weights.** Each state has a weight 0–1 that eases toward its target
  with `w += (target − w)·(1 − e^(−rate·dt))`. Rates: entering Voice or Video
  3.8/s, Agent 3.6/s; leaving 2.2/s (Agent 2.1/s). So a state is ~63% in after
  0.26s and ~95% after 0.8s.
- **Morph.** Each dot computes its target as the base field position blended
  toward the Voice, Video and Agent targets by those weights, then moves
  `k = clamp(dt × 6.5, 0.035, 0.18)` of the remaining distance each frame
  (about 11% per frame at 60fps). Dots lag a little behind each other, so a
  morph reads as a swarm regrouping, settled in about 1s. There is no
  cross-fade; the same dots travel.
- The shafts don't morph; their light fades out (to 6%) as Video or Agent
  comes in and back in for Voice.
- **The cycle (site):** on load the hero shows Voice, then Video after 2.8s,
  then Agent after another 2.8s, holds Agent for 14.4s, and replays (a 20s
  loop). The tab labels "Voice / Video / Conversational AI" under the headline
  follow the cycle. **Any click on a tab stops the cycle for good** and shows
  that state. Starting a live voice session switches to Agent and zooms the
  field through the camera on connect (decaying at 0.82/s).
- **Delta clamp:** frame time is capped at 34ms, so a dropped frame never
  makes dots jump.

#### 7.2.7 Light theme (Recipes) — recommendation

The site's renderer already has a light mode: it composites with `multiply`
instead of `screen`, cuts dot alpha to 48% and atmosphere to 34%, and drops
the WebGPU curtains. The Ask Agora orb on light surfaces darkens its colours
(cyan at 52% and 74%, violet at 80%) and draws normally (`source-over`).
Build the Recipes light mode from those rules, with the official blue leading:

| Slot | Light colour | Use |
| --- | --- | --- |
| bright → | `rgb(0,194,255)` `#00c2ff` | the lead colour: wave-front dots, lit shaft dots, the sphere's 58% "bright" share |
| cyan → | `rgb(0,144,189)` (`#00c2ff` at 74%) | the sphere's cyan share, Video tiles |
| deep | `rgb(7,92,154)` `#075c9a` | deep (near) dots, so the form has depth on paper |
| violet → | `rgb(148,67,199)` `#9443c7` | the violet share and bands 9–12 |
| neutral → | `rgb(98,98,98)` `#626262` | floor field and media, at half alpha |

- Dots: `source-over`, alpha × 0.6. Glows (panes, bloom, shafts):
  `multiply`, alpha × 0.34, all tinted `#00c2ff` except bands 9–12 (violet).
  Screen-blending on light washes out to white; never use it there.
- Ground: the light canvas `#fcf9f8`, no radial tint. Scrim:
  `linear-gradient(90deg, rgba(252,249,248,0.98) 0%, rgba(252,249,248,0.74)
  42%, transparent 72%)`.
- Result: the wave reads as cyan haze on paper with darker blue dots, which
  still says "official blue" at a glance.

#### 7.2.8 Performance budget

| Rule | Site value |
| --- | --- |
| Baseline renderer | **Canvas 2D** (`getContext('2d', { alpha: true, desynchronized: true })`). WebGPU is an enhancement that falls back to Canvas when `navigator.gpu` is missing, initialisation fails or the device is lost |
| Backing resolution | device-pixel ratio capped at **1.1** (0.9 on low-power devices). The field is soft; high DPR adds cost, not quality |
| Population | fixed per width (§7.2.2). Never add or drop dots adaptively; the site removed that because dots visibly popped |
| Resize | only refit the count; never reseed (mobile toolbars fire resizes while scrolling, and reseeding replays the intro) |
| Off-screen | an `IntersectionObserver` (10% root margin) stops the `requestAnimationFrame` loop when the field is out of view |
| Hidden tab | `visibilitychange` stops the loop; on return, reset the clock so nothing jumps |
| Glow cost | each shaft colour is pre-rendered once into a 192×192 offscreen radial sprite and reused with `drawImage` |
| Allocation | no per-dot objects per frame; reuse one frame record |
| Decorative | the canvas is `aria-hidden="true"`, `pointer-events:none` |

#### 7.2.9 Reduced motion

Under `prefers-reduced-motion: reduce` the site draws **one static frame**:
time is frozen at 0, state weights jump straight to their targets, dots are
placed directly on their targets, and the loop doesn't run (it redraws once on
resize, theme change or state change). The cycle doesn't start, so the hero
shows the **Voice** wave with its 13 shafts, fully formed. Tab clicks still
switch the state, instantly.

#### 7.2.10 Building it without our code

**Canvas 2D is the baseline; WebGPU is optional.** A faithful version needs
about 300–400 lines of plain JavaScript. Seed everything with a deterministic
hash so every visit looks the same:

```text
hash(n)        = fract(sin(n·12.9898 + 78.233) · 43758.5453)
gauss(a, b)    = sqrt(−2·ln(max(1e−4, hash(a)))) · cos(2π·hash(b))

setup(W, H):
  N = count(W, lowPower)                       # §7.2.2
  for i in 0..N: seed u, v, depth, size, alpha, group (38/56/6 split),
                 band = i mod 13, side = hash(i·21.73+3.5) > 0.84 ? inner : outer,
                 sphere θ, z ∈ [−1,1], radialSeed, layerSeed, hueSeed,
                 tileX, tileY
  pre-render one 192px radial glow sprite per colour
  dpr = min(devicePixelRatio, lowPower ? 0.9 : 1.1)

frame(now):
  if hidden or off-screen: stop
  dt = min(0.034, now − last);  t = reducedMotion ? 0 : now
  for each state s: w[s] = ease(w[s], s == current ? 1 : 0, rate, dt)
  clear
  composite = dark ? 'screen' : 'multiply'
  atmosphere(t) × (1 − 0.94·max(w.video, w.agent))   # panes, bloom, 13 shafts × 4 lobes
  composite = dark ? 'screen' : 'source-over'
  k = reducedMotion ? 1 : clamp(dt·6.5, 0.035, 0.18)
  for each dot p:
    target = base(p, t)
    if p is a formation dot:
      target = lerp(target, voiceTarget(p, t),  w.voice)
      target = lerp(target, videoTarget(p),     w.video)
      target = lerp(target, sphereTarget(p, t), w.agent)
    p.xy += (target − p.xy) · k
    colour, alpha, size from §7.2.2–7.2.5
    size < 2.3 ? fillRect : arc
  requestAnimationFrame(frame) unless reducedMotion

sphereTarget(p, t):
  r0     = outerR · (inner ? 0.49 : 1)
  θ      = p.θ + 0.045·t + 0.018·sin(0.19·t + 9·p.seed)
  radial = p.layerSeed < (inner ? 0.56 : 0.70) ? shell(p) : cbrt(p.radialSeed)
  turn   = smoothstep(0.18, 0.82, 0.5 + 0.5·sin(1.42·t + (inner ? 0 : π)))
  breath = 1 + 0.06·turn·sin(2.15·t) + surface ripple + wave front
  return centre + (cos θ, sin θ) · sqrt(1 − z²) · r0 · radial · breath
```

Teams that want less can drop the panes, the camera and the Video state, and
keep: the floor field, the 13 four-lobe shafts with their ripple, the
two-layer sphere, and the eased swarm morph. Those four carry the brand.

## 8. Motion

| Use | Duration | Easing |
| --- | --- | --- |
| Color, border, background feedback | 200ms | `cubic-bezier(0.22,0.61,0.36,1)` (standard) |
| Button lift / arrow nudge | 240ms | `cubic-bezier(0.16,1,0.3,1)` (enter) |
| Press | 100ms | same |
| Header background on scroll, menus | 360ms | standard (menus: enter) |
| Scroll reveal | 600ms opacity, 720ms transform (from `translateY(30px)`) | enter |
| Exits | 200ms | `cubic-bezier(0.4,0,1,1)` |

Rules:

- Motion explains state (hover, press, open, progress). There's at most one
  autonomous animation per viewport, and nothing loops for decoration. The
  hero graphic (§7.2) is that one animation; its cycle shows the product's
  three modes, it pauses off-screen, and any moving instance that runs longer
  than 5s needs a visible pause control (WCAG 2.2.2) on SSO and Recipes.
- Hover lifts only on `(hover:hover) and (pointer:fine)`.
- **Reduced motion** (`prefers-reduced-motion: reduce`): set all animation and
  transition durations to 1ms, run animations once, use `scroll-behavior:auto`,
  remove transforms, don't render the drifting background canvas (§7.1), draw
  the hero graphic as one static frame (§7.2.9), and show reveal elements
  immediately. The result must be a deliberate static state, not a frozen
  mid-animation.

## 9. Accessibility requirements

WCAG 2.1 AA is the floor.

- **Focus:** every interactive element shows
  `outline: 2px solid #a0faff; outline-offset: 3px` on `:focus-visible` (on
  light surfaces, the two-tone `#04111d` + `#00c2ff` ring of §2.2, or the
  site's `#075c9a`). Never `outline:none` without a replacement.
- **Motion:** the hero graphic is decorative (`aria-hidden`), static under
  reduced motion, and has a pause control wherever it moves for more than 5s
  (§11).
  Inputs also turn their border signal on focus.
- **Targets:** at least 46×46px effective hit area, including icon buttons,
  checkbox rows, tabs, footer links and close buttons.
- **Contrast:** normal text 4.5:1. Large text, control borders, focus and
  meaningful icons 3:1. Use the pairs in §2.5. Don't put `#00c2ff` text on light
  backgrounds.
- **Text:** at least 12px, body 16px at all widths, no fake bold.
- **Structure:** a skip link appears on focus, fixed at 8px/8px, 46px tall,
  `#00c2ff` background with black text. One H1 per page, labelled landmarks,
  real `<label>`s, errors tied with `aria-describedby`, and `aria-live` for
  async status (copy, form submit).
- **Keyboard:** full flows work without a mouse. Tabs and dialogs follow ARIA
  patterns. Escape closes menus and dialogs.
- **Captcha and third-party widgets:** pick their dark theme and keep their own
  accessible alternatives available.

## 10. Do / Don't

| Do | Don't |
| --- | --- |
| Black page, `#0a0a0a` panels, 1px `#383838` hairlines | Grey gradient cards, glass panels, drop shadows |
| One cyan primary button per view | Several filled buttons in a header |
| 2px radius on buttons, 0 on inputs | 6–20px rounded inputs, pill buttons for ordinary actions |
| Regular-weight headlines with negative tracking | Bold or extra-bold display type |
| 12px uppercase tracked labels above inputs | Placeholder-only fields, 14px sentence-case labels |
| 46px controls and targets | 36–40px inputs and buttons |
| MiSans Latin plus system mono | Jokker, Instrument Sans or Space Mono for UI text |
| GitHub Dark Default syntax on `#0a1114` | Light, unhighlighted code blocks |
| Signal cyan for links and active states | Cyan body text; `#0099cc` text on white (3.27:1 fails) |
| Text labels for status | Color-only status; invented success/warning palettes |
| Official blue wordmark, top-left | Greyed-out or reconstructed logos |
| `#00c2ff` as fill, rule and graphic on light; ink or `#075c9a` for text | `#00c2ff` text or thin `#00c2ff`-only borders on light; a substitute blue such as `#168cff` |
| The hero graphic beside the form, calm, paused while typing | Particles behind form fields; WebGPU on the login page |

## 11. Page recipes

### 11.0 The hero graphic on SSO (shared by login and signup)

**Recommendation** throughout; built on §7.2.

| Decision | Spec | Why |
| --- | --- | --- |
| Where | Its own **panel beside the form**, never behind it. Login: the right half of the page. Signup: under the narrative copy in the left column | The form stays on a flat, opaque surface, so its contrast is the measured §2.5 pairs, not a guess over moving dots |
| States | **Voice → Agent → Voice …** Video is left out | The 8×5 tile grid looks like a panel of thumbnails or a UI grid next to a credential form; Voice and Agent are abstract and say "voice AI" |
| Cadence | Voice holds 10s, morph about 1.2s (the site's easing, §7.2.6), Agent holds 10s, morph back. A 22.4s loop; each step is about 3.5× longer than the homepage's 2.8s Voice and Video steps | Calm enough to read as ambient light, never as a notification |
| Start | First frame is Voice. The canvas fades in 0→1 over 600ms (enter easing) after `load`, started from `requestIdleCallback` so it never delays the form | The form is interactive before any animation code runs |
| Pause on focus or typing | When the form gains `:focus-within`, or on any `input` event, let the current morph finish (≤1.2s), then **freeze on a static frame** and stop the loop. Resume 6s after focus leaves the form with no further input | Credential entry is the only task on the page. Peripheral motion pulls the eye from the fields and from the address bar, which is where people check they're on the real site. Freezing also hands the CPU to the password manager and hCaptcha |
| Pause control | A 46×46 icon button in the panel's bottom-right corner: Lucide `pause` / `play`, 20px, muted → ink, `aria-label="Pause background animation"` / `"Play background animation"`, `aria-pressed`. Last in the tab order (after the "Sign up" link), so it never sits between fields. Remember the choice in `localStorage["agora-motion"]` | WCAG 2.2.2: motion that lasts more than 5s and runs beside content needs a pause |
| Reduced motion | One static Voice frame (§7.2.9). No loop, no fade, no pause button | Matches the site |
| Low power and Save-Data | `hardwareConcurrency <= 4`, `deviceMemory <= 4` or `navigator.connection.saveData`: draw the static Voice frame only | A login page must stay fast on cheap phones |
| Renderer | Canvas 2D only, DPR cap 1.1, no WebGPU. Budget: ≤15 KB min+gzip of script, ≤4ms per frame on a mid-range laptop | Heavy GPU work has no place on the login page |
| Density | 2,400 dots on desktop (about a third of the homepage, for half the area and a calmer look), 1,000 in the mobile band | Fewer, slightly larger dots read calmer |
| Opacity | Dots at 85% of the §7.2.2 alpha; atmosphere at 70% | Quieter than the homepage while keeping the shafts legible |
| Off-screen, hidden tab | Stop the loop (§7.2.8) | |
| Content | No text, logos, padlocks, check marks, shields, progress bars, cursors or anything shaped like browser or security UI inside the graphic. It must not react to sign-in success or failure | A security page must never fake trust signals |

**Fitting §7.2 into a panel.** Lay the graphic out in panel coordinates
(`pw`, `ph`), not the viewport. Voice: map the site's shaft range 0.405–0.939
onto 0.12–0.88 of `pw`, keep each band's height ratio, centred at 0.5·`ph`.
Agent: centre (0.5·`pw`, 0.48·`ph`), outer radius 0.30·min(`pw`, `ph`). Drop the
copy scrim, the headline attenuation and the pointer camera. Fade the panel's
inner edge (the side facing the form) with a 48px gradient from the page
canvas to transparent, so no dot is drawn within 48px of the form column.

### 11.1 SSO login

**Layout:** a two-column split under the minimal header. The form column is on
the left and holds the heading and the form shell (max 440px), vertically
centred. The graphic panel fills the right column to the viewport edge, from
under the header to the footer (min height 560px). Grid: `minmax(360px, 1fr)
minmax(0, 1fr)` with the page inset on the left. Under 900px it stacks: a
168px graphic band under the header, then the heading and form full-width.

```
┌──────────────────────────────────────────────────────────────────────┐
│ [agora logo 86px]                                               Docs │ 62px header
├──────────────────────────────────┬───────────────────────────────────┤
│                                  │░                                  │
│   Sign in            ← Display   │░        ·  ▌    ▌  ·              │
│   Use your Agora account.        │░     ▌  ▌▐▌ ▐█▌ ▐▌ ▌  ▌   ← Voice  │
│   ┌──────────────────────────┐   │░   · ▌▐▌▐▌▐▌▐█▌▐▌▐▌▐▌▌ ·    10s    │
│   │ Sign in          toolbar │   │░     ▌  ▌▐▌ ▐█▌ ▐▌ ▌  ▌            │
│   ├──────────────────────────┤   │░        ·  ▌    ▌  ·              │
│   │ EMAIL *                  │   │░            ⇣ 1.2s morph          │
│   │ [____________________]   │   │░          .·:::::·.               │
│   │ PASSWORD *               │   │░        .::·:::::·::.  ← Agent    │
│   │ [________________ 👁]    │   │░        ::: .:::. :::     10s     │
│   │        Forgot password?  │   │░        '::·:::::·::'             │
│   │ [████ Sign in ████████]  │   │░          '·:::::·'               │
│   │ ─────────── or ───────── │   │░                                  │
│   │ [ Google ]  [ GitHub ]   │   │░ ← 48px fade      graphic panel   │
│   └──────────────────────────┘   │░   (no dots)      Canvas 2D,      │
│   Don't have an account? Sign up │░                  aria-hidden [⏸] │ ← 46px pause
├──────────────────────────────────┴───────────────────────────────────┤
│  Privacy · Cookies · Terms · Acceptable Use   (small caps)           │ footer
│  Copyright © 2026 Agora | All rights reserved. (mono 12)             │
└──────────────────────────────────────────────────────────────────────┘

Mobile (<900px)
┌──────────────────────────┐
│ [logo]              Docs │ 58px
├──────────────────────────┤
│  ▌▐▌▐█▌▐▌▌  graphic band │ 168px, 1,000 dots, same cycle,
│              [⏸]         │ freezes on focus
├──────────────────────────┤
│ Sign in                  │
│ [form shell full width]  │ 16px margins
└──────────────────────────┘
```

- **Heading:** Display role (34px → 28px), weight 400, ink. Sub-copy is Body
  16px muted.
- **Toolbar:** title only ("Sign in", 13px/500). Don't show a "Secure" dot or
  label: it imitates a security indicator.
- **Fields:** inputs per §5.2, labels per §5.5, 16px between fields
  (label-to-input gap 8px). Forgot password is a text-accent link, right
  aligned, 46px target.
- **Primary:** use the form-submit variant (full width, radius 0) or the
  primary button at full width. **Don't disable it before input.** Validate on
  submit and show errors (§5.6).
- **Social:** two secondary buttons in a 2-column grid with an 8–12px gap,
  each with the official 16px brand glyph. The "or" divider is a 1px `#383838`
  rule with a centred 12px uppercase muted label.
- **Server error:** an inline alert (§5.7) at the top of the panel body. The
  graphic doesn't change.
- **Graphic:** per §11.0. The panel's ground is the page canvas `#000`.
- **Mobile:** form full width with 16px side margins, everything 46px. The
  graphic band sits above the heading, so the form is never pushed below a
  moving element mid-task.

### 11.2 SSO signup

**Layout:** use the website's two-column conversion layout (it's the site's
own "contact sales" page structure). The narrative goes on the left (≤430px),
the form shell on the right (≤720px). It stacks at 900px. The graphic is a
panel in the narrative column, under the copy.

```
┌─────────────────────────────────────────────────────────────────┐
│ [logo]                                                     Docs │
├─────────────────────────────────────────────────────────────────┤
│ HOME / CREATE ACCOUNT  (12px uppercase muted breadcrumb)        │
│                                                                 │
│ Create your          ┌───────────────────────────────────────┐ │
│ Agora account        │ Create account                        │ │
│  ← Hero 44px/400     ├───────────────────────────────────────┤ │
│                      │ FIRST NAME        │ LAST NAME         │ │
│ Body 16 muted, 55ch: │ [_____________]   │ [_____________]   │ │
│ what you get         │ EMAIL *                               │ │
│ (free minutes,       │ [___________________________________] │ │
│ console access…)     │ PASSWORD *                            │ │
│                      │ [_____________________________ 👁]    │ │
│ ┌──────────────────┐ │ helper: 8+ characters… (13px muted)   │ │
│ │  ▌▐▌▐█▌▐▌▌       │ │ COUNTRY / REGION *                    │ │
│ │   ⇣    .·::·.    │ │ [United States                    ⌄ ] │ │
│ │ Voice ⇄ Agent    │ │ ☐ I agree to the Terms of Service,    │ │
│ │ 430×300   [⏸]    │ │   Privacy Policy and Acceptable Use…  │ │
│ └──────────────────┘ │ ☐ I agree to receive marketing…       │ │
│  ↑ no border, canvas │ [ hCaptcha – dark theme ]             │ │
│                      │ [████████ Create account ████████]    │ │
│ Already have an      │ ───────────── or ─────────────        │ │
│ account? Sign in     │ [ Google ]          [ GitHub ]        │ │
│                      └───────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ minimal footer                                                  │
└─────────────────────────────────────────────────────────────────┘
```

- **Grid:** `minmax(280px,430px) minmax(0,720px)`, `justify-content:
  space-between`, gap `clamp(56px,7vw,128px)`. Hero top padding 154px desktop,
  108px mobile.
- **Graphic panel:** full narrative-column width, 300px tall, 32px below the
  body copy, no border, page-canvas ground. 1,600 dots. Same states, cadence
  and pause rules as §11.0; focus anywhere in the signup form freezes it.
  **Under 900px it's omitted:** the form is long, and a band above it would
  push the first field down for decoration.
- **Name row:** 2 columns with a 16px gap, 1 column under 640px. Fields are 24px
  apart vertically (the site's form gap), 16px within a fieldset.
- **Consent:** checkbox rows per §5.4, at 13px. Don't go smaller. Links are
  signal and underlined.
- **Toolbar title** "Create account" is 13px/500. Body padding 28px (20px
  mobile).
- **Mobile:** narrative first (heading 36px), then the form full-width.

### 11.3 Recipes index

**Layout:** a compact catalog introduction, the website's sticky text-filter
controls, and the card grid. Both themes share this layout. The first recipe
card titles must be visible without scrolling on common laptop and phone
viewports. No viewport-height section or extra animation-only mobile band.

```
┌──────────────────────────────────────────────────────────────────────┐
│ [logo] / Recipes   Docs  GitHub  Submit a recipe       [Get started] │ no theme selector
├──────────────────────────────────┬───────────────────────────────────┤
│ Compact catalog intro            │░ website particle formations      │
│ Voice AI recipes, ready to ship. │░    ▌▐▌▐▌▐▌▐█▌▐▌▐▌▌                │
│  ← Intro heading 34px → 28px/400 │░         ⇣                         │
│    (no gradient or extra label)  │░   ▪▪ ▪▪ ▪▪ ▪▪ ▪▪                  │
│ Intro Body 16 muted, max 55ch    │░   ▪▪ ▪▪ ▪▪ ▪▪ ▪▪                  │
│ How to use these recipes →       │░         ⇣    .·::·.                │
│                                  │░  same intro height, no tabs [⏸]  │
├──────────────────────────────────┴───────────────────────────────────┤ sticky under header
│ [🔍 Search recipes, authors…  52px]   Voice AI 65 | RTC 19  ← tabs    │
├──────────────────────────────────────────────────────────────────────┤
│ Platform: All  iOS  Android  Flutter  Go  Python  RN  TypeScript More │ text + active underline
│ Showing 65 of 65 recipes  (13px muted, aria-live)                    │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                   │
│ │PYTHON  INTERM.│ │TYPESCRIPT  ADV│ │GO       BEGIN.│ ← mono meta      │
│ │Title 20px    │ │              │ │              │                   │
│ │Desc 13 muted │ │              │ │              │                   │
│ │◯ By Agora    │ │              │ │              │ ← 24px avatar     │
│ │VIEW RECIPE ↗ │ │              │ │              │ ← mono action     │
│ └──────────────┘ └──────────────┘ └──────────────┘  gap 20px         │
└──────────────────────────────────────────────────────────────────────┘
```

- **Intro:** use 45% of the usable first viewport below the compact navigation,
  leaving the remaining 55% for the recipe directory. Compute its height as
  `calc((100svh - var(--header-height) - 1px) * .45)` with a `100vh` fallback.
  The extra pixel accounts for the navigation border. This supersedes the
  earlier fixed 260px/325px heights and large mobile padding. Search and recipe
  filters start immediately after the hero; the full catalog scrolls normally.
  Keep the first card titles visible on first load and preserve 46px controls.
  Keep one heading, concise copy, and a text link to the existing guide.
- **Hero graphic:** use the website renderer in the intro's actual coordinate
  space. Keep Voice 2.8s → Video 2.8s → Agent 14.4s autoplay, no mode tabs,
  an unobtrusive pause control, off-screen suspension, and a static reduced-motion
  frame. Scale the fixed particle budget to the intro area and device budget;
  do not reseed or change population adaptively while animating.
- **Mobile:** particles remain a background within the intro, never a separate
  tall band that pushes the card grid away.
- **Light theme:** retain official cyan for light and highlights, with `#075c9a`
  depth points. Use shared Canvas/WebGPU light particle opacity 0.84 and
  atmosphere scale 0.48. Keep the light Voice shafts enabled. The white copy
  fade must not wash out the graphic area. Verify all formations in both renderers.
- **Filter bar:** full width with 1px line top and bottom borders, 62px
  tall, and the scrolled-header background (`rgba(0,0,0,0.96)` dark,
  `rgba(252,249,248,0.96)` light) with blur when sticky (offset by the
  62px header). Inside it:
  - **Search field:** a `role="search"` form, 52px tall, bg raised (`#0a0a0a`
    / `#f1f0f0`), radius 2px, `box-shadow: inset 0 0 0 1px #252525` (light:
    `#8a8a8a`), 16px left padding, 20px Lucide `search` icon (stroke 1, muted),
    input 16px with no border.
  - **Recipe type:** underline tabs (§5.12), with the count as muted text
    after the label.
- **All interactive filters:** follow the website's EditorialDirectoryControls
  and StickyDirectoryControls pattern. Use plain text with a transparent
  background, zero box border/radius, and a 2px `#00c2ff` underline beneath
  selected values. Inactive text is muted; active/hover text is ink. Use 28px
  spacing and at least 46px targets. Platform choices scroll horizontally on
  mobile. The More and Filters controls use the same text treatment; selected
  use cases and capabilities are underlined too. Preserve filtering semantics
  and keep the sticky controls visible as result counts change.
- **Cards:** listing cards (§5.8). Meta row: platforms on the left, level on
  the right (mono 12px). Title 20px. Description 13px, clamped to 3 lines.
  Author row: 24px round avatar, 13px "By <name>" with the name in ink, plus an
  "Official" or "Community" label in 12px muted. Tags: up to 3 chips plus "+N".
  Bottom: "VIEW RECIPE" mono action label in signal (`#00c2ff` dark,
  `#075c9a` light). Light card: bg `#f0f1f3`, hover `#e7e8eb`.
- **Grid:** `repeat(3, minmax(0,1fr))`, gap 20px. 2 columns ≤1100px, 1 column
  ≤640px.
- **Empty state:** Title 20px "No recipes match", Body muted, and a text-accent
  "Clear filters" link.

### 11.4 Recipes detail (with code)

**Layout:** this follows the website's article page. A hero band, then a main
column (≤68ch prose, code may widen) with a right "About" rail.

```
┌──────────────────────────────────────────────────────────────────┐
│ header                                                           │
├──────────────────────────────────────────────────────────────────┤
│ ← All recipes (text button)                                      │
│ PYTHON · INTERMEDIATE  (mono meta 12px)                          │
│ Gemini Agora Voice Agents for Python   ← Hero 44px/400           │
│ Build a Gemini-powered voice agent…    ← Body 16 muted           │
│ [Primary: Source on GitHub ↗] [Secondary: View raw recipe ↗]     │
├────────────────────────────────────────────┬─────────────────────┤
│ Use with Agora CLI      ← Title 20px       │ ABOUT (label 12px)  │
│ Clone the recipe… (16 muted)               │ Author      Agora   │
│ ┌ AGORA CLI ─────────────────── Copy ┐     │ Updated  Sep 16 2026│
│ │▌agora init my-app --recipe …       │     │ Difficulty  Interm. │
│ └────────────────────────────────────┘     │ ─────────────────── │
│ Recipe prompt                              │ USE CASES           │
│ ┌ PROMPT ────────────────────── Copy ┐     │ [Voice AI][Conv AI] │
│ │▌You are implementing …             │     │ CAPABILITIES        │
│ └────────────────────────────────────┘     │ [chips]             │
│ Recipe        [Rendered | Raw] tabs        │ RELATED RECIPES     │
│ Markdown prose (16px, 68ch), H2 20px,      │ Title ↗ (13px links │
│ code blocks with syntax highlighting       │ 46px rows)          │
├────────────────────────────────────────────┴─────────────────────┤
│ minimal footer                                                   │
└──────────────────────────────────────────────────────────────────┘
```

- **Grid:** `minmax(0,1fr) minmax(240px,280px)`, column gap
  `clamp(24px,3vw,60px)`, inside the 1600px shell. The rail can be
  `position:sticky; top:<header 62px + 24px>`. Under 900px it becomes one
  column (rail after the hero meta or at the end), max 640px.
- **Prose:** Body 16px, color ink at 82% (`rgba(252,249,248,0.82)`). H2 and H3
  use the Title role at 20px (H2 margin `55px 0 16.6px`, H3 `38px 0 20px`).
  Paragraph margin is 16px. Links are signal.
- **Code:** every block per §5.13, with the copy control in the strip. Prompt
  blocks use the same style; set `white-space: pre-wrap` for prose-like prompts
  only.
- **Rendered and Raw** are true tabs (§5.12) above the recipe body.
- **Rail:** section labels are 12px uppercase muted. Key/value rows use 13px
  muted keys and ink values, 1px `#383838` dividers, and 46px row height.
  Related recipes are text links with a trailing `arrow-up-right`.
- **Hero graphic (recommendation):** **no animated graphic** on detail pages;
  the reader is here for code. Optionally, a static strip 120px tall across the
  hero band's right half, drawn once (no loop, no pause button needed), showing
  the formation that matches the recipe: Voice AI recipes → the Voice wave,
  RTC/video recipes → the Video grid, recipes tagged conversational agent →
  the Agent sphere. 900 dots, the theme's palette, `aria-hidden`. Omit it under
  640px.
- **Light theme:** prose ink is `rgba(15,15,15,0.82)`; links follow §2.2 (ink
  text with a 2px `#00c2ff` underline); code blocks use the light code theme
  (§5.13); the Rendered/Raw tabs use the light tab rule (§2.2).

## 12. Migration notes (current state as of 2026-10-12)

### 12.1 SSO (sso2.agora.io/en/login, /en/signup)

What it does today, and what to change:

| Today (measured) | Change to |
| --- | --- |
| Fonts: Jokker 600 for headings, Instrument Sans for UI | MiSans Latin (§3.1). Headings 400 with negative tracking |
| H1 "Sign into your account" 24px/600 | Display 34px/400 (28px mobile), "Sign in" |
| Centered card 520px, radius **20px**, bg `#101010` with a 156° grey gradient overlay, border `#2b2b2b`, 40px padding | Login: two-column split, form column left (shell max 440px), hero graphic panel right (§11.1). Form shell: `#0a0a0a`, 1px `#383838`, radius 2px, toolbar row (title only, no "Secure" label) plus 28px body |
| Full-page `gradient-bg.png` with cyan and violet corner glows | Flat black page. The hero graphic (§7.2) in its own panel beside the form, never behind it: Voice 10s ⇄ Agent 10s with ~1.2s morphs, Canvas 2D, 2,400 dots, freezes on form focus or typing and resumes 6s after, pause button, static Voice frame under reduced motion, low power or Save-Data (§11.0) |
| No motion today | Only the graphic moves. No WebGPU, no reaction to sign-in success or errors, no padlock/shield/check imagery |
| Dark only | Stays dark-only, no theme toggle (recommendation). Signup shows the graphic as a 430×300 panel under the narrative copy, omitted under 900px; login shows a 168px band above the heading under 900px |
| Grey Agora logo below the card | Blue `#00c2ff` wordmark at 86px in a 62px top bar; minimal footer at the bottom |
| Inputs 36px tall, radius 6px, bg `rgba(39,39,42,0.4)`, border `#383838`, 14px text | 46px, radius 0, bg `#000`, border `#626262`, 16px text, focus border signal plus `#a0faff` ring |
| Labels 14px/500 sentence case, ink, red `*` (`#dc383e`, 4.41:1 on panel) | 12px/500 uppercase +0.08em `#b3b3b3`, `*` in `#00c2ff` |
| Buttons 40px, radius 4px, 14px | 46px, radius 2px (or 0 for full-width submit), 13px/500 |
| Primary `#00c2ff` with `#0a0a0a` text, **disabled at opacity 0.4 until valid** | Text `#04111d`, hover `#fcf9f8`. Keep it enabled and validate on submit. Disabled opacity is 0.52 when truly unavailable |
| Social buttons: outline `#383838`, 213px each | Secondary variant: border `#626262`, hover border ink plus `#0a0a0a` fill |
| Consent text 12px with underlined links | 13px `#b3b3b3`, links `#00c2ff` underlined, 46px rows, 18px `accent-color` checkboxes |
| Country picker 36px custom button | Native select (§5.3), 46px |
| "Forgot password?" 14px signal | Text-accent link, 13px, 46px target |
| Mobile: 308px-wide controls at 41px inset | 16px page margins, full-width controls, nothing under 46px |

Keep: the field set, the hCaptcha (dark theme), Google and GitHub sign-in,
and the cyan primary hue (it already matches `#00c2ff`).

### 12.2 Recipes (recipes.agora.io)

| Today (measured) | Change to |
| --- | --- |
| **Light theme only**: white ground, near-black text | Both themes follow `prefers-color-scheme` automatically (§5.17), including live changes. No theme selector and no saved-choice override. Dark: `#000` canvas; light: `#fcf9f8` canvas (§2.2) |
| Jokker 600: H1 60px (index) / 48px (detail), H2 30px | MiSans 400: Hero 44px (36px mobile), Display 34px, Title 20px, all with negative tracking |
| Instrument Sans body 18px, grey | 16px/1.58, `#b3b3b3` for intros, 82% ink for prose |
| Space Mono for code, labels and 10px level tags | System mono stack, 12px minimum. Mono only for code and meta |
| Accent `#0099cc` (3.27:1 on white, fails AA as text) and gradient text "ready to ship." | The official `#00c2ff` in both themes. Dark: signal text and fills. Light: `#00c2ff` for fills (with `#04111d` text, 9.21:1), rules, underlines, indicators and graphics; `#075c9a` only for small text that must read blue (6.67:1). No gradient text, no `#0099cc` |
| Header: "a" app-icon plus "Agora / Recipes"; three prominent actions (two filled blue, one outlined) | Blue `#00c2ff` wordmark 86px plus "/ Recipes"; Docs, GitHub and Submit as text actions; one "Get started" CTA. No appearance control |
| Hero with grid-paper pattern, blue radial glow and an animated waveform | Compact catalog intro with the website's formations in intro coordinates, an area-scaled budget, no mode tabs, and clearly visible light-mode particles. Card titles visible on first load; no viewport-height hero or mobile animation band (§11.3) |
| Type toggle as two 62px rounded tiles (radius 14px) with count pills | Underline tabs in the filter bar, count as muted text |
| Search 40px, radius 10px, white | Search field per §11.3: 52px, `#0a0a0a`, radius 2px, inset ring |
| Platform filter in a rounded segmented bar (radius 8px, 36px items) | Plain text with an active signal underline, no box or fill, 46px targets; same treatment for use cases and capabilities |
| Cards: radius 14px, 1px light border, rounded tag chips (~11px), 34px avatars | Listing cards, radius 0, `#0a0a0a`; 12px meta; rectilinear chips; 24px avatars |
| Code blocks: light (white panel, radius 14px, grey header), **no syntax highlighting**, Space Mono 14px | §5.13: 2px radius, 34px language strip, signal left rule, 13px system mono. Dark: `#0a1114` with GitHub Dark Default. Light: `#f2f7f8` with GitHub Light Default (comment `#57606a`). One Shiki dual-theme pass |
| Inline code: grey pill, radius 6px, 12.24px | 10% signal tint, radius 2px, same size as surrounding text; text `#00c2ff` on dark, `#075c9a` on light |
| Copy buttons 12–14px, radius 8px | Text-variant copy control, 13px/500, 46px target, live-region feedback |
| Detail sidebar ("About", "Use cases", "Capabilities", "Related") with rounded cyan chips | Keep the structure; restyle per §11.4 rail |

Keep: the information architecture (type split, platform filters, author
attribution, CLI command, recipe prompt, Rendered/Raw, related recipes). It
maps cleanly onto the website's blog directory and article patterns.
