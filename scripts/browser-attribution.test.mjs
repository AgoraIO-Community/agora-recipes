import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { attributionUrl, compile, moduleUrl } from './analytics-test-modules.mjs'

let fixtureId = 0
async function fixture() {
  const mocks = moduleUrl(`
    export const state = { choice:'pending', listeners:[], events:{}, writes:0, names:0, stored:new Map() };
    export const analyticsConsent = { isGranted:()=>state.choice==='granted', getSnapshot:()=>state.choice, subscribe:fn=>{state.listeners.push(fn);return()=>{};} };
    export const choose = value => {state.choice=value; state.listeners.forEach(fn=>fn());};
    export const window = {
      location:new URL('https://recipes.agora.io/?utm_source=agora_email&utm_medium=email'),
      get name(){return state.name??'';},set name(v){state.name=v;state.names++;},
      sessionStorage:{ getItem:k=>state.stored.get(k)??null, setItem:(k,v)=>{state.stored.set(k,v);state.writes++;},removeItem:k=>state.stored.delete(k) },
      addEventListener:(key,fn)=>{(state.events[key]??=[]).push(fn);},
    };
    export const document = {referrer:''};
    export const performance = {getEntriesByType:()=>[{type:'navigate'}]};
    export const crypto = {randomUUID:()=> 'test-${++fixtureId}'};
  `)
  const source = readFileSync(new URL('../lib/browser-attribution.ts', import.meta.url), 'utf8')
    .replace('"./analytics-consent"', JSON.stringify(mocks))
    .replace('"./analytics-attribution"', JSON.stringify(attributionUrl))
  const store = await import(moduleUrl(compile(`import {window,document,performance,crypto} from ${JSON.stringify(mocks)};\n`+source)))
  return { ...await import(mocks), store:store.attributionStore }
}

test('render snapshots never initialize storage; pending, denied, granted and withdrawn choices share one lifecycle', async () => {
  const f = await fixture()
  assert.equal(f.store.getSnapshot(), undefined)
  assert.equal(f.state.writes, 0)
  assert.equal(f.state.names, 0)
  f.store.start()
  f.choose('denied')
  assert.equal(f.state.writes, 0)
  assert.equal(f.state.names, 0)
  f.choose('granted')
  assert.equal(f.store.getSnapshot().utm_source, 'agora_email')
  assert.ok(f.state.writes > 0)
  assert.equal(f.store.takeEntry().utm_source, 'agora_email')
  assert.equal(f.store.takeEntry(), undefined)
  f.choose('denied')
  assert.equal(f.store.getSnapshot(), undefined)
  assert.equal(f.state.stored.size, 0)
  assert.equal(f.window.name, '')
  const writes=f.state.writes
  f.state.events.pagehide.forEach(fn=>fn())
  f.state.events.pageshow.forEach(fn=>fn({persisted:true}))
  assert.equal(f.state.writes,writes)
  f.window.location=new URL('https://recipes.agora.io/recipes/example')
  f.choose('granted')
  assert.equal(f.store.getSnapshot(), undefined, 'regrant does not resurrect the previous source')
  assert.equal(f.store.takeEntry(), undefined)
})

test('regrant on a still-tagged URL uses its explicit source without replaying an already recorded entry', async () => {
  const f=await fixture()
  f.store.start();f.choose('granted')
  assert.ok(f.store.takeEntry())
  f.choose('denied');f.choose('granted')
  assert.equal(f.store.getSnapshot().utm_source,'agora_email')
  assert.equal(f.store.takeEntry(),undefined)
})

test('a frozen document without a controller restores the latest source instead of re-reading its historical UTM', async () => {
  const f=await fixture()
  f.store.start()
  // Simulate a consent grant and new campaign in a later document while this
  // document's listeners are frozen in BFCache, then restore its old email URL.
  f.state.choice='granted'
  f.window.name='recipes:tab:newer'
  f.state.stored.set('recipes:campaign:v1',JSON.stringify({tab:f.window.name,released:true,attribution:{utm_source:'x',landing_path:'/recipes/example'}}))
  f.window.name='recipes:tab:historical'
  f.state.events.pageshow.forEach(fn=>fn({persisted:true}))
  assert.equal(f.store.getSnapshot().utm_source,'x')
  assert.equal(f.store.takeEntry(),undefined)
})

test('startup pending does not erase previously consented attribution before the privacy provider restores its grant', async () => {
  const f=await fixture()
  f.window.name='recipes:tab:saved'
  const saved=JSON.stringify({tab:f.window.name,owner:'prior-document',released:true,attribution:{utm_source:'x',landing_path:'/recipes/example'}})
  f.state.stored.set('recipes:campaign:v1',saved)
  f.window.location=new URL('https://recipes.agora.io/recipes/example')
  f.store.start()
  assert.equal(f.store.getSnapshot(),undefined)
  assert.equal(f.state.stored.get('recipes:campaign:v1'),saved)
  f.choose('granted')
  assert.equal(f.store.getSnapshot().utm_source,'x')
})
