"use client"

import { usePathname } from "next/navigation"
import { useI18n } from "@/components/locale-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { locales, localePath, isLocale, catalogReturnPath } from "@/lib/locales"

const names = { en: "English", "zh-Hans": "简体中文", "zh-Hant": "繁體中文", ja: "日本語" }

export function LanguageSwitcher() {
  const pathname = usePathname()
  const { locale, t } = useI18n()
  return <Select value={locale} onValueChange={next => {
    if (!isLocale(next)) return
    const params = new URLSearchParams(window.location.search)
    const origin = params.get("returnTo")
    if (origin) {
      const valid = new URL(catalogReturnPath(origin, locale), window.location.origin)
      params.set("returnTo", `${localePath(valid.pathname, next)}${valid.search}#recipes`)
    }
    window.location.assign(`${localePath(pathname, next)}${params.size ? `?${params}` : ""}${window.location.hash}`)
  }}>
    <SelectTrigger className="language-switcher" aria-label={t("Language")}><SelectValue>{names[locale]}</SelectValue></SelectTrigger>
    <SelectContent position="popper" align="end">{locales.map(value => <SelectItem key={value} value={value} lang={value}>{names[value]}</SelectItem>)}</SelectContent>
  </Select>
}
