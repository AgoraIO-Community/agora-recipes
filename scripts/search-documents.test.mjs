import assert from 'node:assert/strict'
import test from 'node:test'
import { searchableGuide } from '../lib/search-documents.ts'
import { discoverRecipes, defaultFilters } from '../lib/recipe-discovery.ts'

const base = { title:'Project', tagline:'Description', description:'Existing materials', slug:'body-match', tags:['voice-ai'], platforms:['Python'], useCases:[], capabilities:[], author:'Public author', guideSearchText:'Inventory recovery uses stockledgerrepair to restore a booth.\nShared credentials stay on the server.' }

test('static guide text includes code and link labels without HTML or executable payloads', () => {
 const markdown='<div>Inventory recovery</div>\n\n```sh\nstockledgerrepair --restore\n```\n[Rehearsal steps](https://example.com/private-path)\n<script>executeBadStuff()</script>'
 const text=searchableGuide(markdown)
 assert.match(text,/Inventory recovery/)
 assert.match(text,/stockledgerrepair --restore/)
 assert.match(text,/Rehearsal steps/)
 assert.doesNotMatch(text,/<div>|<script>|executeBadStuff|private-path/)
})
test('guide-only terms and incremental prefixes return a source excerpt; metadata matches rank first', () => {
 const title={...base,slug:'title-match',title:'Stockledgerrepair',guideSearchText:undefined}
 const results=discoverRecipes([base,title],{...defaultFilters,query:'stockledger'})
 assert.deepEqual(results.map(r=>r.slug),['title-match','body-match'])
 assert.match(results[1].searchExcerpt,/stockledgerrepair/)
 assert.equal(results[0].searchExcerpt,undefined)
 assert.equal(discoverRecipes([base],{...defaultFilters,query:'Python stockledgerrepair'}).length,1)
 assert.equal(discoverRecipes([base],{...defaultFilters,query:'stockledgerrepair',platforms:['iOS']}).length,0)
})
test('Chinese and Japanese queries, Topic aliases, prefixes and typos match public multilingual metadata', () => {
 const entry={...base,title:'Dumpling Booth',searchTerms:['饺子铺','餃子鋪','iRTE2026 · Agora Real-Time Intelligence Conference','语音互动','音声のエージェント'],guideSearchText:undefined}
 for(const query of ['饺','饺子','餃子','dumpl','dumplnig','iRTE 2026','rte2026','语音','音声','我想做一个语音智能体']) assert.equal(discoverRecipes([entry],{...defaultFilters,query}).length,1,query)
 assert.equal(discoverRecipes([entry],{...defaultFilters,query:'definitelynotinthisentry'}).length,0)
})

test('a contiguous guide phrase ranks above scattered metadata words', () => {
 const scattered={...base,slug:'scattered',title:'Inventory tools',capabilities:['Recovery'],guideSearchText:undefined}
 const exact={...base,slug:'phrase',title:'Booth setup'}
 assert.deepEqual(discoverRecipes([scattered,exact],{...defaultFilters,query:'inventory recovery'}).map(r=>r.slug),['phrase','scattered'])
})
