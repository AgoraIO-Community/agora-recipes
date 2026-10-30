import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const origin = process.argv[2] ?? 'http://localhost:3000'
const publicOrigin = process.env.SITE_URL ?? 'https://recipes.agora.io'
const locales = ['en', 'zh-Hans', 'zh-Hant', 'ja', 'hi', 'es', 'pt-BR']
const localized = (path, locale) => locale === 'en' ? path : `/${locale}${path === '/' ? '' : path}`
async function html(path) { const response = await fetch(new URL(path, origin)); assert.equal(response.status, 200, path); return response.text() }
const rawLink = source => source.match(/class="recipe-document-actions"[\s\S]*?<a[^>]*href="([^"]+)"/)?.[1]
const original = JSON.parse(await readFile(new URL('../content/generated/recipes/agora-rotary-dial-phone.json', import.meta.url), 'utf8'))
assert.ok(original.documentLanguages?.versions['zh-Hans'], 'real author-navigation translation was built')
for (const locale of locales) {
  const home = await html(localized('/', locale))
  assert.ok(home.includes(`lang="${locale}"`), `${locale}: page language`)
  assert.ok(home.includes(`href="${localized('/topics', locale)}"`), `${locale}: shared Topics navigation`)
  const directory = await html(localized('/topics', locale))
  assert.ok(directory.includes('voice-ai-hackathon-2026'), `${locale}: activity archive`)
  const topic = await html(localized('/topics/voice-ai-in-practice', locale))
  const cards = [...topic.matchAll(/<article[^>]*data-recipe-slug="[^"]+"[^>]*>([\s\S]*?)<\/article>/g)]
  assert.equal(cards.length, 8, `${locale}: explicit Topic members`)
  for (const [, card] of cards) assert.doesNotMatch(card, /href="(?:\/(?:zh-Hans|zh-Hant|ja|hi|es|pt-BR))?\/topics\//, 'cards do not link Topic membership')
  const conference = await html(localized('/topics/irte2026', locale))
  assert.ok(conference.includes('dumpling-booth'), `${locale}: conference explicitly includes the original Dumpling Booth entry`)
  const conferenceMembers = [...conference.matchAll(/<article[^>]*data-recipe-slug="([^"]+)"/g)].map(match => match[1]).sort()
  assert.deepEqual(conferenceMembers, ['dumpling-booth', 'agora-drawguess', 'agora-arena', 'agora-rotary-dial-phone', 'm5-sticks3-voice-agent'].sort(), `${locale}: owner-confirmed demos and the author-confirmed workshop are all present`)
  assert.ok(conference.includes('2026-10-23') && conference.includes('2026-10-24'), `${locale}: verified conference dates`)
  const detailPath = localized('/recipes/agora-rotary-dial-phone', locale)
  const detail = await html(`${detailPath}?returnTo=${encodeURIComponent(localized('/topics/voice-ai-in-practice', locale) + '?q=Rotary#recipes')}`)
  assert.ok(detail.includes(`rel="canonical" href="${new URL(detailPath, publicOrigin).href}"`), `${locale}: clean canonical`)
  assert.ok(detail.includes('property="og:image"'), `${locale}: social image`)
  const expected = locale === 'zh-Hans' ? original.documentLanguages.versions['zh-Hans'].rawUrl : original.recipeDocument.rawUrl
  assert.equal(rawLink(detail), expected, `${locale}: confirmed source selection/fallback`)
  const manual = await html(`${detailPath}/guide/original`)
  assert.equal(rawLink(manual), original.recipeDocument.rawUrl, `${locale}: explicit original`)
  const missing = await html(`${detailPath}/guide/ja`)
  const messages = locale === 'en' ? {} : JSON.parse(await readFile(new URL(`../content/i18n/${locale}.json`, import.meta.url), 'utf8')).ui
  assert.ok(missing.includes(messages['This guide version is unavailable'] ?? 'This guide version is unavailable'), `${locale}: explicit missing language message`)
  assert.ok(missing.includes('content="noindex, follow"'), `${locale}: missing version is not indexed`)
  assert.doesNotMatch(missing, /type="text\/markdown"/, `${locale}: unavailable manual document has no misleading alternate`)
  assert.equal(rawLink(missing), undefined, `${locale}: missing manual version never substitutes another reader`)
  const contribution = await html(localized('/contribute', locale))
  assert.ok(contribution.includes('data-contribution="github_form"'), `${locale}: GitHub handoff`)
  assert.ok(contribution.includes('data-contribution="github_issue"'), `${locale}: form-independent Issue recovery`)
  assert.ok(contribution.includes('Help me prepare an English submission for Agora Recipes'), `${locale}: reviewable AI submission prompt`)
  assert.ok(contribution.includes('data-contribution="pr_instructions"'), `${locale}: direct PR workflow`)
}
const image = await fetch(new URL('/social-card.png', origin))
assert.equal(image.status, 200)
assert.match(image.headers.get('content-type'), /image\/png/)
assert.equal(Buffer.from(await image.arrayBuffer()).subarray(0, 8).toString('hex'), '89504e470d0a1a0a')
const api = await fetch(new URL('/api/v1/recipes/python-quickstart', origin)).then(response => response.json())
assert.equal(api.schemaVersion, 1)
assert.equal((await fetch(new URL('/topics/unknown-phase-one-topic', origin))).status, 404)


const searchAsset = await fetch(new URL('/search-index.json', origin)).then(response => response.json())
assert.equal(searchAsset.version, 1)
assert.match(searchAsset.documents['dumpling-booth'], /gift/i, 'the static search asset contains original guide text')
assert.doesNotMatch(searchAsset.documents['dumpling-booth'], /<script\b/i)

console.log('Phase-one checks passed: seven locales, Topic membership and archives, original guides, static search asset, sharing, contribution paths, and Recipe API compatibility.')
