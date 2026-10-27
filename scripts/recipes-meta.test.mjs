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

async function load(meta) {
  const root = await mkdtemp(path.join(tmpdir(), "recipes-meta-"))
  try {
    const directory = path.join(root, "content", "recipes", "demo-fixture")
    await mkdir(directory, { recursive: true })
    await writeFile(path.join(directory, "recipe.json"), JSON.stringify(meta))
    const compiled = ts.transpileModule(source.replaceAll("process.cwd()", JSON.stringify(root)), {
      compilerOptions: { module: ts.ModuleKind.ESNext },
    }).outputText
    const { getAllRecipes } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`)
    return getAllRecipes()[0]
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
