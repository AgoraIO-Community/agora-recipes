import assert from "node:assert/strict"
import fs from "node:fs/promises"

const origin = process.argv[2] ?? "http://localhost:3000"
const canonical = process.env.SITE_URL ?? "https://recipes.agora.io"
const entries = await fs.readdir(new URL("../content/recipes/", import.meta.url), { withFileTypes: true })
const slugs = entries.filter((entry) => entry.isDirectory() && !entry.name.startsWith(".")).map((entry) => entry.name)

async function read(path, type) {
  const response = await fetch(new URL(path, origin))
  assert.equal(response.status, 200, path)
  assert.ok(response.headers.get("content-type")?.includes(type), `${path}: ${type}`)
  return response.text()
}

const index = await read("/llms.txt", "text/plain")
assert.ok(index.startsWith("# Agora Voice AI Recipes\n"))
assert.equal(await read("/index.md", "text/markdown"), index)
const sitemap = await read("/sitemap.xml", "xml")
const robots = await read("/robots.txt", "text/plain")
assert.ok(robots.includes("Allow: /"))
assert.ok(robots.includes(`${canonical}/sitemap.xml`))
const home = await read("/", "text/html")
assert.ok(home.includes('rel="describedby" href="/llms.txt"'))
const homeCanonical = home.match(/rel="canonical" href="([^"]+)"/)?.[1]
assert.ok(homeCanonical)
assert.equal(new URL(homeCanonical).href, new URL("/", canonical).href)
assert.ok(home.includes(`type="text/markdown" href="${canonical}/index.md"`))

for (const slug of slugs) {
  assert.ok(index.includes(`${canonical}/recipes/${slug}/index.md`), `${slug}: index coverage`)
  assert.ok(sitemap.includes(`<loc>${canonical}/recipes/${slug}</loc>`), `${slug}: sitemap coverage`)
  const markdown = await read(`/recipes/${slug}/index.md`, "text/markdown")
  const artifact = JSON.parse(await fs.readFile(new URL(`../content/generated/recipes/${slug}.json`, import.meta.url), "utf8"))
  assert.ok(markdown.includes(artifact.source.mainRepoUrl), `${slug}: source link`)
  if (artifact.recipeDocument.markdown) {
    assert.ok(markdown.includes(artifact.recipeDocument.markdown), `${slug}: full document preserved`)
  } else {
    assert.ok(markdown.includes("Recipe document unavailable"), `${slug}: unavailable document`)
  }
  const page = await read(`/recipes/${slug}`, "text/html")
  assert.ok(page.includes(`rel="canonical" href="${canonical}/recipes/${slug}"`), `${slug}: canonical`)
  assert.ok(page.includes(`type="text/markdown" href="${canonical}/recipes/${slug}/index.md"`), `${slug}: alternate`)
}
assert.equal((await fetch(new URL("/recipes/nonexistent-llm-test/index.md", origin))).status, 404)
console.log(`LLM discovery checks passed for all ${slugs.length} recipes.`)
