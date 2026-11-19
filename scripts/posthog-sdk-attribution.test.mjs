import assert from 'node:assert/strict'
import test from 'node:test'
import { execFileSync } from 'node:child_process'
import { posthogUrl, eventsUrl } from './analytics-test-modules.mjs'

// Exercise the installed SDK's real event-property merge with separate SDK
// persistence objects. No capture or network request is made; the child exits
// explicitly to stop the SDK's background lifecycle timers.
test('real PostHog SDK cannot restore stale session UTM after cleanup or explicit per-capture defaults', () => {
  const output=execFileSync(process.execPath,['--input-type=module','-e',`
    import {PostHog} from 'posthog-js/dist/module.slim.js';
    import {campaignKeys} from ${JSON.stringify(eventsUrl)};
    import {sanitizePosthogEvent} from ${JSON.stringify(posthogUrl)};
    const sdk=new PostHog();
    sdk.init('phc_local_test',{persistence:'memory',capture_pageview:false,capture_pageleave:false,autocapture:false,advanced_disable_flags:true,disable_session_recording:true,person_profiles:'never',save_campaign_params:false});
    const Persistence=sdk.persistence.constructor;
    sdk.sessionPersistence=new Persistence({...sdk.config,persistence:'memory',persistence_name:'fixture_session'});
    sdk.calculateEventProperties('warmup',{});
    const old={utm_medium:'email',utm_campaign:'old_campaign',utm_content:'old_email_cta',utm_id:'old_id'};
    sdk.register(old);sdk.register_for_session(old);
    for(const key of campaignKeys)sdk.unregister(key);
    const input={utm_source:'x',landing_path:'/'};
    const sanitize=properties=>sanitizePosthogEvent({event:'material_open',properties}).properties;
    const before=sanitize(sdk.calculateEventProperties('material_open',input));
    for(const key of campaignKeys)sdk.unregister_for_session(key);
    const after=sanitize(sdk.calculateEventProperties('material_open',input));
    sdk.register_for_session(old);
    const defaults=Object.fromEntries(campaignKeys.map(key=>[key,null]));
    const defended=sanitize(sdk.calculateEventProperties('material_open',{...defaults,...input}));
    console.log(JSON.stringify({before,after,defended}));
    process.exit(0);
  `],{encoding:'utf8',timeout:30000})
  const result=JSON.parse(output.trim().split('\n').at(-1))
  assert.equal(result.before.utm_medium,'email','the old PR cleanup leaves the real session merge vulnerable')
  for (const properties of [result.after,result.defended]) {
    assert.equal(properties.utm_source,'x')
    assert.equal(properties.landing_path,'/')
    for(const key of ['utm_medium','utm_campaign','utm_content','utm_id','utm_term']) assert.equal(properties[key],undefined,key)
    assert.equal(properties.measurement_version,3)
  }
})

test('real SDK persistence guard blocks raw session-entry URLs even with save_referrer disabled', () => {
  const output=execFileSync(process.execPath,['--input-type=module','-e',`
    import fs from 'node:fs';
    globalThis.document={
      referrer:'https://www.google.com/search?q=private_keyword',
      URL:'https://recipes.agora.io/?invite=private_invite', cookie:'',
      addEventListener(){}, removeEventListener(){},
      createElement(){return new URL('https://recipes.agora.io/');},
    };
    globalThis.location=new URL(document.URL);
    globalThis.fetch=()=>{throw Error('Unexpected network request');};
    const {PostHog}=await import('posthog-js/dist/module.slim.js');
    const {sanitizePosthogEvent}=await import(${JSON.stringify(posthogUrl)});
    const source=fs.readFileSync('lib/posthog-client.ts','utf8');
    const sourceKeys=JSON.parse(source.match(/const sourceKeys = (\\[[^\\n]+\\])/)[1]);
    const guard=source.slice(source.indexOf('    for (const persistence of new Set('),source.indexOf('    for (const key of [...campaignKeys'));
    const run=guarded=>{
      const sdk=new PostHog();
      sdk.init('phc_local_test',{persistence:'memory',defaults:'2026-08-30',capture_pageview:false,capture_pageleave:false,autocapture:false,advanced_disable_flags:true,disable_session_recording:true,person_profiles:'never',save_referrer:false,save_campaign_params:false,before_send:sanitizePosthogEvent});
      sdk._send_request=()=>{};
      if(guarded){
        new Function('posthog','sourceKeys',guard)(sdk,sourceKeys);
        for(const key of sourceKeys){sdk.unregister(key);sdk.unregister_for_session(key);}
      }
      const event=sdk.capture('material_open',{action:'demo',$current_url:'https://recipes.agora.io/',$referring_domain:'www.google.com'});
      return {stored:JSON.stringify([sdk.persistence.props,sdk.sessionPersistence.props]),event};
    };
    try{console.log(JSON.stringify({baseline:run(false),guarded:run(true)}));process.exit(0);}
    catch(error){console.error(error.message);process.exit(1);}
  `],{encoding:'utf8',timeout:30000})
  const {baseline,guarded}=JSON.parse(output.trim().split('\n').at(-1))
  assert.match(baseline.stored,/private_invite/,'save_referrer false alone still stores the landing URL')
  assert.doesNotMatch(guarded.stored,/private_invite|private_keyword|\$client_session_props|\$referrer/)
  assert.equal(guarded.event.properties.$referring_domain,'www.google.com')
  assert.doesNotMatch(JSON.stringify(guarded.event),/private_invite|private_keyword|\$referrer/)
})
