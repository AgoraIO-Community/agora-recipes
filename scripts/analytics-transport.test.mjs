import assert from 'node:assert/strict'
import test from 'node:test'
import { createConsentTransport } from '../lib/analytics-transport.ts'

test('a queued retry rechecks consent before it can acquire a request signal', () => {
  let allowed = true
  const transport = createConsentTransport(() => allowed)
  const request = transport.options.signal
  assert.equal(request.aborted, false)
  allowed = false
  assert.equal(transport.options.signal.aborted, true)
  assert.equal(request.aborted, true, 'the prior in-flight request is also aborted')
  allowed = true
  assert.equal(transport.options.signal.aborted, true, 'an old grant cannot revive after reacceptance')
  assert.equal(createConsentTransport(() => allowed).options.signal.aborted, false)
})

test('explicit withdrawal aborts requests and the fallback works without AbortSignal.any/timeout', () => {
  const { any, timeout } = AbortSignal
  try {
    AbortSignal.any = undefined
    AbortSignal.timeout = undefined
    const transport = createConsentTransport(() => true)
    const request = transport.options.signal
    transport.abort()
    assert.equal(request.aborted, true)
    assert.equal(transport.options.signal.aborted, true)
  } finally { AbortSignal.any = any; AbortSignal.timeout = timeout }
})
