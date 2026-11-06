import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { runInNewContext } from 'node:vm'
import ts from 'typescript'
import * as analyticsEvents from '../lib/analytics-events.ts'

const origin = 'https://recipes.agora.io'
const id = 'G-TEST123'
const compile = file => ts.transpileModule(readFileSync(new URL(file, import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText
const consentSource = compile('../lib/analytics-consent.ts')
const clientSource = compile('../lib/ga4-client.ts')

function fixture(measurementId, values = new Map()) {
  const tags = []
  const cookies = []
  const cookieJar = new Map([['recipes_ga4_ga', 'traffic'], ['recipes_ga4_ga_TEST123', 'session'], ['_ga', 'other'], ['ph_console', 'console']])
  const window = {
    location: { href: `${origin}/?utm_source=community&utm_term=person%40example.com&q=private&token=secret#section` },
    localStorage: { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) },
  }
  const document = {
    referrer: 'https://example.org/private?account=hidden',
    createElement: () => ({ remove() { tags.splice(tags.indexOf(this), 1) } }),
    head: { append: tag => tags.push(tag) },
    get cookie() { return [...cookieJar].map(([key, value]) => `${key}=${value}`).join('; ') },
    set cookie(value) { cookies.push(value); cookieJar.delete(value.split('=')[0]) },
  }
  function load(source, modules = {}) {
    const exports = {}
    runInNewContext(source, { exports, window, document, URL, process: { env: { NEXT_PUBLIC_GA4_MEASUREMENT_ID: measurementId } }, require: name => modules[name] })
    return exports
  }
  const consent = load(consentSource)
  const client = load(clientSource, { './analytics-consent': consent, './analytics-events': analyticsEvents })
  return {
    tags, cookies, window, consent, client,
    chooseProduct: consent.analyticsConsent.useLocal(),
    chooseTraffic: consent.ga4Consent?.useLocal(),
    capture: () => client.captureGa4PageView(origin),
    commands: () => JSON.parse(JSON.stringify((window.recipesGa4DataLayer ?? []).map(args => Array.from(args)))),
  }
}

test('missing and invalid GA4 IDs create no traffic choice or script', () => {
  for (const candidate of [undefined, '   ', 'AW-TEST', 'G-TEST&l=other']) {
    const app = fixture(candidate)
    app.chooseProduct(true)
    assert.equal(app.consent.ga4Consent, undefined)
    assert.equal(app.capture(), false)
    assert.equal(app.tags.length, 0)
  }
})

test('traffic consent is independent of existing product consent and scoped to the measurement ID', () => {
  const values = new Map()
  const original = fixture(undefined, values)
  original.chooseProduct(true)
  const app = fixture(id, values)
  assert.equal(app.consent.analyticsConsent.isGranted(), true)
  assert.equal(app.consent.ga4Consent.getSnapshot(), 'pending')
  assert.equal(app.capture(), false)
  app.chooseProduct(false)
  app.chooseTraffic(true)
  assert.equal(app.consent.analyticsConsent.isGranted(), false)
  assert.equal(fixture(id, values).consent.ga4Consent.isGranted(), true)
  assert.equal(fixture('G-OTHERID', values).consent.ga4Consent.isGranted(), false)
})

test('a traffic grant loads one tag on the production origin and sends bounded page views', () => {
  const app = fixture(` ${id} `)
  app.chooseTraffic(true)
  const landing = app.window.location.href
  app.window.location.href = 'https://preview.example.org/'
  assert.equal(app.capture(), false)
  assert.equal(app.tags.length, 0)
  app.window.location.href = landing
  assert.equal(app.capture(), true)
  assert.equal(app.tags.length, 1)
  assert.equal(new URL(app.tags[0].src).searchParams.get('id'), id)
  assert.deepEqual(app.commands()[0], ['consent', 'default', {
    analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
  }])
  assert.equal(app.commands().length, 1, 'no events are queued before the tag loads')
  app.tags[0].onload()
  app.window.location.href = `${origin}/recipes/example?q=hidden`
  app.capture()
  const commands = app.commands()
  const config = commands.find(([command]) => command === 'config')[2]
  assert.equal(config.send_page_view, false)
  assert.equal(config.allow_google_signals, false)
  assert.equal(config.allow_ad_personalization_signals, false)
  assert.deepEqual(commands.filter(([command]) => command === 'event'), [
    ['event', 'page_view', { page_location: `${origin}/?utm_source=community`, page_referrer: 'https://example.org', send_to: id }],
    ['event', 'page_view', { page_location: `${origin}/recipes/example`, page_referrer: `${origin}/`, send_to: id }],
  ])
  assert.equal(app.tags.length, 1)
})

test('withdrawal during tag loading discards the pending view and regrant records only the current page', () => {
  const app = fixture(id)
  app.consent.ga4Consent.subscribe(app.client.syncGa4Consent)
  app.chooseTraffic(true)
  app.capture()
  app.chooseTraffic(false)
  app.tags[0].onload()
  assert.equal(app.window[`ga-disable-${id}`], true)
  assert.equal(app.commands().length, 1)
  assert.equal(app.capture(), false)
  app.window.location.href = `${origin}/topics/example`
  app.chooseTraffic(true)
  app.capture()
  const events = app.commands().filter(([command]) => command === 'event')
  assert.equal(events.length, 1)
  assert.equal(events[0][2].page_location, `${origin}/topics/example`)
  assert.equal(app.tags.length, 1)
  app.chooseTraffic(false)
  assert.equal(app.window[`ga-disable-${id}`], true)
  assert.deepEqual(app.commands().at(-1), ['consent', 'update', { analytics_storage: 'denied' }])
  assert.deepEqual(app.cookies.map(cookie => cookie.split('=')[0]), ['recipes_ga4_ga', 'recipes_ga4_ga_TEST123'])
})
