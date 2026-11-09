"use client"

import { Languages } from "lucide-react"
import { useI18n } from "./locale-provider"
import { useCatalogSearch } from "@/hooks/use-catalog-location"
import { catalogReturnPath, localePath } from "@/lib/locales"
import { documentPath } from "@/lib/documents"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"

export function DocumentLanguageSwitcher({ slug, selected, label, description, options }: { slug: string; selected: string; label?: string; description?: string; options: { key: string; label: string; unavailable?: boolean }[] }) {
  const { locale, t } = useI18n()
  const source = new URLSearchParams(useCatalogSearch()).get("returnTo")
  return <div className="document-language"><Select value={selected} onValueChange={key => {
    const path = localePath(documentPath(slug, key === "auto" ? undefined : key), locale)
    window.location.assign(path + (source ? `?returnTo=${encodeURIComponent(catalogReturnPath(source, locale))}` : "") + "#recipe-markdown-heading")
  }}><Tooltip><TooltipTrigger asChild><SelectTrigger size="icon" aria-label={t("Guide language")}><Languages aria-hidden="true" /><SelectValue>{label}</SelectValue></SelectTrigger></TooltipTrigger><TooltipContent>{description ?? `${t("Guide language")}: ${label}`}</TooltipContent></Tooltip><SelectContent position="popper"><SelectGroup>{options.map(option => <SelectItem key={option.key} value={option.key}>{t(option.label)}{option.unavailable ? ` · ${t("Unavailable")}` : ""}</SelectItem>)}</SelectGroup></SelectContent></Select></div>
}
