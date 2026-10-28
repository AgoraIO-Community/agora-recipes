import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeDocumentLocale, authorLanguageLinks, discoverDocumentLanguages } from '../lib/document-languages.mjs'
import { selectDocument } from '../lib/documents.ts'

const sourceUrl = 'https://github.com/example/project/blob/main/README.md'
const chineseUrl = 'https://github.com/example/project/blob/main/README.zh-CN.md'
const original = { rawUrl: 'https://raw.githubusercontent.com/example/project/main/README.md', viewUrl: sourceUrl, markdown: '# Original guide' }
const chinese = { rawUrl: 'https://raw.githubusercontent.com/example/project/main/README.zh-CN.md', viewUrl: chineseUrl, markdown: '[English](README.md) · **简体中文**\n\n# 原始教程\n![图](./images/example.png)' }

test('source language aliases keep script distinctions without changing filenames', () => {
  for (const [input, expected] of [['zh-CN', 'zh-Hans'], ['zh-TW', 'zh-Hant'], ['zh-HK', 'zh-Hant'], ['jp', 'ja'], ['English', 'en'], ['中文', 'zh']]) assert.equal(normalizeDocumentLocale(input), expected)
  assert.equal(normalizeDocumentLocale('a tutorial in English'), undefined)
  assert.equal(authorLanguageLinks('**English** · [简体中文](README.zh-CN.md)', sourceUrl)[0].url, chineseUrl)
})

test('automatic versions require author navigation, the same guide, and a reciprocal link', async () => {
  const markdown = '**English** · [简体中文](README.zh-CN.md)'
  const calls = []
  const result = await discoverDocumentLanguages({ sourceUrl, markdown, fetchDocument: async url => { calls.push(url); return chinese } })
  assert.deepEqual(calls, [chineseUrl])
  assert.equal(result.originalLanguage, 'en')
  assert.equal(result.versions['zh-Hans'].verifiedBy, 'author-navigation')
  assert.equal(result.versions['zh-Hans'].markdown, chinese.markdown)
  assert.equal(markdown, '**English** · [简体中文](README.zh-CN.md)')
  for (const nav of ['README.zh-CN.md exists', '[简体中文](OTHER.zh-CN.md)', '[简体中文](https://github.com/other/project/blob/main/README.zh-CN.md)', '```md\n[简体中文](README.zh-CN.md)\n```']) {
    const value = await discoverDocumentLanguages({ sourceUrl, markdown: nav, fetchDocument: async () => { throw new Error('unconfirmed candidates must not be fetched') } })
    assert.deepEqual(value.versions, {})
  }
  const unlinked = await discoverDocumentLanguages({ sourceUrl, markdown, fetchDocument: async () => ({ ...chinese, markdown: '# A different document without language navigation' }) })
  assert.deepEqual(unlinked.versions, {})
})

test('manual mappings retain unavailable versions and never silently substitute a different document', async () => {
  const result = await discoverDocumentLanguages({ sourceUrl, markdown: original.markdown, mapping: { originalLanguage: 'en', versions: { ja: 'https://github.com/example/project/blob/main/docs/ja/RECIPE.md' } }, fetchDocument: async url => ({ rawUrl: url, viewUrl: url, markdown: '', fetchError: '404 Not Found' }) })
  assert.equal(result.versions.ja.verifiedBy, 'maintainer')
  const entry = { recipeDocument: original, documentLanguages: result }
  assert.equal(selectDocument(entry, 'ja').document, original)
  assert.equal(selectDocument(entry, 'en', 'ja').document.fetchError, '404 Not Found')
  assert.equal(selectDocument(entry, 'en', 'zh-Hant').document, undefined)
})

test('automatic selection uses an exact confirmed language/script, English, then the original', () => {
  const entry = { recipeDocument: original, documentLanguages: { originalLanguage: 'en', versions: { 'zh-Hans': { ...chinese, language: 'zh-Hans', verifiedBy: 'author-navigation' } } } }
  assert.equal(selectDocument(entry, 'zh-Hans').document, entry.documentLanguages.versions['zh-Hans'])
  assert.equal(selectDocument(entry, 'zh-Hant').document, original)
  assert.equal(selectDocument(entry, 'ja').document, original)
  assert.equal(selectDocument(entry, 'ja', 'zh-Hans').document, entry.documentLanguages.versions['zh-Hans'])
  assert.equal(selectDocument(entry, 'zh-Hans', 'original').document, original)
  const unknown = { recipeDocument: original, documentLanguages: { versions: { zh: { ...chinese, language: 'zh' } } } }
  assert.equal(selectDocument(unknown, 'zh-Hans').document, original)
  assert.equal(selectDocument(unknown, 'zh-Hant').document, original)
})

test('an explicit current-language marker survives a temporarily broken alternate without guessing from its filename', async () => {
  const result = await discoverDocumentLanguages({ sourceUrl, markdown: '**English** · [简体中文](README.zh-CN.md)', fetchDocument: async () => ({ markdown: '', fetchError: '404' }) })
  assert.equal(result.originalLanguage, 'en')
  assert.deepEqual(result.versions, {})
})


test('code examples and programming-language navigation do not identify an author document language', async () => {
  assert.deepEqual(authorLanguageLinks('[Go](README.md) [New](README.md)', sourceUrl), [])
  assert.deepEqual(authorLanguageLinks('````md\n```\n[简体中文](README.zh-CN.md)\n```\n````', sourceUrl), [])
  const result = await discoverDocumentLanguages({ sourceUrl, markdown: '```md\n**English** · [简体中文](README.zh-CN.md)\n', fetchDocument: async () => { throw new Error('code examples are not language navigation') } })
  assert.equal(result.originalLanguage, undefined)
  assert.deepEqual(result.versions, {})
})
