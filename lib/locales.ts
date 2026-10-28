export const locales = ["en", "zh-Hans", "zh-Hant", "ja"] as const
export type Locale = typeof locales[number]
export type Messages = Record<string, string>

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale)
}

export function localePath(path: string, locale: Locale): string {
  const unprefixed = path.replace(/^\/(en|zh-Hans|zh-Hant|ja)(?=\/|$|[?#])/, "") || "/"
  return locale === "en" ? unprefixed : `/${locale}${unprefixed === "/" ? "" : unprefixed}`
}

export function translate(messages: Messages, key: string, values: Record<string, string | number> = {}): string {
  return (messages[key] ?? key).replace(/\{(\w+)\}/g, (match, name: string) => String(values[name] ?? match))
}

// Keep return navigation separate from content identity. P1 can extend this
// allow-list when real Topic routes exist; arbitrary local/external URLs fail.
export function catalogReturnPath(value: string | null | undefined, locale: Locale = "en"): string {
  const fallback = `${localePath("/", locale)}#recipes`
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback
  try {
    const url = new URL(value, "https://catalog.invalid")
    if (url.origin !== "https://catalog.invalid" || !/^\/(en|zh-Hans|zh-Hant|ja)?\/?$/.test(url.pathname)) return fallback
    return `${url.pathname}${url.search}#recipes`
  } catch { return fallback }
}
