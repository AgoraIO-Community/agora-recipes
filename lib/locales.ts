export const locales = ["en", "zh-Hans", "zh-Hant", "ja", "hi", "es", "pt-BR"] as const
export type Locale = typeof locales[number]
export type Messages = Record<string, string>

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale)
}

export function localePath(path: string, locale: Locale): string {
  const unprefixed = path.replace(/^\/(en|zh-Hans|zh-Hant|ja|hi|es|pt-BR)(?=\/|$|[?#])/, "") || "/"
  return locale === "en" ? unprefixed : `/${locale}${unprefixed === "/" ? "" : unprefixed}`
}

export function translate(messages: Messages, key: string, values: Record<string, string | number> = {}): string {
  return (messages[key] ?? key).replace(/\{(\w+)\}/g, (match, name: string) => String(values[name] ?? match))
}

// Return destinations are list routes only. Content identity and canonical URLs
// never depend on the list that opened an entry.
export function catalogReturnPath(value: string | null | undefined, locale: Locale = "en"): string {
  const fallback = `${localePath("/", locale)}#recipes`
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback
  try {
    const url = new URL(value, "https://catalog.invalid")
    const path = localePath(url.pathname, "en")
    if (url.origin !== "https://catalog.invalid" || (path !== "/" && !/^\/topics\/[a-z0-9]+(?:-[a-z0-9]+)*\/?$/.test(path))) return fallback
    return `${url.pathname}${url.search}#recipes`
  } catch { return fallback }
}
