import assert from "node:assert/strict"
import test from "node:test"
import { serializeStructuredData, recipeSchema, directorySchema } from "../lib/structured-data.ts"
import { metaDescription } from "../lib/meta-description.ts"
import { contentModifiedAt } from "../lib/recipe-freshness.mjs"

test("JSON-LD safely embeds untrusted author text without closing the script", () => {
  const text = '</script><script>alert("x")</script>\u2028'
  const encoded = serializeStructuredData({ name: text })
  assert.ok(!encoded.includes("<"))
  assert.deepEqual(JSON.parse(encoded), { name: text })
})

test("source code and guides retain distinct identities and programming languages", () => {
  const entry = { slug: "example", title: "Example", tagline: "Example", description: "A guide", author: "Author", platforms: ["TypeScript", "Next.js", "macOS"], useCases: ["Voice AI", "Meetings"], capabilities: ["Voice Agent", "Voice AI"], difficulty: "Advanced", media: { thumbnail: "/recipes/example.webp" }, mainRepoUrl: "https://github.com/example/repo", recipeUrl: "https://github.com/example/repo/blob/main/README.md", recipeDocument: { markdown: "# Guide" } }
  const graph = recipeSchema("https://recipes.agora.io", "/ja/recipes/example", entry, "2026-11-11", "en")["@graph"]
  assert.equal(graph[0]["@type"], "TechArticle")
  assert.equal(graph[0].inLanguage, "en")
  assert.notEqual(graph[0]["@id"], graph[1]["@id"])
  assert.deepEqual(graph[0].about, { "@id": graph[1]["@id"] })
  assert.deepEqual(graph[1].programmingLanguage, ["TypeScript"])
  assert.equal(graph[0].image, "https://recipes.agora.io/recipes/example.webp")
  assert.deepEqual(graph[0].keywords, ["Voice AI", "Meetings", "Voice Agent"])
  assert.equal(graph[0].proficiencyLevel, "Advanced")
  assert.equal(graph[0].publisher.name, "Agora")
  const plain = recipeSchema("https://recipes.agora.io", "/recipes/example", { ...entry, useCases: [], capabilities: [], media: undefined, recipeDocument: { markdown: "" } }, "2026-11-11")["@graph"][0]
  assert.deepEqual([plain.image, plain.keywords, plain.proficiencyLevel], [undefined, undefined, undefined])
  assert.equal(recipeSchema("https://recipes.agora.io", "/recipes/example", { ...entry, recipeDocument: { markdown: "" } }, "2026-11-11")["@graph"][0]["@type"], "WebPage")
  assert.equal(directorySchema("https://recipes.agora.io", "/recipes", "All", [{ title: "Example", path: "/recipes/example" }]).mainEntity.numberOfItems, 1)
})

test("search descriptions keep whole sentences and never exceed the limit", () => {
  assert.equal(metaDescription("  Short   copy. "), "Short copy.")
  const long = "Build a Next.js voice agent with Agora. " + "It keeps secrets on the server and streams audio with low latency. ".repeat(4)
  assert.equal(metaDescription(long), "Build a Next.js voice agent with Agora. It keeps secrets on the server and streams audio with low latency.")
  const unbroken = metaDescription("word ".repeat(80))
  assert.ok(unbroken.length <= 160 && unbroken.endsWith("word…"))
  assert.ok(metaDescription("语".repeat(300)).length <= 160)
})

test("source freshness survives unchanged builds and changes only with published content", () => {
  const current = { source: { recipeUrl: "https://example.com/guide.md" }, recipeDocument: { markdown: "# Original" } }
  const previous = { ...current, generatedAt: "2026-10-01T12:00:00Z", contentUpdatedAt: "2026-10-01" }
  assert.equal(contentModifiedAt(current, previous, "2026-09-01", "2026-11-11T12:00:00Z"), "2026-10-01")
  assert.equal(contentModifiedAt({ ...current, recipeDocument: { markdown: "# Changed" } }, previous, "2026-09-01", "2026-11-11T12:00:00Z"), "2026-11-11T12:00:00Z")
  assert.equal(contentModifiedAt(current, undefined, "2026-09-01", "2026-11-11T12:00:00Z"), "2026-09-01")
})
