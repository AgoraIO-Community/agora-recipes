import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ts from 'typescript'

const require = createRequire(import.meta.url)
function load(relative) {
  const source = readFileSync(new URL(relative, import.meta.url), 'utf8')
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText
  const loaded = { exports: {} }
  new Function('require', 'module', 'exports', code)(name => name === '@/lib/utils' ? load('../lib/utils.ts') : require(name), loaded, loaded.exports)
  return loaded.exports
}
const { Button } = load('../components/ui/button.tsx')
function press(element, phase = 'onClick') {
  const event = { prevented: false, stopped: false, preventDefault() { this.prevented = true }, stopPropagation() { this.stopped = true } }
  element.props[phase](event)
  return event
}

test('busy buttons keep their accessible label and focus eligibility while blocking repeated actions', () => {
  let calls = 0
  const button = Button({ busy: true, children: 'Copy guide', onClick: () => calls++ })
  const markup = renderToStaticMarkup(button)
  assert.match(markup, /aria-busy="true"/)
  assert.match(markup, /aria-disabled="true"/)
  assert.match(markup, /Copy guide/)
  assert.doesNotMatch(markup, / disabled=""/)
  assert.equal(press(button).prevented, true)
  assert.equal(press(button).stopped, true)
  assert.equal(calls, 0)
})
test('busy or disabled slotted links block navigation before child actions; idle buttons invoke actions', () => {
  let calls = 0
  for (const state of [{ busy: true }, { disabled: true }, { 'aria-disabled': true }]) {
    const link = Button({ ...state, asChild: true, children: React.createElement('a', { href: '/contribute', onClick: () => calls++ }, 'Contribute') })
    const markup = renderToStaticMarkup(link)
    assert.match(markup, /<a /)
    assert.match(markup, /aria-disabled="true"/)
    assert.doesNotMatch(markup, / disabled=""/)
    assert.equal(press(link, 'onClickCapture').stopped, true)
  }
  const idle = Button({ children: 'Retry', onClick: () => calls++ })
  assert.equal(press(idle).prevented, false)
  assert.equal(calls, 1)
})
test('explicitly unavailable buttons stay natively disabled; custom copy feedback avoids a second spinner', () => {
  assert.match(renderToStaticMarkup(Button({ disabled: true, children: 'Reset' })), / disabled=""/)
  const markup = renderToStaticMarkup(Button({ busy: true, busyIndicator: false, children: 'Copying…' }))
  assert.match(markup, /aria-busy="true"/)
  assert.doesNotMatch(markup, /ag-button__progress|data-progress=/)
})
