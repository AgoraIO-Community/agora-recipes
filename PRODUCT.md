# Agora Recipes

## Platform

web

## Users

RTE conference visitors arriving by QR code need to understand what they can build and find an existing demo. Returning developers need to find a specific capability and its implementation guide.

## Product Purpose

A searchable catalog of Agora voice AI and real-time communication recipes. Recipe pages combine implementation metadata with markdown fetched from the implementation repository at build time. Copying a recipe prompt into a coding agent is the primary build action; full prompts and CLI commands are available on demand, with the implementation guide and its outline directly below.

## Capabilities and Constraints

The local catalog includes every recipe. Six existing demo recipes are recommended first, with compact thumbnails and actions. More entries are available through a native inline expansion; search and filters always cover every recipe. Video plays on-site and live demos open externally. There is no event-specific collection or View all destination. No new demo services or deployment are in scope. Catalog and curation remain in the repository; database, upload infrastructure, and expanded contribution flows are deferred.

Appearance defaults to dark on first visit. A header toggle switches between dark and light and remembers an explicit choice locally across pages and reloads; it does not follow the system setting. Platform filters in the refinement sheet support multiple selections. Any recipe can provide an optional HTTPS Demo link, independently of homepage curation. Local search includes descriptions and card summaries, tolerates small typos, and recognizes common English/Chinese domain terms. Search and filters use a compact result list on desktop and two columns on phones. Search, filters, sorting, and catalog expansion are shareable in the URL; returning from a recipe restores the last catalog position. Advanced filters use a bounded sheet with searchable groups and result counts. It does not require a hosted search service.

## Brand Commitments

Use Agora Website typography and solid materials for ordinary controls and complete Liquid Glass for floating actions, menus, and dialogs. Use a short centered recipe introduction and search, followed by one topic and action toolbar. Secondary technology, use-case, and capability filters belong in the refinement sheet. Keep dark as the default, provide a complete light counterpart, use real media and opaque reading surfaces, and keep phone cards in two columns. Compactness comes from clear grouping and progressive disclosure, with readable text and space between groups. Controls share 6px corners and neutral solid states; showcase surfaces use 16px corners on desktop and 12px on phones. Keep forms and reading opaque inside floating surfaces. Keep cards, images, links, controls, labels, and icons stationary on hover. Use color, border, underline, and opacity for hover feedback; reserve motion for explicit state changes and honor reduced motion. Avoid ambient animation. Existing catalog copy is English.

## Evidence on Hand

The approved six recipes are Agora Rotary Dial Phone, Agora Podcasts, Aria Voice Sales Agent, Agora Meeting Copilot, WorldCupVoice, and React Live Video. They have existing screenshots, video, or GIF assets. Meeting Copilot requires an API key for its AI experience. WorldCupVoice has an existing video but no verified public live demo. Public entry pages and video playback were checked; complete voice and multi-device RTC sessions were not verified.

## Product Principles

- Explain the outcome before implementation details.
- Let visitors see or try existing work before reading a recipe.
- Keep media availability and setup requirements truthful.
- Keep curation lightweight and editable in the repository.
