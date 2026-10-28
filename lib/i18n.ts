import "server-only"
import simplified from "@/content/i18n/zh-Hans.json"
import traditional from "@/content/i18n/zh-Hant.json"
import japanese from "@/content/i18n/ja.json"
import { translate, type Locale, type Messages } from "./locales"

type Presentation = { title?: string; tagline: string; description: string }
const dictionaries: Record<Exclude<Locale, "en">, { ui: Messages; entries: Record<string, Presentation> }> = {
  "zh-Hans": simplified, "zh-Hant": traditional, ja: japanese,
}
export function getMessages(locale: Locale): Messages {
  return locale === "en" ? {} : dictionaries[locale].ui
}
export function getT(locale: Locale) {
  const messages = getMessages(locale)
  return (key: string, values?: Record<string, string | number>) => translate(messages, key, values)
}
export function localizeEntry<T extends { slug: string; title: string; tagline: string; description: string }>(entry: T, locale: Locale): T {
  if (locale === "en") return entry
  const presentation = dictionaries[locale].entries[entry.slug]
  return presentation ? { ...entry, ...presentation } : entry
}
