import fs from "node:fs/promises"
import path from "node:path"
import { createHash } from "node:crypto"
import { fileURLToPath } from "node:url"

// Optional: vendor the existing screenshots added by the image inventory work.
// Run from any directory: node scripts/vendor-recipe-images.mjs
// No dependencies, credentials, installation, or source-project execution.
const root = fileURLToPath(new URL("../", import.meta.url))
const manifestPath = path.join(root, "content/showcase.json")
const original = await fs.readFile(manifestPath, "utf8")
const entries = JSON.parse(original)
const slugs = new Set([
  "agora-flutter-rtc-quickstart", "agora-ios-guide", "bhaasha-agora",
  "csharp-rtc-quickstart", "flutter-quickstart", "pause-with-agora",
  "pillion", "unity-virtual-camera-demos", "unity-virtual-camera-prefab",
  "ios-live-shopping-reference-app",
])

for (const entry of entries) {
  if (!slugs.has(entry.slug) || !entry.thumbnail.startsWith("https://")) continue
  const sourceUrl = entry.thumbnail
  const response = await fetch(sourceUrl, { signal: AbortSignal.timeout(30_000) })
  if (!response.ok) throw new Error(`${entry.slug}: image HTTP ${response.status}`)
  if (!response.headers.get("content-type")?.startsWith("image/png")) {
    throw new Error(`${entry.slug}: expected the verified PNG screenshot`)
  }
  const bytes = Buffer.from(await response.arrayBuffer())
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  if (bytes.length < 24 || bytes.length > 8 * 1024 * 1024 || !bytes.subarray(0, 8).equals(signature)) {
    throw new Error(`${entry.slug}: invalid or oversized PNG`)
  }
  const filename = `${entry.slug}.png`
  const target = path.join(root, "public/recipes", filename)
  const sidecar = `${target}.json`
  const sha256 = createHash("sha256").update(bytes).digest("hex")
  const provenance = {
    prompt: `Existing project screenshot from ${sourceUrl}; no generated UI, no locally simulated session, no cropping or resizing.`,
    sourceUrl,
    sourceRepository: entry.thumbnailSource,
    createdAt: new Date().toISOString(),
    sha256,
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  }
  // Never overwrite an unrelated existing asset or provenance record.
  let existing
  try { existing = await fs.readFile(target) } catch (error) {
    if (error.code !== "ENOENT") throw error
  }
  if (existing) {
    if (!existing.equals(bytes)) throw new Error(`${entry.slug}: existing asset differs; refusing to overwrite`)
    const previous = JSON.parse(await fs.readFile(sidecar, "utf8"))
    if (previous.sourceUrl !== sourceUrl || previous.sha256 !== sha256) {
      throw new Error(`${entry.slug}: existing provenance differs; refusing to overwrite`)
    }
  } else {
    try {
      await fs.access(sidecar)
      throw new Error(`${entry.slug}: provenance already exists without its image`)
    } catch (error) {
      if (error.code !== "ENOENT") throw error
    }
    await fs.mkdir(path.dirname(target), { recursive: true })
    await fs.writeFile(target, bytes, { flag: "wx" })
    await fs.writeFile(sidecar, `${JSON.stringify(provenance, null, 2)}\n`, { flag: "wx" })
  }
  entry.thumbnail = `/recipes/${filename}`
  console.log(`${entry.slug}: saved original ${provenance.width}x${provenance.height} PNG`)
}

// Preserve concurrent user edits rather than replacing an outdated manifest.
if (await fs.readFile(manifestPath, "utf8") !== original) {
  throw new Error("showcase.json changed during download; assets saved, manifest left untouched")
}
await fs.writeFile(manifestPath, `${JSON.stringify(entries, null, 2)}\n`)
console.log("Image vendoring complete. Visual review and optional WebP conversion remain separate steps.")
