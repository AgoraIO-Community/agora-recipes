import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import ts from "typescript"

// Load the actual TSX component without adding a test runner dependency.
async function componentModule(filename) {
  const source = await readFile(new URL(filename, import.meta.url), "utf8")
  let compiled = ts.transpileModule(source, {
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext },
  }).outputText
  for (const [, name] of [...compiled.matchAll(/from "([^"]+)"/g)]) {
    const resolved = name === "./mermaid-diagram"
      ? await componentModule("../components/mermaid-diagram.tsx")
      : import.meta.resolve(name)
    compiled = compiled.replace(`from "${name}"`, `from "${resolved}"`)
  }
  return `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
}
const { Markdown } = await import(await componentModule("../components/markdown.tsx"))
const render = (source, props = {}) => renderToStaticMarkup(React.createElement(Markdown, { source, ...props }))

test("renders README HTML wrappers, line breaks, and expandable details", () => {
  const html = render('<div align="center">\n\n# Hello\n\n</div>\n\nOne<br/>Two\n\n<details><summary>More</summary>Details</details>')
  assert.match(html, /<div align="center">/)
  assert.match(html, /<h1 id="hello">Hello<\/h1>/)
  assert.match(html, /One<br\/>Two/)
  assert.match(html, /<details><summary>More<\/summary>Details<\/details>/)
  assert.doesNotMatch(html, /&lt;div/)
})

test("preserves literal HTML in inline and fenced code", () => {
  const html = render('`<div align="center">`\n\n```html\n<div>Example</div>\n```')
  assert.match(html, /<code>&lt;div align=&quot;center&quot;&gt;<\/code>/)
  assert.match(html, /<pre><code class="language-html">&lt;div&gt;Example&lt;\/div&gt;/)
})

test("removes executable HTML, event handlers, and unsafe links", () => {
  const html = render('<script>alert(1)</script>\n\n<img src="https://example.com/a.png" onerror="alert(2)">\n\n<a href="javascript:alert(3)">Click</a>\n\n<iframe src="https://example.com"></iframe>')
  assert.doesNotMatch(html, /<script|<iframe|onerror|javascript:|alert\(/)
  assert.match(html, />Click<\/a>/)
})

test("resolves HTML and Markdown images relative to the GitHub recipe", () => {
  const html = render('<img src="assets/logo.png" alt="Logo">\n\n![Demo](../demo.png)', {
    sourceUrl: "https://github.com/owner/repo/blob/main/docs/README.md",
  })
  assert.match(html, /src="https:\/\/raw.githubusercontent.com\/owner\/repo\/main\/docs\/assets\/logo.png"/)
  assert.match(html, /src="https:\/\/raw.githubusercontent.com\/owner\/repo\/main\/demo.png"/)
})

test("preserves metadata, heading links, nested lists, and tables", () => {
  const html = render('---\nrecipe_version: 1\n---\n\n# Setup\n\n[Setup](#setup)\n\n- Parent\n  - Child\n\n| A | B |\n| --- | --- |\n| 1 | 2 |', { headingOffset: 1 })
  assert.match(html, /data-recipe-frontmatter/)
  assert.match(html, /<h2 id="setup">Setup<\/h2>/)
  assert.match(html, /href="#setup"/)
  assert.match(html, /Parent\s*<ul>/)
  assert.match(html, /<td>1<\/td>/)
})

test("affected catalog recipes no longer show HTML wrappers as text", async () => {
  for (const slug of ["agora-matchcast", "agora-meeting-copilot", "aria-voice-sales-agent", "worldcupvoice"]) {
    const artifact = JSON.parse(await readFile(new URL(`../content/generated/recipes/${slug}.json`, import.meta.url), "utf8"))
    const html = render(artifact.recipeDocument.markdown, { sourceUrl: artifact.recipeDocument.viewUrl })
    const prose = html.replace(/<code\b[^>]*>[\s\S]*?<\/code>/g, "")
    assert.doesNotMatch(prose, /&lt;\/?(?:div|br|details|summary)(?:&gt;|\s|\/)/, slug)
  }
})


test("routes Mermaid fences to a diagram while leaving regular code alone", () => {
  const html = render('```mermaid\nflowchart LR\nA --> B\n```\n\n```js\nconst value = 1\n```')
  assert.match(html, /<figure[^>]*aria-label="Recipe diagram"/)
  assert.match(html, /Loading diagram/)
  assert.match(html, /Diagram source/)
  assert.match(html, /<pre><code class="language-js">const value = 1/)
})
