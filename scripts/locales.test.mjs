import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import test from 'node:test'
import { locales, localePath, catalogReturnPath, translate } from '../lib/locales.ts'

test('all four site locales keep the existing English URLs and preserve localized paths', () => {
  assert.equal(localePath('/recipes/python-quickstart', 'en'), '/recipes/python-quickstart')
  for (const locale of locales) {
    assert.equal(localePath('/zh-Hans/recipes/python-quickstart', locale), locale === 'en' ? '/recipes/python-quickstart' : `/${locale}/recipes/python-quickstart`)
  }
})
test('return targets preserve list state and reject external or unrelated destinations', () => {
  assert.equal(catalogReturnPath('/zh-Hant?platform=Python&all=1#recipes', 'ja'), '/zh-Hant?platform=Python&all=1#recipes')
  for (const value of ['//example.com', 'https://example.com', '/contribute', '/recipes/x', '/\\example.com', '/ja/../contribute', '/%2f%2fexample.com']) assert.equal(catalogReturnPath(value, 'ja'), '/ja#recipes')
  assert.equal(catalogReturnPath(undefined, 'zh-Hans'), '/zh-Hans#recipes')
})
test('presentation dictionaries use known content identities and consistent UI terms', () => {
  const slugs = readdirSync(new URL('../content/recipes', import.meta.url), { withFileTypes: true }).filter(e => e.isDirectory() && !e.name.startsWith('.')).map(e => e.name).sort()
  const dictionaries = ['zh-Hans', 'zh-Hant', 'ja'].map(locale => JSON.parse(readFileSync(new URL(`../content/i18n/${locale}.json`, import.meta.url))))
  for (const dictionary of dictionaries) {
    assert.deepEqual(Object.keys(dictionary).sort(), ["entries", "ui"], "UI feedback must be inside the dictionary loaded by the site")
    assert.ok(Object.keys(dictionary.entries).every(slug => slugs.includes(slug)), "translation keys reference real entries")
    assert.deepEqual(Object.keys(dictionary.ui).sort(), Object.keys(dictionaries[0].ui).sort())
    for (const value of Object.values(dictionary.entries)) assert.ok(value.tagline.trim() && value.description.trim())
    assert.equal(translate(dictionary.ui, 'Show {count} results', { count: 12 }).includes('12'), true)
  }
})

test('presentation translation preserves original documents and falls back for a new submission', async () => {
  const ts = (await import('typescript')).default
  const helpers = ts.transpileModule(readFileSync(new URL('../lib/locales.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText
  const helperUrl = `data:text/javascript;base64,${Buffer.from(helpers).toString('base64')}`
  const source = readFileSync(new URL('../lib/i18n.ts', import.meta.url), 'utf8')
    .replace('import "server-only"', '')
    .replace(/import (simplified|traditional|japanese) from "@\/content\/i18n\/([^\"]+)"/g, (_, name, file) => `const ${name} = ${readFileSync(new URL(`../content/i18n/${file}`, import.meta.url), 'utf8')}`)
    .replace('from "./locales"', `from "${helperUrl}"`)
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText
  const { localizeEntry } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)
  const original = { slug: 'aria-voice-sales-agent', title: 'Aria', tagline: 'Original', description: 'Original description', recipeUrl: 'https://github.com/example/project/blob/main/README.zh-CN.md', author: 'Original Author', recipeDocument: { markdown: '# Original guide\n原文', rawUrl: 'https://example.com/README.zh-CN.md' } }
  const snapshot = structuredClone(original)
  for (const locale of locales) {
    const localized = localizeEntry(original, locale)
    assert.equal(localized.author, original.author)
    assert.equal(localized.recipeUrl, original.recipeUrl)
    assert.deepEqual(localized.recipeDocument, original.recipeDocument)
    const fresh = { ...original, slug: 'new-untranslated-submission' }
    assert.deepEqual(localizeEntry(fresh, locale), fresh)
  }
  assert.deepEqual(original, snapshot)
})

test('Topic return targets retain the exact source list and reject lookalike or escaping routes', () => {
  for (const locale of locales) {
    const href = `${localePath('/topics/voice-ai-in-practice', locale)}?q=voice&platform=Python&material=demo&all=1#recipes`
    assert.equal(catalogReturnPath(href, locale), href)
    for (const bad of ['/entopics/voice-ai', '/topics/a/b', '/ja/topics/../contribute', '/ja/topics/a%2fb', '//example.com/topics/a']) assert.equal(catalogReturnPath(bad, locale), `${localePath('/', locale)}#recipes`)
  }
})
