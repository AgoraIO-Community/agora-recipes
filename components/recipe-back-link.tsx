"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getCatalogReturnHref, useCatalogSearch } from "@/hooks/use-catalog-location"
import { useI18n } from "@/components/locale-provider"
import { Button } from "@/components/ui/button"

export function RecipeBackLink() {
  const search = useCatalogSearch()
  const { locale, t } = useI18n()
  const href = getCatalogReturnHref(search, locale)
  return <Button asChild variant="ghost" size="sm" className="detail-back"><Link href={href} prefetch={false}><ArrowLeft aria-hidden="true" />{t(new URLSearchParams(search).has("returnTo") ? "Back to results" : "Back to recipes")}</Link></Button>
}
