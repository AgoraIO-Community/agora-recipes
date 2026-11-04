import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import ts from 'typescript'

const analyticsModule = new URL('../lib/analytics-events.ts', import.meta.url).href
const compile = source => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText
const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
const eventsModule = moduleUrl(compile(readFileSync(new URL('../lib/posthog-events.ts', import.meta.url), 'utf8').replace('"./analytics-events"', JSON.stringify(analyticsModule))))
const clientSource = readFileSync(new URL('../lib/posthog-client.ts', import.meta.url), 'utf8')
  .replace('"./posthog-events"', JSON.stringify(eventsModule))
  .replace('"./analytics-events"', JSON.stringify(analyticsModule))
const clientModule = compile(clientSource).replace('import("posthog-js/dist/module.slim")', 'loadSDK()')

async function fixture(href, token = 'phc_target_project_fixture', host = 'https://us.i.posthog.com') {
  const setup = `
    const window = ${href ? JSON.stringify({ location: { href } }) : 'undefined'};
    const process = { env: ${JSON.stringify({ NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: token, NEXT_PUBLIC_POSTHOG_HOST: host })} };
    export const state = { imports: 0, inits: 0, events: [], token: null, options: null };
    async function loadSDK() {
      state.imports++;
      return { default: {
        init(token, options) { state.inits++; state.token = token; state.options = options; },
        capture(event, properties) {
          const sanitized = state.options.before_send({ event, properties });
          if (sanitized) state.events.push(sanitized);
        },
      } };
    }
  `
  return import(moduleUrl(setup + clientModule))
}

test('untrusted origins and server calls do not load or initialize the PostHog SDK', async () => {
  for (const href of [undefined, 'http://localhost:3100/', 'http://127.0.0.1:4183/', 'https://preview.vercel.app/', 'https://recipes.agora.io.evil.example/']) {
    const client = await fixture(href)
    client.capturePosthog('$pageview', {}, 'https://recipes.agora.io')
    await new Promise(resolve => setImmediate(resolve))
    assert.equal(client.state.imports, 0, String(href))
    assert.equal(client.state.inits, 0, String(href))
    assert.deepEqual(client.state.events, [])
  }
})

test('missing project configuration cannot fall back to another PostHog project', async () => {
  for (const [token, host] of [[undefined, 'https://us.i.posthog.com'], ['phc_target_project_fixture', '']]) {
    const client = await fixture('https://recipes.agora.io/', token ?? '', host)
    client.capturePosthog('$pageview', {}, 'https://recipes.agora.io')
    await new Promise(resolve => setImmediate(resolve))
    assert.equal(client.state.imports, 0)
  }
})

test('production queues first events into one configured project with forced app properties', async () => {
  const client = await fixture('https://recipes.agora.io/recipes/example')
  client.capturePosthog('$pageview', { app: 'console', environment: 'preview', $current_url: 'https://recipes.agora.io/recipes/example?q=private' }, 'https://recipes.agora.io')
  client.capturePosthog('content_copy', { app: 'cli', action: 'prompt' }, 'https://recipes.agora.io')
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(client.state.imports, 1)
  assert.equal(client.state.inits, 1)
  assert.equal(client.state.token, 'phc_target_project_fixture')
  assert.equal(client.state.options.api_host, 'https://us.i.posthog.com')
  assert.deepEqual(client.state.events.map(event => event.event), ['$pageview', 'content_copy'])
  for (const event of client.state.events) {
    assert.equal(event.properties.app, 'recipes')
    assert.equal(event.properties.environment, 'production')
  }
  assert.equal(client.state.events[0].properties.$current_url, 'https://recipes.agora.io/recipes/example')
  for (const option of ['autocapture', 'capture_pageview', 'capture_pageleave', 'capture_dead_clicks', 'capture_heatmaps', 'capture_performance', 'capture_exceptions']) assert.equal(client.state.options[option], false)
  assert.equal(client.state.options.disable_session_recording, true)
  assert.equal(client.state.options.advanced_disable_flags, true)
})
