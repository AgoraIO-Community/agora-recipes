/** Plain text for the static search asset; authored documents remain unchanged. */
export function searchableGuide(markdown: string): string {
  return markdown
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^\s*```[^\n]*$/gm, "")
    .replace(/&(?:nbsp|amp|lt|gt|quot);/g, " ")
    .replace(/^[#>*|\s-]+/gm, "")
    .replace(/[`*_~]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

export type GuideSearchDocuments = Record<string, string>
