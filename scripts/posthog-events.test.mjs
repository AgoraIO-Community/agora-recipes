import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import ts from 'typescript'

const source = readFileSync(new URL('../lib/posthog-events.ts', import.meta.url), 'utf8')
  .replace('"./analytics-events"', JSON.stringify(new URL('../lib/analytics-events.ts', import.meta.url).href))
const contextSource = readFileSync(new URL('../lib/analytics-context.ts', import.meta.url), 'utf8')
const contextCompiled = ts.transpileModule(contextSource, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText
const contextModule = `data:text/javascript;base64,${Buffer.from(contextCompiled).toString('base64')}`
const { pageContext, analyticsProperties } = await import(contextModule)
const compiled = ts.transpileModule(source.replace('"./analytics-context"', JSON.stringify(contextModule)), { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText
const { sanitizePosthogEvent } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)
const topics = ['topic-a', 'topic-b']
const fromA = `returnTo=${encodeURIComponent('/zh-Hans/topics/topic-a?q=private#recipes')}`

test('every PostHog event enforces the Recipes app and production dimensions at both boundaries', () => {
  const context = pageContext('/recipes/example', '', topics)
  for (const event of ['$pageview', 'catalog_action', 'material_open', 'video_play', 'content_copy', 'share_action', 'topic_action_open', 'contribution_open']) {
    const properties = analyticsProperties(context, event, { app: 'console', site: 'another-app', environment: 'preview' })
    assert.equal(properties.app, 'recipes')
    assert.equal(properties.environment, 'production')
    assert.equal(properties.site, 'agora-recipes')
    const sanitized = sanitizePosthogEvent({ event, properties: { ...properties, app: 'cli', site: 'another-app', environment: 'development' } })
    assert.equal(sanitized.properties.app, 'recipes')
    assert.equal(sanitized.properties.site, 'agora-recipes')
    assert.equal(sanitized.properties.environment, 'production')
  }
})

test('Hindi, Spanish and Brazilian Portuguese retain locale and independent Topic context', () => {
  for (const locale of ['hi', 'es', 'pt-BR']) {
    const source = `returnTo=${encodeURIComponent(`/${locale}/topics/topic-a?loaded=24#recipes`)}`
    assert.deepEqual(pageContext(`/${locale}/contribute`, `?topic=topic-b&${source}`, topics), { locale, page_type: 'contribute', topic_slug: 'topic-b', source_topic_slug: 'topic-a' })
    assert.equal(pageContext(`/${locale}/recipes/example`, '', topics).content_slug, 'example')
  }
})

test('selected association and source Topic remain independent, including clear and direct visits', () => {
  assert.deepEqual(pageContext('/zh-Hans/contribute', `?topic=topic-b&${fromA}`, topics), { locale: 'zh-Hans', page_type: 'contribute', topic_slug: 'topic-b', source_topic_slug: 'topic-a' })
  assert.deepEqual(pageContext('/contribute', `?${fromA}`, topics), { locale: 'en', page_type: 'contribute', source_topic_slug: 'topic-a' })
  assert.equal(pageContext('/contribute', '?topic=topic-b', topics).source_topic_slug, undefined)
  assert.equal(pageContext('/ja/topics/topic-b', '', topics).source_topic_slug, 'topic-b')
  assert.deepEqual(pageContext('/zh-Hant/recipes/example/guide/ja', `?${fromA}`, topics), { locale: 'zh-Hant', page_type: 'recipe', content_slug: 'example', topic_slug: 'topic-a', source_topic_slug: 'topic-a' })
})

test('quick filters, unknown Topics and external return destinations do not create attribution', () => {
  for (const search of ['?topic=topic-a', '?topic=constructor', '?returnTo=//evil.com/topics/topic-a', '?returnTo=https://evil.com/topics/topic-a', '?returnTo=/topics/unknown']) {
    assert.deepEqual(pageContext('/', search, topics), { locale: 'en', page_type: 'catalog' })
  }
  assert.equal(pageContext('/recipes/example', '?returnTo=/topics/unknown', topics).topic_slug, undefined)
})

test('use requires a content identity and a real material/play or successful copy action', () => {
  const context = pageContext('/recipes/example', `?${fromA}`, topics)
  for (const [name, action] of [['material_open', 'demo'], ['material_open', 'source'], ['video_play', 'play'], ['content_copy', 'guide'], ['content_copy', 'prompt']]) {
    const result = analyticsProperties(context, name, { action })
    assert.equal(result.is_recipe_use, true)
    assert.equal(result.is_topic_engagement, true)
  }
  assert.equal(analyticsProperties(pageContext('/', '', topics), 'material_open', { content_slug: 'example', action: 'demo' }).is_recipe_use, true, 'card actions count without a detail visit')
  for (const name of ['$pageview', 'share_action', 'catalog_action', 'contribution_open']) assert.equal(analyticsProperties(context, name, { action: 'copy_link' }).is_recipe_use, false)
  const prep = analyticsProperties(pageContext('/contribute', `?topic=topic-b&${fromA}`, topics), 'content_copy', { action: 'prompt' })
  assert.equal(prep.is_recipe_use, false)
  assert.equal(prep.is_topic_engagement, true)
  assert.equal(prep.topic_slug, 'topic-b')
  assert.equal(analyticsProperties(pageContext('/topics/topic-a', '', topics), 'topic_action_open', { action: 'participate' }).is_topic_engagement, true)
})

test('SDK boundary preserves required anonymous transport fields and removes profiles, text, queries and unwanted events', () => {
  const result = sanitizePosthogEvent({ event: '$pageview', properties: { token: 'public-project-token', distinct_id: 'anonymous-id', $device_id: 'device', $session_id: 'session', $process_person_profile: false, $current_url: 'https://recipes.agora.io/contribute?q=private#secret', $set: { email: 'private' }, $referrer: 'https://private.example/?token=secret', clipboard: 'secret', $initial_current_url: 'private', locale: 'en', page_type: 'contribute' } })
  assert.equal(result.properties.distinct_id, 'anonymous-id')
  assert.equal(result.properties.token, 'public-project-token')
  assert.equal(result.properties.$session_id, 'session')
  assert.equal(result.properties.$process_person_profile, false)
  assert.equal(result.properties.$current_url, 'https://recipes.agora.io/contribute')
  assert.doesNotMatch(JSON.stringify(result), /private|secret|email|clipboard/)
  for (const event of ['$autocapture', '$snapshot', '$exception', 'submission_success']) assert.equal(sanitizePosthogEvent({ event, properties: {} }), null)
})

test('shared measurement payload joins campaign, content and search without treating result opens as recipe use', () => {
  const context = pageContext('/topics/topic-a', '', topics)
  const properties = analyticsProperties(context, 'catalog_action', { action: 'result_open', search_term: 'voice agent', search_id: '8da56da1-0089-4a52-8a35-837ed2635f04', result_count: 3, result_position: 1, content_slug: 'example' }, { utm_source: 'discord', utm_campaign: 'voice_week' })
  assert.equal(properties.measurement_version, 3)
  assert.equal(properties.measurement_tier, 'behavioral')
  assert.equal(properties.is_recipe_use, false)
  assert.equal(properties.source_topic_slug, 'topic-a')
  assert.equal(properties.utm_campaign, 'voice_week')
  assert.deepEqual(sanitizePosthogEvent({ event: 'catalog_action', properties }).properties, properties, 'PostHog retains the full vendor-independent measurement payload')
  const unsafe = sanitizePosthogEvent({ event: 'catalog_action', properties: { ...properties, search_term: 'person@example.com', utm_source: 'https://private.example?secret=value', gclid: 'uncontrolled' } }).properties
  assert.equal(unsafe.search_term, undefined)
  assert.equal(unsafe.search_term_redacted, true)
  assert.equal(unsafe.utm_source, undefined)
  assert.equal(unsafe.gclid, undefined)
})
