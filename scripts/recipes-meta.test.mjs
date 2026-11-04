import assert from "node:assert/strict"
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import test from "node:test"
import ts from "typescript"

// Exercise the real filesystem loader with isolated catalog fixtures, without
// a test-runner dependency or importing Next's server-only marker into Node.
const source = (await readFile(new URL("../lib/recipes.ts", import.meta.url), "utf8")).replace('import "server-only"', "")
const valid = JSON.parse(await readFile(new URL("../content/recipes/aria-voice-sales-agent/recipe.json", import.meta.url), "utf8"))

async function load(meta, catalog = false) {
  const root = await mkdtemp(path.join(tmpdir(), "recipes-meta-"))
  try {
    const directory = path.join(root, "content", "recipes", "demo-fixture")
    await mkdir(directory, { recursive: true })
    await writeFile(path.join(directory, "recipe.json"), JSON.stringify(meta))
    const compiled = ts.transpileModule(source.replaceAll("process.cwd()", JSON.stringify(root)), {
      compilerOptions: { module: ts.ModuleKind.ESNext },
    }).outputText
    const { getAllRecipes, getAllEntries } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`)
    return catalog ? { entries: getAllEntries(), recipes: getAllRecipes() } : getAllRecipes()[0]
  } finally {
    await rm(root, { recursive: true, force: true })
  }
}

test("optional demo links survive loading without a showcase entry", async () => {
  const noDemo = { ...valid }
  delete noDemo.demoUrl
  assert.equal((await load(noDemo)).demoUrl, undefined)
  for (const demoUrl of [valid.demoUrl, "https://testflight.apple.com/join/example"]) {
    assert.equal((await load({ ...valid, demoUrl })).demoUrl, demoUrl)
  }
})

test("demo links reject unsafe schemes, relative URLs, credentials, and wrong types", async () => {
  for (const demoUrl of ["http://example.com", "javascript:alert(1)", "/demo", "https://user:password@example.com", "", null, 42]) {
    await assert.rejects(load({ ...valid, demoUrl }), /demoUrl must be an absolute HTTPS URL without credentials/)
  }
})


test("Demo-only, video-only, and source-only entries load without a guide and stay outside Recipe APIs", async () => {
  const base = { ...valid }
  for (const key of ["recipeUrl", "mainRepoUrl", "demoUrl", "difficulty", "cli", "media"]) delete base[key]
  for (const material of [{ demoUrl: "https://example.com/demo" }, { mainRepoUrl: "https://github.com/example/project" }, { media: { videoUrl: "https://example.com/demo.mp4" } }]) {
    const { entries, recipes } = await load({ ...base, ...material }, true)
    assert.equal(entries.length, 1)
    assert.equal(recipes.length, 0)
    assert.equal(entries[0].primaryPrompt, "")
    assert.equal(entries[0].recipeDocument.fetchError, undefined)
  }
  await assert.rejects(load(base, true), /needs a Demo, video, source repository, or recipe/)
})

test("a standalone GitHub guide derives its real source repository without changing its source URL", async () => {
  const meta = { ...valid }
  delete meta.mainRepoUrl
  const entry = await load(meta)
  assert.equal(entry.recipeUrl, valid.recipeUrl)
  assert.equal(entry.mainRepoUrl, new URL(valid.recipeUrl).origin + "/" + new URL(valid.recipeUrl).pathname.split("/").slice(1, 3).join("/"))
})

test("media metadata is validated independently from recommendations", async () => {
  await assert.rejects(load({ ...valid, media: { videoUrl: "javascript:alert(1)" } }), /media.videoUrl/)
  for (const thumbnail of ["//example.com/image.png", "https://user:pass@example.com/image.png", "javascript:alert(1)"]) {
    await assert.rejects(load({ ...valid, media: { thumbnail } }), /media.thumbnail/)
  }
  await assert.rejects(load({ ...valid, media: { labels: 42 } }), /media.labels/)
  await assert.rejects(load({ ...valid, media: { thumbnailScale: -1 } }), /thumbnailScale/)
})
