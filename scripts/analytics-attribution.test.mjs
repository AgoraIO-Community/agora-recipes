import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import ts from 'typescript'

const source = readFileSync(new URL('../lib/analytics-attribution.ts', import.meta.url), 'utf8')
  .replace('"./analytics-events"', JSON.stringify(new URL('../lib/analytics-events.ts', import.meta.url).href))
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText
const { createAttributionReader } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)

function fixture(saved) {
  let time = 1000
  let stored = saved ?? null
  const storage = () => ({ getItem: () => stored, setItem: (_, value) => { stored = value }, removeItem: () => { stored = null } })
  return { read: createAttributionReader(storage, () => time), reload: () => createAttributionReader(storage, () => time), advance: ms => { time += ms }, stored: () => stored }
}

test('campaign persists from tagged Topic landing through recipe, actions, reload and contribution', () => {
  const f = fixture()
  const campaign = { utm_source: 'discord', utm_medium: 'community', utm_campaign: 'voice_week', utm_content: 'topic_card' }
  assert.deepEqual(f.read('?utm_source=discord&utm_medium=community&utm_campaign=voice_week&utm_content=topic_card&q=private&token=secret'), campaign)
  f.advance(5 * 60 * 1000)
  assert.deepEqual(f.read('?returnTo=%2Ftopics%2Fvoice-week'), campaign)
  assert.deepEqual(f.reload()('?topic=voice-week'), campaign)
  assert.doesNotMatch(f.stored(), /private|secret|returnTo|topic_card.*token/)
})

test('new tagged touch replaces the campaign instead of mixing old content or term fields', () => {
  const f = fixture()
  f.read('?utm_source=discord&utm_campaign=first&utm_content=old&utm_term=old')
  assert.deepEqual(f.read('?utm_source=newsletter&utm_campaign=second'), { utm_source: 'newsletter', utm_campaign: 'second' })
})

test('activity refreshes the 30-minute window, expiry and future timestamps clear untagged attribution', () => {
  const f = fixture()
  f.read('?utm_source=discord')
  f.advance(29 * 60 * 1000)
  assert.deepEqual(f.read(''), { utm_source: 'discord' })
  f.advance(30 * 60 * 1000)
  assert.deepEqual(f.read(''), {})
  f.advance(30 * 60 * 1000)
  assert.deepEqual(f.read('?utm_source=newsletter'), { utm_source: 'newsletter' })
  assert.deepEqual(fixture(JSON.stringify({ lastActivity: 2000, campaign: { utm_source: 'future' } })).read(''), {})
})

test('disabled/corrupt storage and unrelated parameters never break tracking or add dimensions', () => {
  const read = createAttributionReader(() => { throw new Error('storage disabled') }, () => 1000)
  assert.deepEqual(read('?utm_source=discord&gclid=anything&email=private'), { utm_source: 'discord' })
  assert.deepEqual(read(''), { utm_source: 'discord' })
  assert.deepEqual(fixture('{bad json').read('?q=voice'), {})
  assert.deepEqual(fixture(JSON.stringify({ lastActivity: 1000, campaign: { utm_source: 'person@example.com', utm_campaign: 'safe', token: 'secret' } })).read(''), { utm_campaign: 'safe' })
  assert.deepEqual(fixture().read(''), {}, 'a separate tab has no cross-tab campaign state')
})

test('withdrawing consent clears the stored campaign and in-memory attribution', () => {
  const f = fixture()
  f.read('?utm_source=discord')
  f.read.clear()
  assert.equal(f.stored(), null)
  assert.deepEqual(f.read(''), {})
  assert.deepEqual(f.reload()(''), {})
})
