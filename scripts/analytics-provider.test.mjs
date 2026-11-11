import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import ts from 'typescript'
import { attributionUrl, contextUrl, eventsUrl, compile, moduleUrl as url } from './analytics-test-modules.mjs'
const { createAttributionController } = await import(attributionUrl)
const fixtureUrl = url(`
  export const state = { enabled:true, consent:true, productionOrigin:'https://recipes.agora.io', topics:[], pathname:'/', search:'', effects:[], refs:[], cursor:0, vercel:[], posthog:[] };
  export const attributionStore = {start(){},getSnapshot:()=>state.controller?.get(),takeEntry:()=>state.controller?.takeEntry(),subscribe:()=>()=>{}};
  export const analyticsConsent = {isGranted:()=>state.consent,subscribe:()=>()=>{},getSnapshot:()=>state.consent?'granted':'denied'};
  export const ga4Consent = undefined;
  export const basicPageCount = ()=>undefined;
  export const sendBasicCount = ()=>{};
  export const captureGa4PageView = ()=>false;
  export const syncGa4Consent = ()=>{};
  export const syncPosthogConsent = ()=>{};
  export const createContext = () => ({ Provider:'Provider' });
  export const useContext = () => state;
  export const useRef = initial => state.refs[state.cursor++] ??= {current:initial};
  export const useEffect = effect => { state.effects.push(effect); };
  export const useCallback = fn => fn;
  export const useSyncExternalStore = (subscribe, snapshot) => snapshot();
  export const usePathname = () => state.pathname;
  export const useCatalogSearch = () => state.search;
  export const useI18n = () => ({locale:'en'});
  export const track = (name, properties) => { state.vercel.push({name, properties}); };
  export const capturePosthog = (name, properties) => { state.posthog.push({name, properties}); };
  export const jsx = (type, props) => ({type, props});
  export const jsxs = jsx;
  export const Fragment = 'Fragment';
  export const Suspense = 'Suspense';
  export const Analytics = 'Analytics';
`)
let source = compile(readFileSync(new URL('../components/analytics-provider.tsx', import.meta.url), 'utf8') + '\nexport { PageAnalytics };')
source = source.replace(/from "([^"]+)"/g, (match, specifier) => `from ${JSON.stringify(specifier === '@/lib/analytics-events' ? eventsUrl : specifier === '@/lib/analytics-context' ? contextUrl : fixtureUrl)}`)
const provider = await import(url(source))
const { state } = await import(fixtureUrl)

function renderPage() {
  state.cursor = 0
  provider.PageAnalytics()
  const effects = state.effects.splice(0)
  effects.forEach(effect => effect())
}

test('real dispatcher resolves attribution before first PV, emits one PostHog entry and attaches it to actions', () => {
  const href = 'https://recipes.agora.io/?utm_source=agora_email&utm_medium=email'
  globalThis.window = { location: new URL(href), addEventListener() {}, removeEventListener() {} }
  state.controller = createAttributionController({ url:href, referrer:'', navigationType:'navigate', isGranted:()=>state.consent, remove(){}, read:()=>null, write() {}, getTabName:()=>'', setTabName() {}, newToken:()=> 'test' })
  renderPage()
  renderPage() // React effect replay must not replay a landing or PV.
  assert.deepEqual(state.posthog.map(e=>e.name), ['campaign_entry', '$pageview'])
  assert.deepEqual(state.vercel, [])
  state.pathname = '/recipes/example'
  window.location = new URL('https://recipes.agora.io/recipes/example?q=private')
  renderPage()
  const capture = provider.useAnalytics()
  for (const [name, action] of [['material_open','demo'], ['video_play','play'], ['content_copy','guide'], ['contribution_open','github_form']]) capture(name, {action, placement:'reader'})
  for (const event of state.posthog) {
    assert.equal(event.properties.utm_source, 'agora_email')
    assert.equal(event.properties.utm_medium, 'email')
    assert.equal(event.properties.landing_path, '/')
    assert.equal(event.properties.utm_campaign, undefined)
    assert.equal(event.properties.measurement_version, 3)
    assert.equal(event.properties.measurement_tier, 'behavioral')
  }
  for (const event of state.vercel) {
    assert.ok(Object.keys(event.properties).length <= 2)
    assert.equal(event.properties.utm_source, undefined)
  }
  assert.equal(state.posthog.filter(e=>e.name==='campaign_entry').length, 1)
  assert.equal(state.posthog.at(-1).properties.$current_url, 'https://recipes.agora.io/recipes/example')
  const before = state.posthog.length
  state.enabled = false
  provider.useAnalytics()('material_open', {action:'demo'})
  assert.equal(state.posthog.length, before, 'disabled collection does not dispatch actions')
  delete globalThis.window
})
