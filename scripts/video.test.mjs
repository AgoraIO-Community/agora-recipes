import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'
import { videoSource, youtubeEmbedUrl } from '../lib/video.ts'

const id = 'KwlDBXsbCUM'
test('YouTube share, watch, Shorts, live, and privacy-enhanced URLs identify the same video', () => {
  for (const url of [
    `https://www.youtube.com/watch?v=${id}&si=share-code`,
    `https://youtu.be/${id}`,
    `https://m.youtube.com/shorts/${id}`,
    `https://youtube.com/live/${id}`,
    `https://www.youtube-nocookie.com/embed/${id}`,
  ]) assert.deepEqual(videoSource(url), { kind: 'youtube', videoId: id, start: 0 })
})
test('timestamps survive normalization while embed-only parameters come from the site', () => {
  const source = videoSource(`https://youtu.be/${id}?t=1m23s&autoplay=1&origin=https://attacker.invalid`)
  assert.equal(source.start, 83)
  assert.equal(videoSource(`https://youtube.com/watch?v=${id}&start=24&t=30`).start, 24)
  for (const t of ['-1', 'NaN', '999999999999999999999999', '1s<script>']) assert.equal(videoSource(`https://youtu.be/${id}?t=${encodeURIComponent(t)}`).start, 0)
  const embed = new URL(youtubeEmbedUrl(source, 'https://recipes.agora.io'))
  assert.equal(embed.origin, 'https://www.youtube-nocookie.com')
  assert.equal(embed.pathname, `/embed/${id}`)
  assert.deepEqual(Object.fromEntries(embed.searchParams), { enablejsapi: '1', playsinline: '1', origin: 'https://recipes.agora.io', start: '83' })
})
test('unsafe URLs and invalid YouTube pages never become embedded players', () => {
  for (const url of ['javascript:alert(1)', '//youtube.com/watch?v='+id, 'http://youtube.com/watch?v='+id, `https://user:secret@youtube.com/watch?v=${id}`, 'https://youtube.com/playlist?list=123', 'https://youtu.be/invalid', `https://youtu.be/${id}/extra`, `https://youtube.com/embed/${id}/extra`]) assert.equal(videoSource(url), undefined, url)
  for (const host of ['youtube.com.evil.invalid', 'notyoutube.com']) assert.equal(videoSource(`https://${host}/watch?v=${id}`).kind, 'file')
})
test('direct video URLs on storage/CDNs keep their exact paths, format, query, and fragment', () => {
  for (const url of [
    'https://bucket.s3.us-west-2.amazonaws.com/demo.mp4',
    'https://media.example.com/recording.webm',
    'https://files.example.com/video?id=42&signature=unchanged#t=5',
    'https://github.com/user-attachments/assets/0376ad2c-0a1f-4d9b-b9fa-b452b982e4e2',
  ]) assert.deepEqual(videoSource(url), { kind: 'file', url })
})

function loader() {
  const scripts = []
  const timers = new Map()
  let sequence = 0
  const window = {}
  const context = vm.createContext({ exports: {}, window, document: {
    createElement: () => ({ remove() { this.removed = true } }),
    head: { appendChild: script => scripts.push(script) },
  }, setTimeout: callback => { timers.set(++sequence, callback); return sequence }, clearTimeout: id => timers.delete(id) })
  vm.runInContext(ts.transpileModule(readFileSync(new URL('../lib/youtube-player.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context)
  return { load: context.exports.loadYouTubePlayer, window, scripts, timers }
}
test('multiple openers share one lazy SDK request and preserve an existing ready callback', async () => {
  const fixture = loader()
  assert.equal(fixture.scripts.length, 0)
  let previousCalls = 0
  const previous = () => previousCalls++
  fixture.window.onYouTubeIframeAPIReady = previous
  const first = fixture.load()
  const second = fixture.load()
  assert.equal(first, second)
  assert.equal(fixture.scripts.length, 1)
  assert.equal(fixture.scripts[0].src, 'https://www.youtube.com/iframe_api')
  fixture.window.YT = { Player: class {} }
  fixture.window.onYouTubeIframeAPIReady()
  assert.equal(await first, fixture.window.YT)
  assert.equal(previousCalls, 1)
  assert.equal(fixture.window.onYouTubeIframeAPIReady, previous)
  assert.equal(fixture.timers.size, 0)
  assert.equal(await fixture.load(), fixture.window.YT)
  assert.equal(fixture.scripts.length, 1)
})
test('SDK network failure and timeout are recoverable without duplicate requests', async () => {
  for (const mode of ['network', 'timeout']) {
    const fixture = loader()
    const failed = fixture.load()
    const rejected = assert.rejects(failed, /could not load/)
    if (mode === 'network') fixture.scripts[0].onerror()
    else [...fixture.timers.values()][0]()
    await rejected
    assert.equal(fixture.scripts[0].removed, true)
    assert.equal(fixture.timers.size, 0)
    const retry = fixture.load()
    assert.equal(fixture.scripts.length, 2)
    fixture.window.YT = { Player: class {} }
    fixture.window.onYouTubeIframeAPIReady()
    assert.equal(await retry, fixture.window.YT)
  }
})
