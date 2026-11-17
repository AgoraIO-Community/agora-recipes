import assert from 'node:assert/strict'
import test from 'node:test'
import { createConsentStore, securitiAnalyticsChoice } from '../lib/analytics-consent.ts'

function fixture() {
  let given = false
  const choices = { Performance: 'denied', Traffic: 'denied', Functional: 'granted' }
  const api = {
    isConsentGiven: () => given,
    getCategories: () => [
      { name: 'Performance', base_category: 'Analytics & Customization' },
      { name: 'Traffic', base_category: 'Analytics & Customization' },
      { name: 'Functional', base_category: 'Performance & Functionality' },
    ],
    getConsent: () => ({ category: choices }),
  }
  return { api, choices, decide: () => { given = true } }
}

test('only explicit managed choices enable either analytics purpose', () => {
  const { api, choices, decide } = fixture()
  choices.Performance = 'granted'
  choices.Traffic = 'granted'
  for (const purpose of ['product', 'traffic']) assert.equal(securitiAnalyticsChoice(api, purpose, 'Traffic'), 'pending')
  decide()
  for (const purpose of ['product', 'traffic']) assert.equal(securitiAnalyticsChoice(api, purpose, 'Traffic'), 'granted')
})

test('independent choices and withdrawals are read from one managed record', () => {
  const { api, choices, decide } = fixture()
  decide()
  const product = createConsentStore(api => securitiAnalyticsChoice(api, 'product', 'Traffic'))
  const traffic = createConsentStore(api => securitiAnalyticsChoice(api, 'traffic', 'Traffic'))
  product.useSecuriti(api)
  traffic.useSecuriti(api)
  choices.Performance = 'granted'
  assert.equal(product.isGranted(), true)
  assert.equal(traffic.isGranted(), false)
  choices.Traffic = 'granted'
  choices.Performance = 'denied'
  assert.equal(product.isGranted(), false)
  assert.equal(traffic.isGranted(), true)
  choices.Traffic = 'denied'
  assert.equal(traffic.isGranted(), false)
  product.usePending()
  traffic.usePending()
  assert.equal(product.getSnapshot(), 'pending')
  assert.equal(traffic.getSnapshot(), 'pending')
})

test('the existing single analytics category works without GA4; functional consent cannot grant analytics', () => {
  const { api, decide } = fixture()
  decide()
  api.getCategories = () => [{ name: 'Translated performance', base_category: 'Analytics & Customization' }]
  api.getConsent = () => ({ category: { 'Translated performance': 'denied', Functional: 'granted' } })
  assert.equal(securitiAnalyticsChoice(api), 'denied')
  assert.equal(securitiAnalyticsChoice(api, 'traffic'), 'pending')
})

test('missing, overlapping, ambiguous, unknown and unavailable managed decisions stay closed', () => {
  const { api, decide } = fixture()
  decide()
  assert.equal(securitiAnalyticsChoice(api), 'pending', 'multiple categories need an explicit mapping')
  assert.equal(securitiAnalyticsChoice(api, 'traffic', 'Missing'), 'pending')
  api.getCategories = () => [{ name: 'Performance', base_category: 'Analytics & Customization' }]
  for (const purpose of ['product', 'traffic']) assert.equal(securitiAnalyticsChoice(api, purpose, 'Performance'), 'pending', 'one category cannot control both purposes')
  api.getConsent = () => ({ category: { Performance: 'unknown' } })
  assert.equal(securitiAnalyticsChoice(api), 'pending')
  api.getConsent = () => { throw new Error('unavailable') }
  assert.equal(securitiAnalyticsChoice(api), 'pending')
  api.getCategories = () => []
  assert.equal(securitiAnalyticsChoice(api), 'pending')
})

test('managed updates notify subscribers, including withdrawal from another tab', () => {
  const { api, choices, decide } = fixture()
  decide()
  const store = createConsentStore(api => securitiAnalyticsChoice(api, 'product', 'Traffic'))
  let notifications = 0
  const unsubscribe = store.subscribe(() => { notifications++ })
  store.useSecuriti(api)
  choices.Performance = 'granted'
  store.refresh()
  assert.equal(store.isGranted(), true)
  choices.Performance = 'declined'
  store.refresh()
  assert.equal(store.isGranted(), false)
  assert.equal(notifications, 3)
  unsubscribe()
  store.refresh()
  assert.equal(notifications, 3)
})
