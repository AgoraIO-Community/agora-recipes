import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { test } from 'node:test'
import { defaultFilters, discoverRecipes } from '../lib/recipe-discovery.ts'

const curated = JSON.parse(readFileSync(new URL('../content/showcase.json', import.meta.url)))
const recipes = readdirSync(new URL('../content/recipes/', import.meta.url), { withFileTypes: true })
  .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
  .map(({ name: slug }) => {
    const metadata = JSON.parse(readFileSync(new URL(`../content/recipes/${slug}/recipe.json`, import.meta.url)))
    const recommendedOrder = curated.findIndex(entry => entry.slug === slug)
    return { ...metadata, slug, ...(recommendedOrder < 0 ? {} : { recommendedOrder, showcase: curated[recommendedOrder] }) }
  })
const search = (query, extra = {}) => discoverRecipes(recipes, { ...defaultFilters, query, ...extra })

test('default catalog includes every recipe with the six recommendations first', () => {
  const results = discoverRecipes(recipes, defaultFilters)
  assert.equal(results.length, recipes.length)
  assert.deepEqual(results.slice(0, 6).map(recipe => recipe.slug), curated.map(entry => entry.slug))
  assert.ok(results.slice(6).every(recipe => recipe.recommendedOrder === undefined))
})
test('search spans fields, supports multiple words, and includes Chinese aliases', () => {
  assert.ok(search('Python CRM').some(recipe => recipe.slug === 'aria-voice-sales-agent'))
  assert.equal(search('财富热线')[0].slug, 'agora-rotary-dial-phone')
  assert.equal(search('  ARIA—sales  ')[0].slug, 'aria-voice-sales-agent')
  assert.ok(search('zicojiao podcasts').some(recipe => recipe.slug === 'agora-podcasts'))
  assert.ok(search('webhooks').some(recipe => recipe.slug === 'webhooks' && recipe.recommendedOrder === undefined))
})
test('topic, category, platform, and preview filters combine without hiding valid matches', () => {
  const results = search('', { topic: 'tools', platform: 'Python', category: 'rtc', previewOnly: true })
  assert.deepEqual(results.map(recipe => recipe.slug), ['aria-voice-sales-agent'])
  assert.equal(search('not-a-real-recipe-zzzz').length, 0)
})
test('descriptions, card summaries, natural phrases, and domain aliases are searchable', () => {
  assert.ok(search('pricing objections').some(recipe => recipe.slug === 'aria-voice-sales-agent'))
  assert.ok(search('how can I update my customer relationship management').some(recipe => recipe.slug === 'aria-voice-sales-agent'))
  assert.ok(search('会议助手').some(recipe => recipe.slug === 'agora-meeting-copilot'))
  assert.ok(search('语音转文字').some(recipe => recipe.slug === 'agora-meeting-copilot'))
  assert.ok(search('escape room').some(recipe => recipe.slug === 'agora-rotary-dial-phone'))
})
test('minor typos and swapped letters match across fields without fuzzy short-code matches', () => {
  assert.ok(search('pyhton CRM').some(recipe => recipe.slug === 'aria-voice-sales-agent'))
  assert.ok(search('transcripton').some(recipe => recipe.slug === 'agora-meeting-copilot'))
  assert.ok(search('pricng objecrtions').some(recipe => recipe.slug === 'aria-voice-sales-agent'))
  assert.equal(search('qzx').length, 0)
  assert.equal(search('pricing nonexistentcapability').length, 0)
})
test('exact title and description matches rank ahead of approximate matches', () => {
  const base = { ...recipes[0], title: '', tagline: '', description: '', author: '', slug: '', mainRepoUrl: '', tags: [], platforms: [], useCases: [], capabilities: [], showcase: undefined, recommendedOrder: undefined }
  const fixtures = [
    { ...base, slug: 'fuzzy', description: 'Transcripton' },
    { ...base, slug: 'description', description: 'Transcription' },
    { ...base, slug: 'title', title: 'Transcription' },
  ]
  assert.deepEqual(discoverRecipes(fixtures, { ...defaultFilters, query: 'transcription' }).map(recipe => recipe.slug), ['title', 'description', 'fuzzy'])
})
test('explicit date and alphabetical sorts override pinned order', () => {
  const alphabetical = search('', { sort: 'title' })
  assert.deepEqual(alphabetical.map(recipe => recipe.title), recipes.map(recipe => recipe.title).sort((a, b) => a.localeCompare(b)))
  const dates = search('', { sort: 'updated' }).map(recipe => recipe.updated)
  assert.deepEqual(dates, [...dates].sort().reverse())
})
test('all curated assets refer to known unique recipes, local posters, and canonical HTTPS media', () => {
  assert.equal(new Set(curated.map(entry => entry.slug)).size, 6)
  for (const entry of curated) {
    assert.ok(recipes.some(recipe => recipe.slug === entry.slug))
    assert.ok(readFileSync(new URL(`../public${entry.thumbnail}`, import.meta.url)).length < 150_000)
    for (const url of [entry.demoUrl, entry.videoUrl].filter(Boolean)) {
      assert.equal(new URL(url).protocol, 'https:')
      assert.equal(new URL(url).search, '')
    }
  }
  assert.equal(curated.find(entry => entry.slug === 'worldcupvoice').demoUrl, undefined)
})
