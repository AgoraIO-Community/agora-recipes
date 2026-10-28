import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import ts from 'typescript'

const source = readFileSync(new URL('../lib/posthog-events.ts', import.meta.url), 'utf8')
  .replace('"./analytics-events"', JSON.stringify(new URL('../lib/analytics-events.ts', import.meta.url).href))
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText
const { pageContext, posthogProperties, sanitizePosthogEvent } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)
const topics = ['topic-a', 'topic-b']
const fromA = `returnTo=${encodeURIComponent('/zh-Hans/topics/topic-a?q=private#recipes')}`

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
    const result = posthogProperties(context, name, { action })
    assert.equal(result.is_recipe_use, true)
    assert.equal(result.is_topic_engagement, true)
  }
  assert.equal(posthogProperties(pageContext('/', '', topics), 'material_open', { content_slug: 'example', action: 'demo' }).is_recipe_use, true, 'card actions count without a detail visit')
  for (const name of ['$pageview', 'share_action', 'catalog_action', 'contribution_open']) assert.equal(posthogProperties(context, name, { action: 'copy_link' }).is_recipe_use, false)
  const prep = posthogProperties(pageContext('/contribute', `?topic=topic-b&${fromA}`, topics), 'content_copy', { action: 'prompt' })
  assert.equal(prep.is_recipe_use, false)
  assert.equal(prep.is_topic_engagement, true)
  assert.equal(prep.topic_slug, 'topic-b')
  assert.equal(posthogProperties(pageContext('/topics/topic-a', '', topics), 'topic_action_open', { action: 'participate' }).is_topic_engagement, true)
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
