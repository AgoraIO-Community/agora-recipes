import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import ts from 'typescript'

const source = (await readFile(new URL('../lib/topics.ts', import.meta.url), 'utf8')).replace('import "server-only"', '').replace('import { getAllEntries } from "./recipes"', 'const getAllEntries = () => [{ slug: "shared-entry" }]') .replace('import { getT } from "./i18n"', 'const getT = () => value => value')
async function load(topics) {
  const root = await mkdtemp(path.join(tmpdir(), 'recipes-topics-'))
  try {
    for (const [slug, topic] of Object.entries(topics)) { const dir = path.join(root, 'content/topics', slug); await mkdir(dir, { recursive: true }); await writeFile(path.join(dir, 'topic.json'), JSON.stringify(topic)) }
    const compiled = ts.transpileModule(source.replaceAll('process.cwd()', JSON.stringify(root)), { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText
    const loaded = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)
    return { topics: loaded.getAllTopics(), matches: loaded.getEntryTopics('shared-entry'), completed: loaded.getAllTopics().filter(topic => loaded.topicStatus(topic) === 'Completed').map(topic => topic.slug) }
  } finally { await rm(root, { recursive: true, force: true }) }
}
const base = { title: 'A real collection', summary: 'Related work', kind: 'collection', members: [{ slug: 'shared-entry' }] }
test('explicit membership connects the same entry to several Topics without duplicate entry identities', async () => {
  const result = await load({ 'first-topic': base, 'second-topic': { ...base, title: 'Second' } })
  assert.deepEqual(result.matches.map(topic => topic.slug), ['first-topic', 'second-topic'])
  assert.equal(result.topics[0].starts, undefined)
})
test('unknown/duplicate members, unsafe actions, and activity awards on collections fail validation', async () => {
  for (const data of [{ ...base, members: [{ slug: 'unknown' }] }, { ...base, members: [...base.members, ...base.members] }, { ...base, actions: [{ label: 'Open', url: 'javascript:alert(1)', type: 'source' }] }, { ...base, members: [{ slug: 'shared-entry', award: { label: 'Winner', sourceUrl: 'https://example.com' } }] }]) await assert.rejects(load({ example: data }), /invalid/)
})
test('completed activity editions keep dates, original source references, and attributed awards', async () => {
  const activity = { ...base, kind: 'activity', status: 'completed', starts: '2026-01-01', ends: '2026-01-02', members: [{ slug: 'shared-entry', award: { label: 'Author-reported award', sourceUrl: 'https://example.com/source' } }] }
  assert.equal((await load({ archive: activity })).topics[0].status, 'completed')
  await assert.rejects(load({ archive: { ...activity, starts: '2026-02-01' } }), /date order/)
})

test('only ended activities are archived; ordinary collections remain current', async () => {
  const result = await load({
    collection: base,
    ended: { ...base, kind: 'activity', ends: '2020-01-01' },
    completed: { ...base, kind: 'activity', status: 'completed' },
    upcoming: { ...base, kind: 'activity', status: 'upcoming' },
    ongoing: { ...base, kind: 'activity', status: 'active' },
  })
  assert.deepEqual(result.completed.sort(), ['completed', 'ended'])
})
