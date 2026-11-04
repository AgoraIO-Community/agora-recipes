import assert from 'node:assert/strict'
import test from 'node:test'
import { analyticsEnabled, analyticsOriginAllowed, analyticsUrl, createAnalyticsEvent, eventActions } from '../lib/analytics-events.ts'

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
