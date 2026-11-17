import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import ts from 'typescript'

const require = createRequire(import.meta.url)
const compile = relative => ts.transpileModule(readFileSync(new URL(relative, import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText
const context = { exports: {} }
new Function('require', 'exports', compile('../lib/analytics-context.ts'))(require, context.exports)
const { pageContext, analyticsProperties } = context.exports

function copyButton(subject) {
  const events = []
  let confirmCopy
  const stubs = {
    '@/components/analytics-provider': { useAnalytics: () => (name, properties) => events.push({ name, properties }) },
    '@/components/locale-provider': { useI18n: () => ({ t: key => key }) },
    '@/hooks/use-copy-feedback': { useCopyFeedback: (_text, onCopied) => {
      confirmCopy = onCopied
      return { state: 'idle', copy: () => {} }
    } },
    '@/components/ui/button': { Button: 'button' },
    '@/components/ui/tooltip': {},
    '@/lib/utils': { cn: (...values) => values.filter(Boolean).join(' ') },
  }
  const loaded = { exports: {} }
  new Function('require', 'exports', compile('../components/code-panel.tsx'))(name => stubs[name] ?? require(name), loaded.exports)
  loaded.exports.CopyTextButton({ text: 'Public contribution prompt', subject, primary: true })
  return { events, confirmCopy: () => confirmCopy() }
}

test('PR prompt copies remain contribution preparation and source-Topic engagement', () => {
  const button = copyButton('PR prompt')
  assert.deepEqual(button.events, [], 'preparing the button is not a successful copy')
  button.confirmCopy()
  assert.deepEqual(button.events, [{ name: 'content_copy', properties: { action: 'prompt', placement: 'hero' } }])
  const context = pageContext('/contribute', `?returnTo=${encodeURIComponent('/topics/voice-ai-in-practice#recipes')}`, ['voice-ai-in-practice'])
  const event = button.events[0]
  const properties = analyticsProperties(context, event.name, event.properties)
  assert.equal(properties.is_topic_engagement, true)
  assert.equal(properties.is_recipe_use, false)
})

test('existing prompt, guide, CLI and code copy categories remain intact', () => {
  for (const [subject, action] of [['Recipe prompt', 'prompt'], ['Prompt', 'prompt'], ['Submission prompt', 'prompt'], ['Markdown', 'guide'], ['Agora CLI', 'cli_command'], ['TypeScript', 'code']]) {
    const button = copyButton(subject)
    button.confirmCopy()
    assert.equal(button.events[0].properties.action, action, subject)
  }
})
