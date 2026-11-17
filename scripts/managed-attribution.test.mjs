import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { attributionUrl, compile, moduleUrl } from './analytics-test-modules.mjs'

const consentUrl=new URL('../lib/analytics-consent.ts',import.meta.url).href

test('the current managed product/traffic contract gates attribution, forwarding and withdrawal through the same store',async()=>{
  const environment=moduleUrl(`
    import {createConsentStore,securitiAnalyticsChoice} from ${JSON.stringify(consentUrl)};
    export const state={given:false,available:true,choices:{Performance:'denied',Traffic:'denied'},writes:0,stored:new Map(),events:{}};
    const api={
      isConsentGiven:()=>state.given,
      getCategories:()=>[{name:'Performance',base_category:'Analytics & Customization'},{name:'Traffic',base_category:'Analytics & Customization'}],
      getConsent:()=>{if(!state.available)throw Error('CMP unavailable');return{category:state.choices};},
      showPreferenceCenter(){},showBanner(){},
    };
    export const analyticsConsent=createConsentStore(api=>securitiAnalyticsChoice(api,'product','Traffic'));
    export const trafficConsent=createConsentStore(api=>securitiAnalyticsChoice(api,'traffic','Traffic'));
    export const bind=()=>{analyticsConsent.useSecuriti(api);trafficConsent.useSecuriti(api);};
    export const refresh=()=>{analyticsConsent.refresh();trafficConsent.refresh();};
    export const window={location:new URL('https://recipes.agora.io/?utm_source=x&utm_id=launch_v1'),name:'',sessionStorage:{getItem:k=>state.stored.get(k)??null,setItem:(k,v)=>{state.writes++;state.stored.set(k,v);},removeItem:k=>state.stored.delete(k)},addEventListener:(key,fn)=>{(state.events[key]??=[]).push(fn);}};
    export const document={referrer:''};
    export const performance={getEntriesByType:()=>[{type:'navigate'}]};
    export const crypto={randomUUID:()=> 'managed-fixture'};
  `)
  const source=readFileSync(new URL('../lib/browser-attribution.ts',import.meta.url),'utf8')
    .replace('"./analytics-consent"',JSON.stringify(environment)).replace('"./analytics-attribution"',JSON.stringify(attributionUrl))
  const {attributionStore:store}=await import(moduleUrl(compile(`import {window,document,performance,crypto} from ${JSON.stringify(environment)};\n`+source)))
  const {state,window,analyticsConsent,trafficConsent,bind,refresh}=await import(environment)
  const {attributedDestination}=await import(attributionUrl)
  const target='https://demo.example/'
  const link=()=>attributedDestination(target,store.getSnapshot())
  store.start();bind()
  state.choices.Performance='granted';refresh()
  assert.equal(analyticsConsent.getSnapshot(),'pending','SDK defaults without an explicit decision are not consent')
  assert.equal(state.writes,0)
  assert.equal(window.name,'')
  assert.equal(link(),target)
  state.given=true;state.choices.Performance='denied';state.choices.Traffic='granted';refresh()
  assert.equal(trafficConsent.isGranted(),true)
  assert.equal(store.getSnapshot(),undefined,'a traffic-only grant cannot enable campaign attribution')
  assert.equal(state.writes,0)
  state.choices.Performance='granted';state.choices.Traffic='denied';refresh()
  assert.equal(trafficConsent.isGranted(),false)
  assert.equal(store.getSnapshot().utm_source,'x')
  assert.equal(new URL(link()).searchParams.get('utm_id'),'launch_v1')
  state.choices.Performance='declined';refresh()
  assert.equal(store.getSnapshot(),undefined)
  assert.equal(state.stored.size,0)
  assert.equal(window.name,'')
  assert.equal(link(),target)
  state.choices.Performance='granted';refresh()
  state.available=false;refresh()
  assert.equal(analyticsConsent.getSnapshot(),'pending')
  assert.equal(store.getSnapshot(),undefined)
  assert.equal(state.stored.size,0)
  assert.equal(link(),target)
})
