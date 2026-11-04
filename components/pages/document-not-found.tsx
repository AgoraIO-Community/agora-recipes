"use client"

import { useCatalogSearch } from "@/hooks/use-catalog-location"
import { catalogReturnPath } from "@/lib/locales"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useI18n } from "@/components/locale-provider"
import { Button } from "@/components/ui/button"

export default function DocumentNotFound() {
  const { t, locale } = useI18n()
  const source = new URLSearchParams(useCatalogSearch()).get("returnTo")
  const path = usePathname().split("/guide/")[0]
  return <section className="shell contribute-content"><h1 className="hero-title">{t("This guide version is unavailable")}</h1><p>{t("The requested author document is not available. No other version was selected automatically.")}</p><Button asChild variant="outline"><Link href={path + (source ? `?returnTo=${encodeURIComponent(catalogReturnPath(source, locale))}` : "")}>{t("Choose an available guide version")}</Link></Button></section>
}
