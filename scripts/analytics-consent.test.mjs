import assert from 'node:assert/strict'
import test from 'node:test'
import { createConsentStore, savedConsentChoice, securitiAnalyticsChoice } from '../lib/analytics-consent.ts'

function fixture() {
  const values = new Map()
  const store = createConsentStore(() => ({ getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }), () => 1000)
  return { store, values }
}

test('no analytics grant exists until an explicit local decision; only the preference is stored', () => {
  const { store, values } = fixture()
  assert.equal(store.isGranted(), false)
  const choose = store.useLocal()
  assert.equal(store.getSnapshot(), 'pending')
  assert.equal(values.size, 0)
  choose(false)
  assert.equal(store.getSnapshot(), 'denied')
  choose(true)
  assert.equal(store.isGranted(), true)
  assert.deepEqual(JSON.parse([...values.values()][0]), { version: 1, analytics: true, updatedAt: 1000 })
  choose(false)
  assert.equal(store.isGranted(), false)
})

test('missing, corrupt, expired and future-dated records never enable analytics', () => {
  for (const value of [null, '{bad', '{}', JSON.stringify({ version: 1, analytics: 'true', updatedAt: 1000 }), JSON.stringify({ version: 2, analytics: true, updatedAt: 1000 }), JSON.stringify({ version: 1, analytics: true, updatedAt: 1001 })]) assert.equal(savedConsentChoice(value, 1000), 'pending')
  assert.equal(savedConsentChoice(JSON.stringify({ version: 1, analytics: true, updatedAt: 0 }), 180 * 86400 * 1000), 'pending')
})

test('blocked storage and quota errors preserve explicit choices for this tab only', () => {
  for (const storage of [() => { throw new Error('blocked') }, () => ({ getItem: () => null, setItem: () => { throw new Error('quota') } })]) {
    const store = createConsentStore(storage)
    const choose = store.useLocal()
    choose(true)
    assert.equal(store.isGranted(), true)
    choose(false)
    assert.equal(store.isGranted(), false)
  }
})

test('Securiti uses the explicit analytics base category, independent of translated labels and numeric IDs', () => {
  let granted = false
  const api = { isConsentGiven: () => true, getCategories: () => [{ name: 'Performance', base_category: 'Analytics & Customization' }, { name: 'Functional', base_category: 'Performance & Functionality' }], getConsent: () => ({ category: { Performance: granted ? 'granted' : 'denied', Functional: 'granted' } }) }
  assert.equal(securitiAnalyticsChoice(api), 'denied')
  granted = true
  assert.equal(securitiAnalyticsChoice(api), 'granted')
  assert.equal(securitiAnalyticsChoice({ ...api, isConsentGiven: () => false }), 'pending')
  assert.equal(securitiAnalyticsChoice({ ...api, getCategories: () => [] }), 'pending')
  assert.equal(securitiAnalyticsChoice({ ...api, getConsent: () => { throw new Error('unavailable') } }), 'pending')
})

test('the live gate sees central withdrawal immediately and does not fall back to an earlier local grant', () => {
  const { store } = fixture()
  store.useLocal()(true)
  let granted = false
  const api = { isConsentGiven: () => true, getCategories: () => [{ name: 'Performance', base_category: 'Analytics & Customization' }], getConsent: () => ({ category: { Performance: granted ? 'granted' : 'denied' } }) }
  store.useSecuriti(api)
  assert.equal(store.isGranted(), false)
  granted = true
  assert.equal(store.isGranted(), true)
  granted = false
  assert.equal(store.isGranted(), false)
  store.usePending()
  assert.equal(store.getSnapshot(), 'pending', 'a failed/retrying CMP stays closed')
})
