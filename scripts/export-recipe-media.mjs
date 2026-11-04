import fs from "node:fs/promises"
import path from "node:path"
import { createHash } from "node:crypto"
import { fileURLToPath } from "node:url"

// Export active catalog media, not rejected/historical captures or private setup files.
// Usage: node scripts/export-recipe-media.mjs [destination]
const root = fileURLToPath(new URL("../", import.meta.url))
const destination = path.resolve(process.argv[2] ?? path.join(root, "marketing/recipe-media"))
const entries = new Map(JSON.parse(await fs.readFile(path.join(root, "content/showcase.json"), "utf8")).map(e => [e.slug, e]))
const records = []
const captureRecords = []
for (const filename of await fs.readdir(path.join(root, "public/recipes"))) {
  if (!filename.endsWith(".json")) continue
  const document = JSON.parse(await fs.readFile(path.join(root, "public/recipes", filename), "utf8"))
  captureRecords.push(...(document.captures ?? []))
}
const escape = value => String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]))
await fs.mkdir(path.join(destination, "images"), { recursive: true })

for (const slug of (await fs.readdir(path.join(root, "content/recipes"))).filter(s => !s.startsWith(".")).sort()) {
  const recipe = JSON.parse(await fs.readFile(path.join(root, "content/recipes", slug, "recipe.json"), "utf8"))
  const media = entries.get(slug)
  if (!media?.thumbnail) throw new Error(`Missing active thumbnail: ${slug}`)
  let bytes
  let extension
  if (media.thumbnail.startsWith("/recipes/")) {
    const source = path.resolve(root, "public", `.${media.thumbnail}`)
    if (!source.startsWith(path.join(root, "public/recipes/"))) throw new Error(`Invalid local image: ${slug}`)
    bytes = await fs.readFile(source)
    extension = path.extname(source)
  } else {
    const url = new URL(media.thumbnail)
    if (url.protocol !== "https:") throw new Error(`Expected HTTPS: ${slug}`)
    const response = await fetch(url, { signal: AbortSignal.timeout(30000), redirect: "error" })
    if (!response.ok) throw new Error(`${slug}: HTTP ${response.status}`)
    const type = response.headers.get("content-type")?.split(";")[0]
    extension = { "image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp" }[type]
    if (!extension) throw new Error(`${slug}: unsupported image ${type}`)
    bytes = Buffer.from(await response.arrayBuffer())
  }
  const file = `images/${slug}${extension}`
  await fs.writeFile(path.join(destination, file), bytes)
  let provenance = null
  if (media.thumbnail.startsWith("/recipes/")) {
    try { provenance = JSON.parse(await fs.readFile(path.join(root, "public", `.${media.thumbnail}.json`), "utf8")) }
    catch (error) { if (error.code !== "ENOENT") throw error }
  }
  provenance ??= captureRecords.find(r => r.asset === media.thumbnail) ?? null
  const kind = provenance?.kind ?? (provenance?.sourceVideo || /author/.test(media.thumbnail) ? "author-demo-frame" : provenance?.captureUrl ? "local-app-screenshot" : "existing-project-media")
  records.push({ slug, title: recipe.title, file, kind, alt: media.thumbnailAlt ?? recipe.title, source: media.thumbnailSource, repository: recipe.mainRepoUrl, recipe: recipe.recipeUrl, notes: media.demoNote ?? "Existing project media; not newly verified in this export.", sha256: createHash("sha256").update(bytes).digest("hex"), provenance })
}

await fs.writeFile(path.join(destination, "manifest.json"), `${JSON.stringify({ exportedAt: new Date().toISOString(), count: records.length, records }, null, 2)}\n`)
const cards = records.map(r => `<article><a href="${escape(r.file)}"><img loading="lazy" src="${escape(r.file)}" alt="${escape(r.alt)}"></a><h2>${escape(r.title)}</h2><p>${escape(r.notes)}</p><a href="${escape(r.repository)}">Implementation source</a></article>`).join("\n")
await fs.writeFile(path.join(destination, "index.html"), `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Agora recipe media library</title><style>body{margin:0;padding:40px;background:#000;color:#fcf9f8;font:16px/1.5 system-ui}h1{font-weight:500}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:32px}article{min-width:0}img{width:100%;aspect-ratio:16/9;object-fit:contain;background:#0a0a0a;border-radius:12px}h2{font-size:20px}p{color:#b3b3b3}a{color:#00c2ff}header{max-width:70ch;margin-bottom:40px}</style><header><h1>Agora recipe media</h1><p>${records.length} recipe images. Illustrations are labeled inside the image; they are conceptual diagrams, not app screenshots or evidence of working sessions. Read manifest.json for sources and limitations.</p></header><main>${cards}</main></html>\n`)
console.log(`Exported ${records.length} recipe images to ${destination}`)
