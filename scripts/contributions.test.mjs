import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import ts from 'typescript'

const source = readFileSync(new URL('../lib/contributions.ts', import.meta.url), 'utf8')
  .replace('"./locales"', JSON.stringify(new URL('../lib/locales.ts', import.meta.url).href))
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText
const { contributionPath, contributionTopic, contributionMaterials } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)
const topics = { 'voice-ai-in-practice': 'Voice AI in practice', 'voice-ai-hackathon-2026': 'Hackathon' }

test('contribution entries inherit the explicit Topic page or validated detail source', () => {
  const fromTopic = new URL(contributionPath('/zh-Hans/topics/voice-ai-in-practice', '?q=phone', 'zh-Hans', topics), 'https://catalog.invalid')
  assert.equal(fromTopic.searchParams.get('topic'), 'voice-ai-in-practice')
  assert.equal(fromTopic.searchParams.get('returnTo'), '/zh-Hans/topics/voice-ai-in-practice?q=phone#recipes')
  const source = '/zh-Hans/topics/voice-ai-hackathon-2026?q=Pillion&all=1#recipes'
  const fromDetail = new URL(contributionPath('/zh-Hans/recipes/pillion', `?returnTo=${encodeURIComponent(source)}`, 'zh-Hans', topics), 'https://catalog.invalid')
  assert.equal(fromDetail.searchParams.get('topic'), 'voice-ai-hackathon-2026')
  assert.equal(fromDetail.searchParams.get('returnTo'), source)
  assert.equal(contributionPath('/ja/contribute', '?topic=voice-ai-in-practice', 'ja', topics), '/ja/contribute?topic=voice-ai-in-practice')
})

test('quick filters, direct details, unknown Topics, and escaping sources do not pick a Topic', () => {
  for (const [path, search] of [
    ['/', '?topic=voice'],
    ['/recipes/pillion', '?topic=voice-ai-in-practice'],
    ['/topics/unknown', ''],
    ['/recipes/pillion', '?returnTo=https://example.com/topics/voice-ai-in-practice'],
    ['/recipes/pillion', '?returnTo=//example.com/topics/voice-ai-in-practice'],
    ['/recipes/pillion', `?returnTo=${encodeURIComponent('/topics/voice-ai-in-practice/../unknown')}`],
    ['/contribute', '?topic=constructor'],
  ]) assert.equal(new URL(contributionPath(path, search, 'en', topics), 'https://catalog.invalid').searchParams.has('topic'), false)
  assert.equal(contributionTopic('?topic=voice-ai-in-practice', topics), 'voice-ai-in-practice')
  assert.equal(contributionTopic('?topic=unknown', topics), undefined)
})

test('PR materials carry the selected Topic and target the upstream staging guide', () => {
  const reference = 'https://recipes.agora.io/zh-Hant/topics/voice-ai-in-practice'
  const { guideUrl, prompt } = contributionMaterials('zh-Hant', 'https://recipes.agora.io', 'voice-ai-in-practice')
  const guide = new URL(guideUrl)
  assert.equal(guide.origin, 'https://github.com')
  assert.equal(guide.pathname, '/AgoraIO-Community/agora-recipes/blob/staging/CONTRIBUTING.md')
  assert.ok(prompt.includes(`Topic reference: ${reference}`))
  assert.ok(prompt.includes('existing Topic voice-ai-in-practice in the same PR'))
  assert.doesNotMatch(prompt, /\/issues\/new|submission\.yml/)
})

test('general PR prompts prepare complete metadata without inventing a Topic or editing the implementation', () => {
  const { prompt } = contributionMaterials('en', 'https://recipes.agora.io')
  assert.ok(prompt.includes('None selected. Prepare a general catalog submission.'))
  assert.ok(prompt.includes('Do not infer or create a Topic'))
  assert.ok(prompt.includes('Write catalog metadata and the PR title/body in English'))
  assert.ok(prompt.includes('Keep the original code, README files, author credit, and submitted URLs unchanged'))
  assert.ok(prompt.includes('Do not read credentials or .env files'))
  assert.ok(prompt.includes('separate checkout'))
  assert.ok(prompt.includes('content/recipes/<slug>/recipe.json'))
  assert.ok(prompt.includes('templates/recipe.json') && prompt.includes('templates/demo.json'))
  assert.ok(prompt.includes('Run npm run build'))
  assert.ok(prompt.includes('targeting staging'))
  assert.ok(prompt.includes('Do not merge the PR'))
})

test('missing GitHub access falls back to ready-to-submit PR files, not a maintainer Issue handoff', () => {
  const { prompt } = contributionMaterials('en', 'https://recipes.agora.io')
  assert.ok(prompt.includes('exact file path, complete recipe.json, any Topic patch, and the PR title/body'))
  assert.ok(prompt.includes('Do not create a submission Issue'))
  assert.doesNotMatch(prompt, /\/issues\/new|\[Submission\]/)
})

test('changing or clearing association does not change the source used by the return link', () => {
  const source = '/zh-Hans/topics/voice-ai-in-practice?q=phone#recipes'
  for (const selected of ['voice-ai-hackathon-2026', undefined]) {
    const params = new URLSearchParams({ returnTo: source })
    if (selected) params.set('topic', selected)
    const href = new URL(contributionPath('/zh-Hans/contribute', params.toString(), 'zh-Hans', topics), 'https://catalog.invalid')
    assert.equal(href.searchParams.get('returnTo'), source)
    assert.equal(href.searchParams.get('topic'), selected ?? null)
  }
})
