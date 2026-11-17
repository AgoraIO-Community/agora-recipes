import type { Metadata } from "next"
import { locales, localePath, type Locale } from "./locales"

export function pageAlternates(path: string, locale: Locale, markdown?: string): Metadata["alternates"] {
  return {
    canonical: localePath(path, locale),
    languages: Object.fromEntries([...locales.map(value => [value, localePath(path, value)]), ["x-default", localePath(path, "en")]]),
    ...(markdown ? { types: { "text/markdown": markdown } } : {}),
  }
}
