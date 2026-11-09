import assert from 'node:assert/strict'
import test from 'node:test'
import vm from 'node:vm'
import { themeInitScript, THEME_QUERY } from '../lib/theme.ts'

test('theme follows the system before paint and on live changes, ignoring old manual choices', () => {
  for (const initial of [true, false]) {
    const listeners = new Map()
    const preference = { matches: initial, addEventListener: (event, listener) => listeners.set(event, listener) }
    const root = { dataset: {}, classList: { toggle: (name, enabled) => { root[name] = enabled } } }
    const meta = { setAttribute: (name, value) => { meta[name] = value } }
    vm.runInNewContext(themeInitScript, {
      window: { matchMedia: query => { assert.equal(query, THEME_QUERY); return preference } },
      document: { documentElement: root, querySelector: () => meta },
      localStorage: { getItem: () => { throw new Error('old preferences must not be read') } },
    })
    assert.equal(root.dataset.theme, initial ? 'dark' : 'light')
    assert.equal(root.dark, initial)
    assert.equal(meta.content, initial ? '#000000' : '#fcf9f8')
    preference.matches = !initial
    listeners.get('change')()
    assert.equal(root.dataset.theme, initial ? 'light' : 'dark')
    assert.equal(root.dark, !initial)
    assert.equal(meta.content, initial ? '#fcf9f8' : '#000000')
  }
})
