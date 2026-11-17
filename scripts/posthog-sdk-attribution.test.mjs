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
