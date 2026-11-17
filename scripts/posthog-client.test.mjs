import { attributionUrl } from './analytics-test-modules.mjs'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import ts from 'typescript'

const analyticsModule = new URL('../lib/analytics-events.ts', import.meta.url).href
const compile = source => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText
const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
const contextModule = moduleUrl(compile(readFileSync(new URL('../lib/analytics-context.ts', import.meta.url), 'utf8')))
const eventsModule = moduleUrl(compile(readFileSync(new URL('../lib/posthog-events.ts', import.meta.url), 'utf8').replace('"./analytics-events"', JSON.stringify(analyticsModule)).replace('"./analytics-context"', JSON.stringify(contextModule)).replace('"./analytics-attribution"', JSON.stringify(attributionUrl))))
const clientSource = readFileSync(new URL('../lib/posthog-client.ts', import.meta.url), 'utf8')
  .replace('"./posthog-events"', JSON.stringify(eventsModule))
  .replace('"./analytics-events"', JSON.stringify(analyticsModule))
  .replace('"./analytics-transport"', JSON.stringify(new URL('../lib/analytics-transport.ts', import.meta.url).href))
  .replace('import { analyticsConsent } from "./analytics-consent"', '')
const clientModule = compile(clientSource).replace('import("posthog-js/dist/module.slim")', 'loadSDK()')

async function fixture(href, token = 'phc_target_project_fixture', host, consent = true) {
  const setup = `
    const window = ${href ? JSON.stringify({ location: { href } }) : 'undefined'};
    const process = { env: ${JSON.stringify({ NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN: token, NEXT_PUBLIC_POSTHOG_HOST: host })} };
    export const state = { imports: 0, inits: 0, events: [], token: null, options: null, consent: ${JSON.stringify(consent)}, optIns: 0, optOuts: 0, optedIn: false, unregistered: [], sessionUnregistered: [] };
    const analyticsConsent = { isGranted: () => state.consent };
    state.localStore = new Map(); state.sessionStore = new Map(); state.cookies = new Map();
    const storage = values => ({
      get length() { return values.size; }, key: index => [...values.keys()][index],
      getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key),
    });
    if (window) {
      window.localStorage = storage(state.localStore); window.sessionStorage = storage(state.sessionStore);
      window.document = {
        get cookie() { return [...state.cookies].map(([key, value]) => key + '=' + value).join('; '); },
        set cookie(value) { if (value.includes('Max-Age=0')) state.cookies.delete(value.split('=')[0]); },
      };
    }
    async function loadSDK() {
      state.imports++;
      return { default: {
        init(token, options) { state.inits++; state.token = token; state.options = options; },
        unregister(key) { state.unregistered.push(key); },
        unregister_for_session(key) { state.sessionUnregistered.push(key); },
        set_config(config) { Object.assign(state.options, config); },
        has_opted_in_capturing() { return state.optedIn; },
        opt_in_capturing() { state.optedIn = true; state.optIns++; },
        opt_out_capturing() { state.optedIn = false; state.optOuts++; },
        capture(event, properties) {
          const sanitized = state.options.before_send({ event, properties: { utm_source: 'legacy', utm_content: 'old', ...properties } });
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

test('a missing project token never initializes PostHog, even with a custom host', async () => {
  for (const host of [undefined, 'https://us.i.posthog.com', 'https://metrics.example.com/relay']) {
    const client = await fixture('https://recipes.agora.io/', '', host)
    client.capturePosthog('$pageview', {}, 'https://recipes.agora.io')
    await new Promise(resolve => setImmediate(resolve))
    assert.equal(client.state.imports, 0)
  }
})

test('an omitted or blank ingestion host uses the existing US Cloud destination', async () => {
  for (const host of [undefined, '', '   ']) {
    const client = await fixture('https://recipes.agora.io/optional-host', 'phc_target_project_fixture', host)
    client.capturePosthog('$pageview', {}, 'https://recipes.agora.io')
    await new Promise(resolve => setImmediate(resolve))
    assert.equal(client.state.inits, 1)
    assert.equal(client.state.options.api_host, 'https://us.i.posthog.com')
    assert.equal(client.state.options.ui_host, 'https://us.posthog.com')
    assert.equal(client.state.events.length, 1)
  }
})

test('custom proxy domains and same-origin prefixes receive the existing event contract', async () => {
  for (const host of ['https://metrics.example.com', 'https://metrics.example.com/relay', '/relay']) {
    const client = await fixture('https://recipes.agora.io/custom-host', 'phc_target_project_fixture', host)
    client.capturePosthog('content_copy', { action: 'guide', app: 'other' }, 'https://recipes.agora.io')
    await new Promise(resolve => setImmediate(resolve))
    assert.equal(client.state.inits, 1)
    assert.equal(client.state.options.api_host, host)
    assert.equal(client.state.options.ui_host, 'https://us.posthog.com')
    assert.equal(client.state.events[0].properties.app, 'recipes')
    assert.equal(client.state.options.disable_session_recording, true)
    assert.equal(client.state.options.autocapture, false)
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
  assert.equal(client.state.events[0].properties.utm_source, undefined, 'old SDK campaign properties cannot relabel untagged events')
  assert.equal(client.state.events[0].properties.utm_content, undefined)
  for (const option of ['autocapture', 'capture_pageview', 'capture_pageleave', 'capture_dead_clicks', 'capture_heatmaps', 'capture_performance', 'capture_exceptions']) assert.equal(client.state.options[option], false)
  assert.equal(client.state.options.disable_session_recording, true)
  assert.equal(client.state.options.advanced_disable_flags, true)
  assert.equal(client.state.options.save_campaign_params, false)
  assert.equal(client.state.options.opt_out_capturing_by_default, true)
  assert.equal(client.state.options.opt_out_persistence_by_default, true)
  assert.equal(client.state.options.cross_subdomain_cookie, false)
  assert.equal(client.state.options.persistence_name, 'recipes')
  assert.equal(client.state.options.request_batching, false)
})

test('pending or denied analytics consent never imports the SDK', async () => {
  const client = await fixture('https://recipes.agora.io/no-consent', 'phc_fixture', '/relay', false)
  client.capturePosthog('$pageview', {}, 'https://recipes.agora.io')
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(client.state.imports, 0)
  assert.equal(client.state.inits, 0)
})

test('a fresh document with withdrawn consent clears only Recipes persistence without importing the SDK', async () => {
  const client = await fixture('https://recipes.agora.io/cold-withdrawal', 'phc_fixture', '/relay', false)
  for (const store of [client.state.localStore, client.state.sessionStore, client.state.cookies]) {
    for (const key of ['ph_recipes', 'ph_recipes__flags', 'ph_recipes_window_id', 'ph_recipes_primary_window_exists', 'recipes:posthog-consent', 'ph_shared_console_posthog', 'recipes:analytics-consent:v1']) store.set(key, 'previous')
  }
  client.syncPosthogConsent()
  await new Promise(resolve => setImmediate(resolve))
  for (const store of [client.state.localStore, client.state.sessionStore, client.state.cookies]) assert.deepEqual([...store.keys()], ['ph_shared_console_posthog', 'recipes:analytics-consent:v1'])
  assert.equal(client.state.imports, 0)
})

test('withdrawing during the lazy import prevents initialization, persistence and the queued event', async () => {
  const client = await fixture('https://recipes.agora.io/revoke-during-import', 'phc_fixture', '/relay')
  client.capturePosthog('$pageview', {}, 'https://recipes.agora.io')
  client.state.consent = false
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(client.state.inits, 0)
  assert.deepEqual(client.state.events, [])
  client.state.consent = true
  client.capturePosthog('$pageview', {}, 'https://recipes.agora.io')
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(client.state.inits, 1)
  assert.equal(client.state.events.length, 1)
})

test('reaccepting during an import never replays captures from the earlier grant', async () => {
  const client = await fixture('https://recipes.agora.io/consent-epoch', 'phc_fixture', '/relay')
  client.capturePosthog('catalog_action', { action: 'search', search_term: 'old term', utm_source: 'old' }, 'https://recipes.agora.io')
  client.state.consent = false
  client.syncPosthogConsent()
  client.state.consent = true
  client.capturePosthog('content_copy', { action: 'guide', utm_source: 'new' }, 'https://recipes.agora.io')
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(client.state.inits, 1)
  assert.deepEqual(client.state.events.map(event => event.event), ['content_copy'])
  assert.equal(client.state.events[0].properties.utm_source, 'new')
})

test('withdrawal opts out the existing Recipes instance and gates SDK-boundary events; regrant resumes deliberate actions', async () => {
  const client = await fixture('https://recipes.agora.io/revoke-loaded', 'phc_fixture', '/relay')
  client.capturePosthog('$pageview', {}, 'https://recipes.agora.io')
  await new Promise(resolve => setImmediate(resolve))
  client.state.consent = false
  const oldTransport = client.state.options.fetch_options
  client.syncPosthogConsent()
  client.capturePosthog('content_copy', { action: 'guide' }, 'https://recipes.agora.io')
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(client.state.optOuts, 1)
  assert.equal(client.state.optedIn, false)
  assert.equal(client.state.events.length, 1)
  assert.equal(client.state.options.before_send({ event: '$pageview', properties: {} }), null)
  assert.equal(oldTransport.signal.aborted, true)
  client.state.consent = true
  client.capturePosthog('content_copy', { action: 'guide' }, 'https://recipes.agora.io')
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(client.state.inits, 1)
  assert.equal(client.state.optIns, 2)
  assert.notEqual(client.state.options.fetch_options, oldTransport)
  assert.equal(oldTransport.signal.aborted, true)
  assert.equal(client.state.options.fetch_options.signal.aborted, false)
  assert.deepEqual(client.state.events.map(event => event.event), ['$pageview', 'content_copy'])
})

test('initialization clears both SDK campaign stores and every capture explicitly excludes absent fields', async () => {
  const client = await fixture('https://recipes.agora.io/?utm_source=x')
  client.capturePosthog('material_open', {action:'demo',utm_source:'x',landing_path:'/'}, 'https://recipes.agora.io')
  await new Promise(resolve=>setImmediate(resolve))
  const keys=['utm_source','utm_medium','utm_campaign','utm_id','utm_content','utm_term']
  assert.deepEqual(client.state.unregistered,keys)
  assert.deepEqual(client.state.sessionUnregistered,keys)
  const properties=client.state.events[0].properties
  assert.equal(properties.utm_source,'x')
  for (const key of keys.filter(key=>key!=='utm_source')) assert.equal(properties[key],undefined,key)
})
