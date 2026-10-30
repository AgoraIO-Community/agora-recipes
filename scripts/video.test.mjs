import test from 'node:test'
import assert from 'node:assert/strict'
import { youtubeEmbedUrl } from '../lib/video.ts'
test('YouTube links use privacy-enhanced embeds with only a validated video ID', () => {
  for (const url of ['https://youtu.be/KwlDBXsbCUM','https://www.youtube.com/watch?v=KwlDBXsbCUM&feature=share']) assert.equal(youtubeEmbedUrl(url),'https://www.youtube-nocookie.com/embed/KwlDBXsbCUM')
  for (const url of ['https://example.com/watch?v=KwlDBXsbCUM','https://youtube.com.evil.test/watch?v=KwlDBXsbCUM','javascript:alert(1)','https://youtu.be/invalid','http://youtu.be/KwlDBXsbCUM','https://example.com/demo.mp4']) assert.equal(youtubeEmbedUrl(url),null)
})
