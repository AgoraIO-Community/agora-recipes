import assert from 'node:assert/strict'
import test from 'node:test'
import { attributionUrl } from './analytics-test-modules.mjs'
const { readUtm, sanitizeAttribution, attributedDestination, createAttributionController } = await import(attributionUrl)

const origin = 'https://recipes.agora.io'
const email = '?utm_source=agora_email&utm_medium=email&utm_campaign=recipes_top10&utm_content=main_cta_v1'
const expected = { utm_source: 'agora_email', utm_medium: 'email', utm_campaign: 'recipes_top10', utm_content: 'main_cta_v1', landing_path: '/' }
let token = 0
function fixture(initial = {}) {
  const state = { value: null, name: '', granted: true, ...initial }
  function open(path = '/', type = 'navigate', referrer = '') {
    return createAttributionController({
      url: origin + path, navigationType: type, referrer, isGranted: () => state.granted,
      remove() { state.value = null },
      read() { if (state.blocked) throw Error('blocked'); return state.value },
      write(value) { if (state.blocked) throw Error('blocked'); state.value = value },
      getTabName: () => state.name, setTabName: name => { state.name = name }, newToken: () => String(++token),
    })
  }
  return { state, open }
}

test('bounded values preserve real campaign names and multilingual keywords without inventing a source', () => {
  assert.deepEqual(readUtm(new URLSearchParams('utm_source=google&utm_term=voice+AI+\u4e2d\u6587')), { utm_source: 'google', utm_term: 'voice AI \u4e2d\u6587' })
  for (const source of ['X', 'partner-blog', 'newsletter.v2', 'www.bilibili.com', '微信', 'Ｘ', 'Partner  channel', '@AgoraIO']) {
    const campaign = { utm_source: source, utm_medium: 'Paid.Social', utm_campaign: 'Live@Agora 发布.2026', utm_content: 'Main-CTA.v2' }
    assert.deepEqual(readUtm(new URLSearchParams(campaign)), campaign)
    const tab = fixture()
    const page = tab.open('/?' + new URLSearchParams(campaign))
    assert.deepEqual(page.get(), { ...campaign, landing_path: '/' })
    const target = new URL(attributedDestination('https://demo.example/', page.get()))
    for (const key of Object.keys(campaign)) assert.equal(target.searchParams.get(key), campaign[key])
  }
  for (const source of ['name@example.com', 'a'.repeat(101), 'x\n']) assert.equal(readUtm(new URLSearchParams({ utm_source: source })), undefined)
  assert.equal(readUtm(new URLSearchParams('utm_campaign=recipes_top10')), undefined)
  assert.deepEqual(readUtm(new URLSearchParams('utm_source=x&utm_source=google')), { utm_source: 'x' })
  for (const term of ['{keyword}', '%7Bkeyword%7D', 'bad\nword', 'a'.repeat(101), '  ']) {
    const params = new URLSearchParams('utm_source=google&utm_term=' + term)
    assert.deepEqual(readUtm(params), { utm_source: 'google' })
  }
  assert.deepEqual(readUtm(new URLSearchParams('utm_source=x&utm_medium=Bad&utm_content=valid_v1')), { utm_source: 'x', utm_medium: 'Bad', utm_content: 'valid_v1' })
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

test('reload and history can read explicit URL attribution without storage or a new campaign entry', () => {
  for (const navigation of ['reload', 'back_forward']) {
    for (const blocked of [false, true]) {
      const tab = fixture({ blocked })
      const page = tab.open('/' + email, navigation)
      assert.deepEqual(page.get(), expected)
      assert.equal(page.takeEntry(), undefined)
      const target = new URL(attributedDestination('https://demo.example/', page.get()))
      assert.equal(target.searchParams.get('utm_source'), 'agora_email')
    }
  }
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

test('designated HTTPS destinations replace all target UTM, preserve functional queries, and never receive landing_path', () => {
  const target = 'https://demo.example/start?token=public&room=42&utm_source=recipes&utm_medium=referral#start'
  const result = new URL(attributedDestination(target, { utm_source: 'google', utm_term: 'voice AI \u4e2d\u6587', landing_path: '/' }))
  assert.equal(result.searchParams.get('utm_source'), 'google')
  assert.equal(result.searchParams.get('utm_medium'), null)
  assert.equal(result.searchParams.get('utm_term'), 'voice AI \u4e2d\u6587')
  assert.equal(result.searchParams.get('room'), '42')
  assert.equal(result.searchParams.get('landing_path'), null)
  assert.equal(result.hash, '#start')
  assert.equal(attributedDestination(target), target)
  for (const url of ['http://demo.example/', '/recipes/example', 'javascript:alert(1)', 'https://user:secret@demo.example']) assert.equal(attributedDestination(url, expected), url)
})

test('shared sensitive-text filtering protects both stored events and forwarded destinations', () => {
  for (const term of ['person@example.com', 'https://private.example/?token=abc', 'token=secret', 'api_key=secret', 'Bearer abcdef', 'github_pat_abcdef123456789', '{keyword}', 'voice\u0009agent']) {
    const tab = fixture()
    const page = tab.open('/?utm_source=x&utm_term=' + encodeURIComponent(term))
    assert.deepEqual(page.get(), { utm_source: 'x', landing_path: '/' }, term)
    const target = new URL(attributedDestination('https://demo.example/?utm_term=default', page.get()))
    assert.equal(target.searchParams.get('utm_term'), null, term)
    assert.doesNotMatch(tab.state.value, /person@|private\.example|token=secret|Bearer|api_key/)
  }
  assert.deepEqual(readUtm(new URLSearchParams('utm_source=x&utm_id=123456')), { utm_source: 'x', utm_id: '123456' })
})

test('pending and denied consent cannot create attribution or write a tab marker', () => {
  for (const granted of [false]) {
    const tab = fixture({ granted })
    const page = tab.open('/' + email)
    assert.equal(page.get(), undefined)
    assert.equal(page.takeEntry(), undefined)
    page.resume(); page.release()
    assert.equal(tab.state.value, null)
    assert.equal(tab.state.name, '')
  }
})

test('withdrawal invalidates old controllers and clears both storage and the owned marker', () => {
  const tab = fixture()
  const page = tab.open('/' + email)
  tab.state.granted = false
  page.clear()
  assert.equal(page.get(), undefined)
  assert.equal(tab.state.value, null)
  assert.equal(tab.state.name, '')
  tab.state.granted = true
  page.resume(); page.release()
  assert.equal(tab.state.value, null, 'granting again cannot reactivate a cleared controller')
  assert.equal(page.takeEntry(), undefined)
})

test('BFCache restoration adopts a newer owner after explicit marker reset instead of overwriting X with email', () => {
  const tab = fixture()
  const old = tab.open('/' + email)
  old.takeEntry(); old.release()
  tab.state.name = ''
  const current = tab.open('/?utm_source=x')
  current.takeEntry(); current.release()
  const before = tab.state.value
  old.release()
  assert.equal(tab.state.value, before, 'delayed pagehide cannot overwrite a newer owner')
  old.resume()
  assert.deepEqual(old.get(), { utm_source: 'x', landing_path: '/' })
  assert.equal(JSON.parse(tab.state.value).attribution.utm_source, 'x')
})

test('unproven or cleared ownership makes a restored page source empty without rewriting shared state', () => {
  const tab = fixture()
  const old = tab.open('/' + email)
  old.takeEntry(); old.release()
  tab.state.name = 'unrelated-window'
  const before = tab.state.value
  old.resume(); old.release()
  assert.equal(old.get(), undefined)
  assert.equal(tab.state.value, before)
  assert.equal(tab.state.name, 'unrelated-window')
})

test('a confirmed BFCache return accepts a released current-tab source even if the browser restores an older window name', () => {
  const tab=fixture()
  const old=tab.open('/'+email)
  const oldName=tab.state.name
  old.takeEntry();old.release()
  tab.state.name=''
  const current=tab.open('/?utm_source=x')
  current.takeEntry();current.release()
  const newerName=tab.state.name
  tab.state.name=oldName
  old.resume(true)
  assert.equal(old.get().utm_source,'x')
  assert.equal(tab.state.name,newerName)
  assert.equal(JSON.parse(tab.state.value).attribution.utm_source,'x')
})

test('a restored document claims ownership before the newer document releases, so its delayed release cannot undo the claim', () => {
  const tab=fixture()
  const old=tab.open('/'+email)
  const historicalName=tab.state.name
  old.takeEntry();old.release()
  tab.state.name=''
  const newer=tab.open('/?utm_source=x')
  newer.takeEntry()
  // Restore before newer.pagehide updates released: this occurs in real Chrome.
  tab.state.name=historicalName
  old.resume(true)
  const claimed=tab.state.value
  assert.equal(old.get().utm_source,'x')
  newer.release()
  assert.equal(tab.state.value,claimed)
  assert.equal(JSON.parse(claimed).released,false)
})
