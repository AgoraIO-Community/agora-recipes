// Fits catalog copy into a search-result description: whole sentences first, then a word boundary.
export function metaDescription(text: string, limit = 160): string {
  const value = text.replace(/\s+/g, " ").trim()
  if (value.length <= limit) return value
  let fitted = ""
  for (const sentence of value.match(/.+?(?:[.!?](?=\s|$)|[。！？])\s*/g) ?? []) {
    if ((fitted + sentence).trimEnd().length > limit) break
    fitted += sentence
  }
  if (fitted.trim().length >= limit / 2) return fitted.trim()
  const cut = value.slice(0, limit - 1)
  const space = cut.lastIndexOf(" ")
  return `${(space > limit / 2 ? cut.slice(0, space) : cut).replace(/[\s,;:，、；：]+$/, "")}…`
}
