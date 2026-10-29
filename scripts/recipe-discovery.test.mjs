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
    return { ...metadata, slug, ...(recommendedOrder < 0 ? {} : { showcase: curated[recommendedOrder], ...(curated[recommendedOrder].recommended === false ? {} : { recommendedOrder }) }) }
  })
const search = (query, extra = {}) => discoverRecipes(recipes, { ...defaultFilters, query, ...extra })

test('default catalog includes every recipe with images first and curated order preserved', () => {
  const results = discoverRecipes(recipes, defaultFilters)
  assert.equal(results.length, recipes.length)
  const imageCount = recipes.filter(recipe => recipe.showcase?.thumbnail).length
  assert.ok(results.slice(0, imageCount).every(recipe => recipe.showcase?.thumbnail))
  assert.ok(results.slice(imageCount).every(recipe => !recipe.showcase?.thumbnail))
  assert.deepEqual(results.filter(recipe => recipe.recommendedOrder !== undefined).map(recipe => recipe.slug), curated.filter(entry => entry.recommended !== false).map(entry => entry.slug))
})
test('search spans fields, supports multiple words, and includes Chinese aliases', () => {
  assert.ok(search('Python CRM').some(recipe => recipe.slug === 'aria-voice-sales-agent'))
  assert.equal(search('财富热线')[0].slug, 'agora-rotary-dial-phone')
  assert.equal(search('  ARIA—sales  ')[0].slug, 'aria-voice-sales-agent')
  assert.ok(search('zicojiao podcasts').some(recipe => recipe.slug === 'agora-podcasts'))
  assert.ok(search('webhooks').some(recipe => recipe.slug === 'webhooks' && recipe.recommendedOrder === undefined))
})
test('topic, category, platform, and preview filters combine without hiding valid matches', () => {
  const results = search('', { topic: 'tools', platforms: ['Python'], category: 'rtc', previewOnly: true })
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
test('explicit date and alphabetical sorts apply within image groups', () => {
  const alphabetical = search('', { sort: 'title' })
  const expected = [true, false].flatMap(hasImage => recipes.filter(recipe => Boolean(recipe.showcase?.thumbnail) === hasImage).map(recipe => recipe.title).sort((a, b) => a.localeCompare(b)))
  assert.deepEqual(alphabetical.map(recipe => recipe.title), expected)
  for (const hasImage of [true, false]) {
    const dates = search('', { sort: 'updated' }).filter(recipe => Boolean(recipe.showcase?.thumbnail) === hasImage).map(recipe => recipe.updated)
    assert.deepEqual(dates, [...dates].sort().reverse())
  }
})
test('thumbnail presence takes priority over recommendation, date and title', () => {
  const base = { ...recipes[0], showcase: undefined, recommendedOrder: undefined }
  const fixtures = [
    { ...base, slug: 'no-image', title: 'Aardvark', updated: '2026-12-31', recommendedOrder: 0, showcase: { thumbnail: '' } },
    { ...base, slug: 'image-beta', title: 'Beta', updated: '2026-01-01', recommendedOrder: 1, showcase: { thumbnail: '/recipes/beta.webp' } },
    { ...base, slug: 'image-alpha', title: 'Alpha', updated: '2026-02-01', recommendedOrder: 2, showcase: { thumbnail: '/recipes/alpha.webp' } },
    { ...base, slug: 'no-showcase', title: 'Zulu', updated: '2025-01-01' },
  ]
  for (const sort of ['recommended', 'updated', 'title']) {
    const results = discoverRecipes(fixtures, { ...defaultFilters, sort })
    assert.deepEqual(results.slice(0, 2).map(recipe => recipe.slug), sort === 'recommended' ? ['image-beta', 'image-alpha'] : ['image-alpha', 'image-beta'])
    assert.deepEqual(results.slice(2).map(recipe => recipe.slug), ['no-image', 'no-showcase'])
  }
})
test('all curated assets refer to known unique recipes, local posters, and canonical HTTPS media', () => {
  assert.equal(new Set(curated.map(entry => entry.slug)).size, curated.length)
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

test('platform choices use OR and combine with search and capability requirements', () => {
  const results = search('', { platforms: ['Python', 'iOS'] })
  assert.ok(results.some(recipe => recipe.platforms.includes('Python')))
  assert.ok(results.some(recipe => recipe.platforms.includes('iOS')))
  assert.ok(results.every(recipe => recipe.platforms.includes('Python') || recipe.platforms.includes('iOS')))
  assert.ok(search('CRM', { platforms: ['iOS', 'Python'] }).some(recipe => recipe.slug === 'aria-voice-sales-agent'))
  const fixture = { ...recipes[0], platforms: ['Web'], useCases: ['Meeting'], capabilities: ['Transcription'], demoUrl: undefined, showcase: undefined }
  assert.equal(discoverRecipes([fixture], { ...defaultFilters, capabilities: ['Transcription', 'Translation'] }).length, 0)
  assert.equal(discoverRecipes([fixture], { ...defaultFilters, platforms: ['Web'], useCases: ['Meeting', 'Education'], capabilities: ['Transcription'] }).length, 1)
})
test('demo availability is independent of homepage recommendations', () => {
  const fixture = { ...recipes[0], slug: 'native-demo', recommendedOrder: undefined, showcase: undefined, demoUrl: 'https://testflight.apple.com/join/example' }
  assert.equal(discoverRecipes([fixture], { ...defaultFilters, previewOnly: true }).length, 1)
  assert.equal(discoverRecipes([{ ...fixture, demoUrl: undefined }], { ...defaultFilters, previewOnly: true }).length, 0)
  assert.ok(recipes.filter(recipe => recipe.demoUrl).length >= 5)
})
