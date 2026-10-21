// Override at build time for deployments with a different public origin.
export const siteUrl = new URL(
  process.env.SITE_URL ?? "https://recipes.agora.io",
)

export function absoluteUrl(path: string): string {
  return new URL(path, siteUrl).href
}
