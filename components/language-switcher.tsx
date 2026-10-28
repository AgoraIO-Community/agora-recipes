"use client"

import { usePathname } from "next/navigation"
import { Globe2 } from "lucide-react"
import { useI18n } from "@/components/locale-provider"
import { IconButton } from "@/components/ui/icon-button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { locales, localePath, isLocale, catalogReturnPath } from "@/lib/locales"

const names = { en: "English", "zh-Hans": "简体中文", "zh-Hant": "繁體中文", ja: "日本語" }

export function LanguageSwitcher() {
  const pathname = usePathname()
  const { locale, t } = useI18n()
  function changeLanguage(next: string) {
    if (!isLocale(next) || next === locale) return
    const params = new URLSearchParams(window.location.search)
    const origin = params.get("returnTo")
    if (origin) {
      const valid = new URL(catalogReturnPath(origin, locale), window.location.origin)
      params.set("returnTo", `${localePath(valid.pathname, next)}${valid.search}#recipes`)
    }
    window.location.assign(`${localePath(pathname, next)}${params.size ? `?${params}` : ""}${window.location.hash}`)
  }
  return <DropdownMenu>
    <DropdownMenuTrigger asChild><IconButton className="language-switcher" label={`${t("Language")} · ${names[locale]}`}><Globe2 aria-hidden="true" /></IconButton></DropdownMenuTrigger>
    <DropdownMenuContent align="end" sideOffset={8} collisionPadding={16} aria-label={t("Language")}>
      <DropdownMenuLabel>{t("Language")}</DropdownMenuLabel>
      <DropdownMenuRadioGroup value={locale} onValueChange={changeLanguage}>
        {locales.map(value => <DropdownMenuRadioItem key={value} value={value} lang={value}>{names[value]}</DropdownMenuRadioItem>)}
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  </DropdownMenu>
}
