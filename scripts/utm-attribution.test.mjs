import assert from 'node:assert/strict'
import test from 'node:test'
import { readUtm, sanitizeAttribution, vercelAnalyticsUrl, attributedDestination, createAttributionController } from '../lib/utm-attribution.ts'

const origin = 'https://recipes.agora.io'
const email = '?utm_source=agora_email&utm_medium=email&utm_campaign=recipes_top10&utm_content=main_cta_v1'
const expected = { utm_source: 'agora_email', utm_medium: 'email', utm_campaign: 'recipes_top10', utm_content: 'main_cta_v1', landing_path: '/' }
let token = 0
function fixture(initial = {}) {
  const state = { value: null, name: '', ...initial }
  function open(path = '/', type = 'navigate', referrer = '') {
    return createAttributionController({
      url: origin + path, navigationType: type, referrer,
      read() { if (state.blocked) throw Error('blocked'); return state.value },
      write(value) { if (state.blocked) throw Error('blocked'); state.value = value },
      getTabName: () => state.name, setTabName: name => { state.name = name }, newToken: () => String(++token),
    })
  }
  return { state, open }
}

test('bounded values preserve real campaign names and multilingual keywords without inventing a source', () => {
  assert.deepEqual(readUtm(new URLSearchParams('utm_source=google&utm_term=voice+AI+中文')), { utm_source: 'google', utm_term: 'voice AI 中文' })
  for (const source of ['X', 'bad-source', 'name@example.com', 'a'.repeat(101), 'x\n']) assert.equal(readUtm(new URLSearchParams({ utm_source: source })), undefined)
  assert.equal(readUtm(new URLSearchParams('utm_campaign=recipes_top10')), undefined)
  assert.equal(readUtm(new URLSearchParams('utm_source=x&utm_source=google')), undefined)
  for (const term of ['{keyword}', '%7Bkeyword%7D', 'bad\nword', 'a'.repeat(101), '  ']) {
    const params = new URLSearchParams('utm_source=google&utm_term=' + term)
    assert.deepEqual(readUtm(params), { utm_source: 'google' })
  }
  assert.deepEqual(readUtm(new URLSearchParams('utm_source=x&utm_medium=Bad&utm_content=valid_v1')), { utm_source: 'x', utm_content: 'valid_v1' })
  for (const landing_path of ['//evil.example', '/page?private=1', '/page#secret', '/path\\evil', 'https://example.com']) assert.equal(sanitizeAttribution({ ...expected, landing_path }), undefined)
})

test('first entry is available before the first view and consumed only once; ordinary navigation retains landing path', () => {
  const tab = fixture()
  const first = tab.open('/' + email)
  assert.deepEqual(first.get(), expected)
  assert.deepEqual(first.takeEntry(), expected)
  assert.equal(first.takeEntry(), undefined)
  first.release()
  const detail = tab.open('/recipes/example', 'navigate', origin + '/')
  assert.deepEqual(detail.get(), expected)
  assert.equal(detail.takeEntry(), undefined)
  detail.release()
  const direct = tab.open('/topics')
  assert.deepEqual(direct.get(), expected)
  assert.equal(direct.takeEntry(), undefined)
})

test('reload, history and unchanged documents retain source without new entries, independent of elapsed time', () => {
  const tab = fixture()
  let page = tab.open('/' + email)
  page.takeEntry()
  for (const type of ['reload', 'back_forward', 'reload']) {
    page.release()
    page = tab.open('/' + email, type)
    assert.deepEqual(page.get(), expected)
    assert.equal(page.takeEntry(), undefined)
  }
  page.resume()
  assert.deepEqual(page.get(), expected)
})

test('every identifiable external promotion counts even with identical UTM, then whole-source replacement removes old fields', () => {
  const tab = fixture()
  let page = tab.open('/' + email)
  page.takeEntry()
  page.release()
  page = tab.open('/' + email, 'navigate', 'https://mail.example/')
  assert.deepEqual(page.takeEntry(), expected)
  page.release()
  const x = tab.open('/recipes/example?utm_source=x')
  assert.deepEqual(x.takeEntry(), { utm_source: 'x', landing_path: '/recipes/example' })
  assert.deepEqual(page.get(), expected, 'prior event snapshots are not mutated')
  assert.deepEqual(x.get(), { utm_source: 'x', landing_path: '/recipes/example' })
})

test('internal full-document navigation with carried UTM does not create a new entry', () => {
  const tab = fixture()
  const page = tab.open('/' + email)
  page.takeEntry(); page.release()
  const next = tab.open('/recipes/example' + email, 'navigate', origin + '/')
  assert.equal(next.takeEntry(), undefined)
  assert.deepEqual(next.get(), expected)
})

test('new independent, opener-cloned and duplicated tabs cannot inherit unproven source; explicit UTM can establish it', () => {
  const mail = fixture()
  mail.open('/' + email)
  assert.equal(fixture().open().get(), undefined)
  assert.equal(fixture({ value: mail.state.value }).open().get(), undefined, 'opener copies storage')
  assert.equal(fixture({ ...mail.state }).open().get(), undefined, 'duplicate copies storage and window name')
  assert.equal(fixture({ ...mail.state }).open('/', 'reload').get(), undefined, 'duplicated history may look like reload')
  const x = fixture({ ...mail.state }).open('/?utm_source=x')
  assert.deepEqual(x.takeEntry(), { utm_source: 'x', landing_path: '/' })
  assert.deepEqual(mail.open('/?utm_source=google').get(), { utm_source: 'google', landing_path: '/' })
  assert.deepEqual(x.get(), { utm_source: 'x', landing_path: '/' }, 'simultaneous tab sources stay independent')
})

test('BFCache resumes the latest tab attribution after a later promotion, without replaying its entry', () => {
  const tab = fixture()
  const old = tab.open('/' + email)
  old.takeEntry(); old.release()
  const current = tab.open('/?utm_source=x')
  current.takeEntry(); current.release()
  old.resume()
  assert.deepEqual(old.get(), { utm_source: 'x', landing_path: '/' })
  assert.equal(old.takeEntry(), undefined)
})

test('blocked/corrupt/cleared storage never blocks browsing or fabricates a recovered source', () => {
  const tab = fixture({ blocked: true })
  const page = tab.open('/' + email)
  assert.deepEqual(page.get(), expected)
  assert.deepEqual(page.takeEntry(), expected)
  assert.equal(tab.open().get(), undefined)
  assert.equal(tab.open('/' + email, 'reload').takeEntry(), undefined)
  assert.equal(fixture({ value: '{bad' }).open().get(), undefined)
  const saved = fixture()
  saved.open('/' + email).release()
  saved.state.value = null
  assert.equal(saved.open().get(), undefined)
})

test('Vercel URLs keep only valid explicit UTM and discard credentials, unrelated queries and fragments', () => {
  const url = new URL(vercelAnalyticsUrl(origin + '/recipes/example' + email + '&q=secret&returnTo=private#secret'))
  assert.equal(url.pathname, '/recipes/example')
  assert.equal(url.searchParams.get('utm_source'), 'agora_email')
  assert.equal(url.searchParams.get('q'), null)
  assert.equal(url.hash, '')
  assert.equal(vercelAnalyticsUrl(origin + '/?utm_medium=email&q=secret'), origin + '/')
  assert.equal(vercelAnalyticsUrl('javascript:alert(1)'), undefined)
})

test('designated HTTPS destinations replace all target UTM, preserve functional queries, and never receive landing_path', () => {
  const target = 'https://demo.example/start?token=public&room=42&utm_source=recipes&utm_medium=referral#start'
  const result = new URL(attributedDestination(target, { utm_source: 'google', utm_term: 'voice AI 中文', landing_path: '/' }))
  assert.equal(result.searchParams.get('utm_source'), 'google')
  assert.equal(result.searchParams.get('utm_medium'), null)
  assert.equal(result.searchParams.get('utm_term'), 'voice AI 中文')
  assert.equal(result.searchParams.get('room'), '42')
  assert.equal(result.searchParams.get('landing_path'), null)
  assert.equal(result.hash, '#start')
  assert.equal(attributedDestination(target), target)
  for (const url of ['http://demo.example/', '/recipes/example', 'javascript:alert(1)', 'https://user:secret@demo.example']) assert.equal(attributedDestination(url, expected), url)
})
