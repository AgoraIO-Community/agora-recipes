import assert from 'node:assert/strict'
import test from 'node:test'
import { analyticsEnabled, analyticsOriginAllowed, analyticsUrl, campaignProperties, createAnalyticsEvent, eventActions, vercelProperties } from '../lib/analytics-events.ts'

test('only real Vercel production enables analytics; local builds, development, and previews stay off', () => {
  assert.equal(analyticsEnabled('production', '1', 'production'), true)
  for (const args of [['development', '1', 'production'], ['production', undefined, 'production'], ['production', '1', 'preview'], ['production', '1', undefined]]) assert.equal(analyticsEnabled(...args), false)
})

test('production-built pages only capture on the exact canonical HTTPS origin', () => {
  const productionOrigin = 'https://recipes.agora.io'
  assert.equal(analyticsOriginAllowed('https://recipes.agora.io/zh-Hans/recipes/example?q=ignored#section', productionOrigin), true)
  for (const url of [
    'http://recipes.agora.io/', 'http://localhost:3100/', 'http://127.0.0.1:4183/',
    'https://branch-preview.vercel.app/', 'https://production-build.vercel.app/',
    'https://staging.recipes.agora.io/', 'https://recipes.agora.io.evil.example/',
    'https://recipes.agora.io:444/', '', undefined,
  ]) assert.equal(analyticsOriginAllowed(url, productionOrigin), false, String(url))
  for (const origin of [undefined, '', 'not-a-url', 'http://recipes.agora.io', 'https://recipes.agora.io/path', 'https://user:secret@recipes.agora.io', 'https://recipes.agora.io?token=secret', 'https://recipes.agora.io#section']) {
    assert.equal(analyticsOriginAllowed(productionOrigin, origin), false, String(origin))
  }
})
test('all seven event families retain only bounded public dimensions', () => {
  assert.equal(Object.keys(eventActions).length, 7)
  for (const [name, actions] of Object.entries(eventActions)) {
    const result = createAnalyticsEvent(name, { action: actions[0], locale: 'zh-Hant', content_slug: 'my-project', topic_slug: 'community-topic', placement: 'catalog', result_count: 2, search: 'private query', account: 'private account', submission: 'private text', clipboard: 'secret', url: 'https://example.com?token=secret' })
    assert.deepEqual(Object.keys(result.properties).sort(), ['action', 'content_slug', 'locale', 'placement', 'result_count', 'topic_slug'])
    assert.doesNotMatch(JSON.stringify(result), /private|secret|token/)
  }
})

test('automatic loading uses the existing bounded event family in all new locales', () => {
  for (const locale of ['hi', 'es', 'pt-BR']) assert.deepEqual(createAnalyticsEvent('catalog_action', { action: 'load_more', locale, placement: 'catalog', result_count: 110 }).properties, { action: 'load_more', locale, placement: 'catalog', result_count: 110 })
})
test('false success and hover-preview events cannot enter the public vocabulary', () => {
  assert.equal(createAnalyticsEvent('submission_success', { action: 'success' }), undefined)
  assert.equal(createAnalyticsEvent('contribution_open', { action: 'submission_success' }), undefined)
  assert.equal(createAnalyticsEvent('share_action', { action: 'posted' }), undefined)
  assert.equal(createAnalyticsEvent('video_play', { action: 'hover_preview' }), undefined)
  const event = createAnalyticsEvent('catalog_action', { action: 'search', locale: 'bad', content_slug: 'private@email.com', topic_slug: '../../anything', placement: 'raw query', result_count: -1 })
  assert.deepEqual(event.properties, { action: 'search' })
})


test('page-view and custom-event URLs remove searches, source-list context, hashes, and credentials', () => {
  assert.equal(analyticsUrl('https://recipes.agora.io/zh-Hans/topics/example?q=private&returnTo=%2Fsecret#section'), 'https://recipes.agora.io/zh-Hans/topics/example')
  assert.equal(analyticsUrl('https://user:secret@example.com/path?token=secret'), 'https://example.com/path')
  assert.equal(analyticsUrl('javascript:alert(1)'), undefined)
})

test('search popularity groups normalized terms and preserves zero results and result positions', () => {
  const search = createAnalyticsEvent('catalog_action', { action: 'search', search_term: '  ＶＯＩＣＥ   Agent  ', result_count: 0, search_status: 'complete', result_position: 1 })
  assert.deepEqual(search.properties, { action: 'search', result_count: 0, search_term: 'voice agent', search_status: 'complete' })
  const click = createAnalyticsEvent('catalog_action', { action: 'result_open', search_term: '语音 Agent', content_slug: 'voice-agent', result_count: 3, result_position: 2, search_status: 'metadata_only' })
  assert.equal(click.properties.search_term, '语音 agent')
  assert.equal(click.properties.result_position, 2)
  assert.equal(click.properties.search_status, 'metadata_only')
  assert.equal(createAnalyticsEvent('content_copy', { action: 'guide', search_term: 'unrelated' }).properties.search_term, undefined)
})

test('obvious sensitive and unbounded search inputs are redacted without losing search counts', () => {
  for (const search_term of ['person@example.com', 'https://private.example?key=value', 'token=secret', 'Bearer abcdefgh', 'sk-12345678abcdef', 'github_pat_abcdef123456789', '+86 138 1234 5678', 'x'.repeat(101), 'voice\u200bsecret']) {
    const result = createAnalyticsEvent('catalog_action', { action: 'search', search_term, result_count: 0 })
    assert.deepEqual(result.properties, { action: 'search', result_count: 0, search_term_redacted: true }, search_term)
  }
  assert.deepEqual(createAnalyticsEvent('catalog_action', { action: 'search', search_term: '   ' }).properties, { action: 'search' })
})

test('only standard bounded campaign dimensions survive; campaign IDs can be numeric', () => {
  assert.deepEqual(campaignProperties({ utm_source: '  discord  ', utm_campaign: 'Voice Demo 20261105', utm_id: '123456789', utm_medium: 'community', utm_content: 'person@example.com', utm_term: 'api_key=secret', gclid: 'uncontrolled', account: 'private' }), { utm_source: '  discord  ', utm_medium: 'community', utm_campaign: 'Voice Demo 20261105', utm_id: '123456789' })
})

test('Vercel summaries fit Pro property limits and retain useful search/content/Topic dimensions', () => {
  assert.deepEqual(vercelProperties({ action: 'search', search_term: 'voice agent', result_count: 0, topic_slug: 'topic-a', search_id: 'uuid', utm_source: 'discord' }), { action: 'search', search_term: 'voice agent' })
  assert.deepEqual(vercelProperties({ action: 'search', search_term_redacted: true, result_count: 0 }), { action: 'search', search_term_redacted: true })
  assert.deepEqual(vercelProperties({ action: 'result_open', content_slug: 'example', search_term: 'voice', result_position: 1 }), { action: 'result_open', content_slug: 'example' })
  assert.deepEqual(vercelProperties({ action: 'participate', topic_slug: 'topic-a', placement: 'topic_page' }), { action: 'participate', topic_slug: 'topic-a' })
  for (const actions of Object.values(eventActions)) for (const action of actions) {
    assert.ok(Object.keys(vercelProperties({ action, placement: 'catalog', content_slug: 'example', utm_source: 'discord' })).length <= 2)
  }
})
