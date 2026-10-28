import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import test from 'node:test'

const exec = promisify(execFile)
test('the builder fetches only configured guides and leaves other materials usable without fetch errors', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'recipe-materials-'))
  try {
    const content = path.join(root, 'content'), output = path.join(root, 'generated'), trace = path.join(root, 'fetches.txt')
    const fixtures = { demo: { demoUrl: 'https://example.com' }, video: { media: { videoUrl: 'https://example.com/video.mp4' } }, source: { mainRepoUrl: 'https://github.com/example/project' }, guide: { recipeUrl: 'https://github.com/example/project/blob/main/README.md' } }
    for (const [slug, meta] of Object.entries(fixtures)) {
      await mkdir(path.join(content, slug), { recursive: true })
      await writeFile(path.join(content, slug, 'recipe.json'), JSON.stringify({ title: slug, ...meta }))
    }
    const stub = path.join(root, 'fetch.mjs')
    await writeFile(stub, `import fs from 'node:fs/promises';globalThis.fetch=async url=>{await fs.appendFile(${JSON.stringify(trace)},url+'\\n');return new Response('# Original guide\\n[Asset](./image.png)')}`)
    await exec(process.execPath, ['--import', stub, 'scripts/build-recipes.mjs', `--content-dir=${content}`, `--output-dir=${output}`])
    assert.deepEqual((await readFile(trace, 'utf8')).trim().split('\n'), ['https://raw.githubusercontent.com/example/project/main/README.md'])
    for (const slug of ['demo', 'video', 'source']) {
      const result = JSON.parse(await readFile(path.join(output, slug + '.json'), 'utf8'))
      assert.equal(result.recipeDocument.markdown, '')
      assert.equal(result.recipeDocument.fetchError, undefined)
      assert.equal(result.primaryPrompt, '')
    }
    const guide = JSON.parse(await readFile(path.join(output, 'guide.json'), 'utf8'))
    assert.equal(guide.source.mainRepoUrl, 'https://github.com/example/project')
    assert.match(guide.recipeDocument.markdown, /https:\/\/github.com\/example\/project\/blob\/main\/image.png/)
  } finally { await rm(root, { recursive: true, force: true }) }
})

test('the real build preserves the submitted original and resolves a confirmed translation from its own directory', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'recipe-language-build-'))
  try {
    const content = path.join(root, 'content'), output = path.join(root, 'generated')
    const sourceUrl = 'https://github.com/example/project/blob/main/README.md'
    const variant = 'https://github.com/example/project/blob/main/README.zh-CN.md'
    await mkdir(path.join(content, 'bilingual'), { recursive: true })
    await writeFile(path.join(content, 'bilingual', 'recipe.json'), JSON.stringify({ title: 'Bilingual', mainRepoUrl: 'https://github.com/example/project', recipeUrl: sourceUrl }))
    const stub = path.join(root, 'fetch.mjs')
    await writeFile(stub, `globalThis.fetch=async url=>new Response(url.includes('zh-CN') ? '[English](README.md) · **简体中文**\\n# 原文\\n![图片](./assets/image.png)' : '**English** · [简体中文](README.zh-CN.md)\\n# Original')`)
    await exec(process.execPath, ['--import', stub, 'scripts/build-recipes.mjs', `--content-dir=${content}`, `--output-dir=${output}`])
    const artifact = JSON.parse(await readFile(path.join(output, 'bilingual.json'), 'utf8'))
    assert.equal(artifact.source.recipeUrl, sourceUrl)
    assert.equal(artifact.recipeDocument.viewUrl, sourceUrl)
    assert.match(artifact.recipeDocument.markdown, /# Original/)
    const translated = artifact.documentLanguages.versions['zh-Hans']
    assert.equal(translated.viewUrl, variant)
    assert.match(translated.markdown, /# 原文/)
    assert.match(translated.markdown, /https:\/\/github.com\/example\/project\/blob\/main\/assets\/image.png/)
    assert.equal(artifact.documentLanguages.originalLanguage, 'en')
  } finally { await rm(root, { recursive: true, force: true }) }
})
