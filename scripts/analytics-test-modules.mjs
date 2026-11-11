import { readFileSync } from 'node:fs'
import ts from 'typescript'
export const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
export const compile = source => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ESNext, jsx: ts.JsxEmit.ReactJSX } }).outputText
export const eventsUrl = new URL('../lib/analytics-events.ts', import.meta.url).href
export const attributionUrl = moduleUrl(compile(readFileSync(new URL('../lib/analytics-attribution.ts', import.meta.url), 'utf8').replace('"./analytics-events"', JSON.stringify(eventsUrl))))
export const contextUrl = moduleUrl(compile(readFileSync(new URL('../lib/analytics-context.ts', import.meta.url), 'utf8')))
export const posthogUrl = moduleUrl(compile(readFileSync(new URL('../lib/posthog-events.ts', import.meta.url), 'utf8').replace('"./analytics-events"', JSON.stringify(eventsUrl)).replace('"./analytics-context"', JSON.stringify(contextUrl)).replace('"./analytics-attribution"', JSON.stringify(attributionUrl))))
