# Agora recipe media library

This folder is a standalone handoff. Open `index.html` to browse it without the
catalog application, or share the whole folder. All image links are relative.

- `images/` — one active catalog image per recipe, named by recipe slug.
- `originals/` — full-resolution PNGs for the new screenshots and illustrations.
- `illustrations/` — editable, self-contained 1600 × 900 HTML artboards. These
  include fallback alternatives for the recipes covered by this pass.
- `manifest.json` — titles, image paths, sources, hashes, media types and caveats.
- `capture-audit.json` — per-recipe source revisions, local launch scope, native
  blockers, and the reason for each screenshot/illustration decision.

## What the images mean

Illustrations say **“Illustration · not an app screenshot”** inside the artwork.
They are conceptual explanations of a recipe, not API-sequence specifications,
invented product interfaces, fabricated conversations, measured outcomes, or proof
that a demo was run successfully.

New application screenshots show the original local app's initial screen unless
the manifest explicitly says otherwise. They do **not** demonstrate a working
provider conversation. Existing screenshots and author-demo frames retain their
original source attribution and limitations. Old rejected/error captures are not
part of this handoff.

Preserve these distinctions and source attribution when reusing media. This
export does not grant new rights to third-party imagery; check the implementation
project's license and obtain any necessary permissions for external campaigns.
No credentials, source checkouts, dependency folders or diagnostic logs belong in
this folder.

## Updating the library

From the catalog repository:

```sh
node scripts/render-recipe-illustrations.mjs
node scripts/export-recipe-media.mjs
```

The first command regenerates editable HTML from
`content/recipe-illustrations.json`; it does not silently replace approved raster
images. To update an illustration, capture the corresponding HTML at 1600 × 900
with `agent-browser`, review it, update its catalog WebP and provenance sidecar,
then run the export command. Keep the PNG in `originals/`.

The exporter copies **active** images from `content/showcase.json`; it does not
copy every historical file from `public/recipes/`. It can also export to another
folder: `node scripts/export-recipe-media.mjs /path/to/handoff` (copy the HTML,
originals, this README and capture audit too if a full source handoff is needed).
