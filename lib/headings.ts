export function headingId(title: string): string {
  return title.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, "").trim().replace(/\s+/g, "-")
}
