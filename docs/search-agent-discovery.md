# Search and agent discovery

This change has two separate goals: expose every catalog entry through ordinary HTML navigation, and provide a useful Markdown entry point for agents. The catalog currently contains 112 entries. Coverage checks derive their expected counts from the content rather than fixing that number in the application.

## Search and page quality

| Area | Contract |
| --- | --- |
| Complete navigation | `/recipes` and its six localized equivalents render every entry as an HTML link before hydration. The footer links to this directory. The homepage keeps its search, filters and automatic catalog batches. Detail links preserve a validated directory return path and scroll position. |
| Metadata | Homepage and contribution descriptions state their actual purpose. Localized pages keep self-canonicals, reciprocal language alternatives and an English `x-default`. A locale is not disabled merely because its guide uses another language. |
| Language | Translated introductions and author guide translations are separate materials. `content/document-languages.json` records inspected original guide languages and explicit author versions. The rendered guide has its own `lang`; a visible notice explains a language fallback. Unknown future guide languages remain unspecified. |
| Structured data | Homepages describe the website. Directories describe their visible list. Detail pages describe the available technical guide, with a separate source-code entity when a repository exists. Breadcrumbs use canonical page URLs. Untrusted author strings cannot close the JSON-LD script. |
| Freshness | Visible update dates, Markdown metadata, JSON-LD and sitemap dates use the later of the editorial metadata date and the recorded guide-content change. The build compares published source/document/language data with the checked-in artifact. Unchanged rebuilds preserve both content and generation timestamps. |
| Translation coverage | `npm run locales:check` reports missing introductions. `--strict` is available for editorial checks; English-only contributions remain supported. |

The structured data describes visible content. It does not assert rich-result eligibility. A complete directory improves link discovery; its existence does not prove that a URL is indexed. See [Google's SEO fundamentals](https://developers.google.com/search/docs/fundamentals/seo-starter-guide), [localized page guidance](https://developers.google.com/search/docs/specialty/international/localized-versions), and [structured-data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).

## LLM and agent access

| Area | Contract |
| --- | --- |
| Entry point | `/llms.txt` follows the [llms.txt community specification](https://llmstxt.org/): a title, summary, task guidance and categorized Markdown links. Starters appear first. Each guide appears once, even when it belongs to both catalog categories. |
| Content | `/recipes/{slug}/index.md` includes the fetched author guide, implementation repository, source URLs, author credit, guide language, availability, update date and available author-provided language versions. An unavailable guide points readers to its source instead of inventing instructions. |
| Discovery links | HTML exposes `rel="describedby"` for `/llms.txt` and a `text/markdown` alternate where a guide is available. Catalog Markdown responses include HTTP `Link` relations for the index and canonical HTML page. |
| Existing clients | The JSON Recipe API retains its current schema and Agora-authored scope. The Markdown index includes community guides too and states this difference. No combined `llms-full.txt` is needed for this implementation. |
| Task acceptance | Starting only from the index, a fresh agent must locate a Python starter, an RTC example, and Desktop Pet's repository and actual guide languages. See the [read-only benchmark](agent-discovery-benchmark-2026-11-11.md). |

`llms.txt` is a community content-access convention. It is not an indexing requirement or a promise that a search engine or AI product will use the file. The benchmark measures successful navigation in one controlled run; it does not measure model adoption, ranking or installation success.

## Validation and release follow-up

| Check | Command or procedure |
| --- | --- |
| Static and unit checks | `npm run lint`; `node --test scripts/*.test.mjs`; `npm run build`; `./node_modules/.bin/tsc --noEmit` |
| Rendered coverage | Start the production build, then run `scripts/check-search-discovery.mjs`, `scripts/check-llm-discovery.mjs` and `scripts/check-phase-one.mjs` against its origin. These validate the generated HTML, Markdown, canonical URLs, sitemap, guide fallback and existing catalog/API behavior. |
| Content stability | Build twice with unchanged upstream documents and compare all generated artifact hashes. A changed upstream guide is a real content update and can legitimately change its recorded date. |
| Browser checks | Inspect light/dark appearance at 320, 390, 768 and 1440px; long localized directory labels; guide fallback and real Chinese guide; directory return position; homepage search and batch loading; keyboard focus and Escape dismissal. Compare shared controls with the development-only `/design-system` page. |
| Search Console and Bing | The checked Google account could not access the Recipes property; the checked Bing session was not signed in. Property-level baseline data and submission remain external follow-up work. No account or property settings were changed. |
| After release | Verify the public directory, canonical/alternate links, language markup, sitemap, JSON-LD and Markdown headers. In authorized Search Console and Bing properties, inspect representative URLs, confirm sitemap processing, and record indexing, impressions and clicks before comparing a later period. Record deployment and indexing as separate states. |

Reverting the source change restores the previous routes and metadata. There is no database migration. Search-engine recrawling and caches may take additional time after a release or rollback.
