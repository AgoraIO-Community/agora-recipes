import { createHash } from "node:crypto"

// Compare published guide content, not a build's wall-clock timestamp.
export function documentFingerprint(artifact) {
  return createHash("sha256").update(JSON.stringify({ source: artifact.source, recipeDocument: artifact.recipeDocument, documentLanguages: artifact.documentLanguages })).digest("hex")
}

export function contentModifiedAt(artifact, previous, metadataDate, now) {
  if (!previous) return metadataDate
  if (documentFingerprint(artifact) !== documentFingerprint(previous)) return now
  return previous.contentUpdatedAt ?? metadataDate
}
