"use client"

import { useI18n } from "./locale-provider"
import { useCatalogSearch } from "@/hooks/use-catalog-location"
import { catalogReturnPath, localePath } from "@/lib/locales"
import { documentPath } from "@/lib/documents"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

export function DocumentLanguageSwitcher({ slug, selected, options }: { slug: string; selected: string; options: { key: string; label: string; unavailable?: boolean }[] }) {
  const { locale, t } = useI18n()
  const source = new URLSearchParams(useCatalogSearch()).get("returnTo")
  return <div className="document-language"><span>{t("Guide language")}</span><Select value={selected} onValueChange={key => {
    const path = localePath(documentPath(slug, key === "auto" ? undefined : key), locale)
    window.location.assign(path + (source ? `?returnTo=${encodeURIComponent(catalogReturnPath(source, locale))}` : "") + "#recipe-markdown-heading")
  }}><SelectTrigger aria-label={t("Guide language")}><SelectValue /></SelectTrigger><SelectContent position="popper">{options.map(option => <SelectItem key={option.key} value={option.key}>{t(option.label)}{option.unavailable ? ` · ${t("Unavailable")}` : ""}</SelectItem>)}</SelectContent></Select></div>
}
