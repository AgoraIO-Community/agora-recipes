import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import ts from 'typescript'

async function load(file) {
  const source = readFileSync(new URL(`../lib/${file}.ts`, import.meta.url), 'utf8')
    .replace('"./analytics-events"', JSON.stringify(new URL('../lib/analytics-events.ts', import.meta.url).href))
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText
  return import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)
}
const { basicPageCount, basicSearchVocabulary, basicSearchTerm, sendBasicCount } = await load('basic-analytics')
const { validBasicCount, recordBasicCount } = await load('basic-analytics-server')
const vocabulary = basicSearchVocabulary([{ slug: 'meeting-copilot', title: 'Meeting Copilot', platforms: ['TypeScript'], useCases: ['Meetings'], capabilities: ['Transcription'] }])
const config = { enabled: true, origin: 'https://recipes.example.com', token: 'phc_fixture', host: 'https://metrics.example.com/relay', recipes: new Set(['meeting-copilot']), topics: new Set(['voice-ai']), terms: new Set(vocabulary.values()) }
const page = { metric: 'page_view', page_type: 'recipe', content_slug: 'meeting-copilot' }
const search = { metric: 'search', page_type: 'catalog', search_term: 'react', zero_results: false }
const request = (count, headers = {}, url = config.origin + '/api/analytics/basic') => new Request(url, { method: 'POST', headers: { origin: config.origin, 'content-type': 'application/json', ...headers }, body: JSON.stringify(count) })

test('basic searches emit only approved public labels, including recipe aliases; private and unknown text becomes other', () => {
  for (const [input, expected] of [[' REACT ', 'react'], ['ＴｙｐｅＳｃｒｉｐｔ', 'typescript'], ['meeting-copilot', 'meeting-copilot'], ['Meeting Copilot', 'meeting-copilot'], ['Transcription', 'transcription']]) assert.equal(basicSearchTerm(input, vocabulary), expected)
  const localized = basicSearchVocabulary([{ slug: 'meeting-copilot', title: '会议助手', platforms: ['TypeScript'], useCases: ['Meetings'], capabilities: ['Transcription'] }])
  assert.equal(basicSearchTerm('会议助手', localized), 'meeting-copilot')
  assert.equal(basicSearchTerm('meeting-copilot', localized), 'meeting-copilot')
  assert.ok(config.terms.has(basicSearchTerm('会议助手', localized)))
  for (const input of ['Jane Doe', 'alice@example.com', 'https://private.example.com', 'token=ghp_sensitive', '12345678901', 'new unknown phrase', 'react alice@example.com']) assert.equal(basicSearchTerm(input, vocabulary), 'other')
})

test('basic page context is canonical public content, without queries, return paths, arbitrary routes, or locale dimensions', () => {
  assert.deepEqual(basicPageCount('/zh-Hans/recipes/meeting-copilot/'), page)
  assert.deepEqual(basicPageCount('/recipes/meeting-copilot/guide/original'), page)
  assert.deepEqual(basicPageCount('/ja/recipes/meeting-copilot/guide/zh-Hans'), page)
  assert.deepEqual(basicPageCount('/topics/voice-ai'), { metric: 'page_view', page_type: 'topic', topic_slug: 'voice-ai' })
  assert.deepEqual(basicPageCount('/ja/'), { metric: 'page_view', page_type: 'catalog' })
  for (const path of ['/account/alice', '/recipes/meeting-copilot?email=alice', '/recipes/meeting-copilot/extra', '/private', '/api/v1/recipes']) assert.equal(basicPageCount(path), undefined)
})

test('basic browser transport has no cookies, referrer, persistent identity, timestamp, retry, or consent marker', async () => {
  const sent = []
  sendBasicCount(search, async (...args) => { sent.push(args); return new Response(null, { status: 204 }) })
  await new Promise(resolve => setImmediate(resolve))
  const [url, options] = sent[0]
  assert.equal(url, '/api/analytics/basic')
  assert.equal(options.credentials, 'omit')
  assert.equal(options.referrerPolicy, 'no-referrer')
  assert.equal(options.redirect, 'error')
  assert.deepEqual(JSON.parse(options.body), search)
  assert.deepEqual(options.headers, { 'Content-Type': 'application/json' })
  sendBasicCount(page, async () => { throw new Error('offline') })
  await new Promise(resolve => setImmediate(resolve))
})

test('the collector rejects identities, free text, campaign data, forged dimensions, unknown slugs, and malformed shapes', () => {
  for (const value of [page, search, { ...search, search_term: 'other', zero_results: true }, { metric: 'search', page_type: 'topic', topic_slug: 'voice-ai', search_term: 'meeting-copilot', zero_results: false }]) assert.deepEqual(validBasicCount(value, config), value)
  for (const value of [null, [], { ...page, user_id: 'alice' }, { ...page, distinct_id: 'anonymous-id' }, { ...search, search_id: 'random' }, { ...search, utm_source: 'email' }, { ...search, search_term: 'alice@example.com' }, { ...search, search_term: 'arbitrary new phrase' }, { ...search, page_type: 'recipe' }, { ...search, zero_results: 0 }, { ...page, content_slug: 'alice' }, { ...page, content_slug: ['meeting-copilot'] }, { ...page, topic_slug: 'voice-ai' }, { ...page, count: 100 }, { ...page, day: '2000-01-01' }, { ...page, search_term: 'react' }, { ...page, metric: ['page_view'] }, { metric: 'page_view', page_type: 'topic', topic_slug: 'private' }]) assert.equal(validBasicCount(value, config), undefined)
})

test('different visitors produce identical day-bucket counter increments and no browser metadata reaches the provider', async () => {
  const sent = []
  const sink = async (url, options) => { sent.push({ url: url.href, ...options }); return new Response(null, { status: 200 }) }
  for (const visitor of ['alice', 'bob']) {
    const result = await recordBasicCount(request(page, { cookie: `account=${visitor}`, authorization: `Bearer ${visitor}`, 'user-agent': visitor, 'x-forwarded-for': visitor, referer: `${config.origin}/?q=${visitor}` }), config, sink, () => Date.parse('2026-11-05T12:23:45Z'))
    assert.equal(result.status, 204)
  }
  assert.equal(sent.length, 2)
  assert.equal(sent[0].body, sent[1].body)
  assert.equal(sent[0].url, 'https://metrics.example.com/relay/i/v0/e/')
  assert.deepEqual(sent[0].headers, { 'Content-Type': 'application/json' })
  const body = JSON.parse(sent[0].body)
  assert.equal(body.distinct_id, 'recipes:aggregate')
  assert.equal(body.timestamp, '2026-11-05T00:00:00.000Z')
  assert.equal(body.properties.count, 1)
  assert.equal(body.properties.$process_person_profile, false)
  assert.equal(body.properties.$ip, '0.0.0.0')
  assert.equal(body.properties.$geoip_disable, true)
  assert.equal(body.properties.measurement_tier, 'aggregate')
  assert.doesNotMatch(sent[0].body, /alice|bob|session|device|cookie|referrer|utm_|search_id|12:23/)
})

test('non-production requests, cross-origin calls, wrong content types, and oversized or invalid bodies never reach the sink', async () => {
  let calls = 0
  const sink = async () => { calls++; return new Response(null, { status: 200 }) }
  assert.equal((await recordBasicCount(request(page), { ...config, enabled: false }, sink)).status, 204)
  assert.equal((await recordBasicCount(request(page, { origin: 'https://elsewhere.example.com' }), config, sink)).status, 403)
  assert.equal((await recordBasicCount(request(page, { origin: 'https://preview.example.com' }, 'https://preview.example.com/api/analytics/basic'), config, sink)).status, 403)
  assert.equal((await recordBasicCount(request(page, { 'sec-fetch-site': 'cross-site' }), config, sink)).status, 403)
  assert.equal((await recordBasicCount(request(page, { 'content-type': 'text/plain' }), config, sink)).status, 415)
  assert.equal((await recordBasicCount(request({ ...page, extra: 'x'.repeat(600) }), config, sink)).status, 400)
  const invalid = new Request(config.origin + '/api/analytics/basic', { method: 'POST', headers: { origin: config.origin, 'content-type': 'application/json' }, body: '{' })
  assert.equal((await recordBasicCount(invalid, config, sink)).status, 400)
  assert.equal(calls, 0)
})

test('proxy prefixes and host fallback work for counters; failures do not trigger retries or expose provider responses', async () => {
  for (const [host, expected] of [[undefined, 'https://us.i.posthog.com/i/v0/e/'], ['/relay', config.origin + '/relay/i/v0/e/'], ['https://metrics.example.com/', 'https://metrics.example.com/i/v0/e/']]) {
    const calls = []
    const result = await recordBasicCount(request(search), { ...config, host }, async (url) => { calls.push(url.href); return new Response(null, { status: 200 }) })
    assert.equal(result.status, 204)
    assert.deepEqual(calls, [expected])
  }
  for (const host of ['http://metrics.example.com', 'https://user:pass@metrics.example.com', 'https://metrics.example.com/?token=private']) assert.equal((await recordBasicCount(request(page), { ...config, host })).status, 503)
  let calls = 0
  const failure = await recordBasicCount(request(page), config, async () => { calls++; return new Response('private provider error', { status: 500 }) })
  assert.equal(failure.status, 503)
  assert.equal(await failure.text(), '')
  assert.equal(calls, 1)
  assert.equal((await recordBasicCount(request(page), { ...config, token: undefined })).status, 503)
})
