import assert from "node:assert/strict"
import fs from "node:fs/promises"
import { locales, localePath } from "../lib/locales.ts"

const origin = process.argv[2] ?? "http://localhost:3000"
const canonical = process.env.SITE_URL ?? "https://recipes.agora.io"
const slugs = (await fs.readdir("content/recipes", { withFileTypes: true })).filter(entry => entry.isDirectory() && !entry.name.startsWith(".")).map(entry => entry.name)
const metadata = new Map(await Promise.all(slugs.map(async slug => [slug, JSON.parse(await fs.readFile(`content/recipes/${slug}/recipe.json`, "utf8"))])))
const schemas = html => [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]))
async function read(path, type = "text/html") {
  const response = await fetch(new URL(path, origin))
  assert.equal(response.status, 200, path)
  assert.ok(response.headers.get("content-type")?.includes(type), path)
  const text = await response.text()
  if (type === "text/html") assert.ok(text.includes('rel="describedby" href="/llms.txt"'), `${path}: HTML discovery`)
  return text
}

const home = await read("/")
assert.ok(home.includes("Voice AI &amp; RTC Examples and Recipes | Agora"))
assert.ok(home.includes('href="/recipes"'))
assert.ok(schemas(home).some(value => value["@type"] === "WebSite"))
const sitemap = await read("/sitemap.xml", "xml")
for (const locale of locales) {
  const path = localePath("/recipes", locale)
  const html = await read(path)
  assert.equal((html.match(/class="recipe-directory__link"/g) ?? []).length, slugs.length, `${locale}: complete initial HTML`)
  assert.ok(html.includes(`rel="canonical" href="${canonical}${path}"`))
  assert.ok(html.includes('hrefLang="x-default"'))
  assert.ok(sitemap.includes(`<loc>${canonical}${path}</loc>`))
  for (const slug of slugs) assert.ok(html.includes(`href="${localePath(`/recipes/${slug}`, locale)}?returnTo=`), `${locale}: ${slug}`)
  const list = schemas(html).find(value => value["@type"] === "CollectionPage")?.mainEntity
  assert.equal(list.numberOfItems, slugs.length)
  assert.equal(list.itemListElement.length, slugs.length)
  const detail = await read(localePath("/recipes/desktop-pet", locale))
  if (locale !== "en") assert.ok(!detail.includes(`<meta name="description" content="${metadata.get("desktop-pet").tagline}"`), `${locale}: localized introduction`)
  const expectedLanguage = locale === "zh-Hans" ? "zh-Hans" : "en"
  assert.ok(detail.includes(`<div lang="${expectedLanguage}">`), `${locale}: actual guide language`)
  if (locale !== "en" && locale !== "zh-Hans") assert.ok(detail.includes('data-guide-language="en"'), `${locale}: visible fallback`)
}

for (const slug of slugs) {
  const html = await read(`/recipes/${slug}`)
  const graph = schemas(html).find(value => value["@graph"])?.["@graph"]
  assert.ok(graph?.some(value => ["TechArticle", "WebPage"].includes(value["@type"])), `${slug}: page schema`)
  assert.ok(html.includes(`rel="canonical" href="${canonical}/recipes/${slug}"`))
  assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1)
}

const index = await read("/llms.txt", "text/plain")
const links = [...index.matchAll(/\]\(https?:\/\/[^)]+\/recipes\/([^/)]+)\/index\.md\)/g)].map(match => match[1])
const guides = slugs.filter(slug => metadata.get(slug).recipeUrl)
assert.equal(links.length, new Set(links).size, "LLM index does not duplicate guides across sections")
assert.deepEqual([...links].sort(), [...guides].sort())
assert.ok(index.includes("## Start here") && index.includes("## Optional"))
const response = await fetch(new URL("/recipes/desktop-pet/index.md", origin))
assert.ok(response.headers.get("link")?.includes(`<${canonical}/recipes/desktop-pet>; rel="canonical"`))
const markdown = await response.text()
assert.ok(markdown.includes("- Guide language: en") && markdown.includes("- Guide status: available"))
assert.ok(markdown.includes("Author guide: zh-Hans"))
assert.equal((await fetch(new URL("/recipes/nonexistent-search-test", origin))).status, 404)
console.log(`Search and agent checks passed: ${slugs.length} initial-HTML directory links in each of ${locales.length} locales, ${slugs.length} detail schemas, ${guides.length} unique guide links.`)
