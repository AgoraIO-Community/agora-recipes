# Agora Recipes

## Platform

web

## Users

RTE conference visitors arriving by QR code need to understand what they can build and find an existing demo. Returning developers need to find a specific capability and its implementation guide.

## Product Purpose

A searchable catalog of Agora voice AI and real-time communication recipes. Recipe pages combine implementation metadata with markdown fetched from the implementation repository at build time. Copying a recipe prompt into a coding agent is the primary build action; full prompts and CLI commands are available on demand, with the implementation guide and its outline directly below.

## Capabilities and Constraints

The local catalog includes every recipe. Curated demo recipes are recommended first, with compact thumbnails and actions. More entries render on demand through a native inline expansion; search and filters always cover every recipe. Video plays on-site and live demos open externally. Video cards reveal a play label on mouse hover, then start a muted inline preview after two seconds; leaving restores the poster. Touch and reduced-motion/data preferences keep explicit playback. There is no event-specific collection or View all destination. No new demo services or deployment are in scope. Catalog and curation remain in the repository; database and upload infrastructure remain out of scope. Public submissions use a GitHub Issue form or direct PRs to staging; no site account or intake backend is added.

Appearance defaults to dark on first visit. A header toggle switches between dark and light and remembers an explicit choice locally across pages and reloads; it does not follow the system setting. Platform filters in the refinement sheet support multiple selections. Any recipe can provide an optional HTTPS Demo link, independently of homepage curation. Local search includes descriptions and card summaries, tolerates small typos, and recognizes common English/Chinese domain terms. Search and filters use a compact result list on desktop and two columns on phones. Search, filters, sorting, and catalog expansion are shareable in the URL; detail links preserve their validated source catalog address and restore a scroll snapshot scoped to that exact address. Direct links use the locale catalog fallback. Advanced filters use a bounded sheet with searchable groups and result counts. It does not require a hosted search service.

Entries may provide any combination of Demo, video, source, and Recipe. Only configured guides are fetched during builds. Entries without guides remain outside Recipe-specific APIs and Markdown routes. Media is editable in entry metadata; the recommendation file owns ordered slug references only. Material filters use AND while platform selections retain OR.

Content cards never show curated Topic names, badges, or links. Curated Topic pages and header navigation, author README language selection, sharing controls, and custom events are P1 follow-ups. Keep legacy `?topic=` quick filters independent from future curated Topics. See [P0 verification and release notes](docs/phase-one-p0.md) for the existing Analytics audit and release dependencies.

## Brand Commitments

Use Agora Website typography and solid materials for ordinary controls and complete Liquid Glass for floating actions, menus, and dialogs. Use a short centered recipe introduction and search, followed by one topic and action toolbar. Secondary technology, use-case, and capability filters belong in the refinement sheet. Keep dark as the default, provide a complete light counterpart, use real media and opaque reading surfaces, and keep phone cards in two columns. Compactness comes from clear grouping and progressive disclosure, with readable text and space between groups. Controls share 6px corners and neutral solid states; showcase surfaces use 16px corners on desktop and 12px on phones. Keep forms and reading opaque inside floating surfaces. Keep cards, images, links, controls, labels, and icons stationary on hover. Use color, border, underline, and opacity for hover feedback; reserve motion for explicit state changes and honor reduced motion. Avoid ambient animation. English is the default. Navigation, controls, and entry introductions also support zh-Hans, zh-Hant, and ja through separate presentation dictionaries. Author credit, submitted URLs, and original guide documents remain unchanged.

## Evidence on Hand

The curated recipes include Agora Rotary Dial Phone, Agora Podcasts, Aria Voice Sales Agent, Agora Meeting Copilot, WorldCupVoice, React Live Video, Agora Arena, and Draw & Guess. They have existing screenshots, video, or GIF assets. Meeting Copilot requires an API key for its AI experience. WorldCupVoice has an existing video but no verified public live demo. Public entry pages and video playback were checked; complete voice and multi-device RTC sessions were not verified.

## Product Principles

- Explain the outcome before implementation details.
- Let visitors see or try existing work before reading a recipe.
- Keep media availability and setup requirements truthful.
- Keep curation lightweight and editable in the repository.
