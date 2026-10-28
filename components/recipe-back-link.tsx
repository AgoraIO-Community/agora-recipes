"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getCatalogReturnHref, useCatalogSearch } from "@/hooks/use-catalog-location"
import { useI18n } from "@/components/locale-provider"
import { Button } from "@/components/ui/button"

export function RecipeBackLink({ topics = {} }: { topics?: Record<string, string> }) {
  const search = useCatalogSearch()
  const { locale, t } = useI18n()
  const candidate = getCatalogReturnHref(search, locale)
  const topic = candidate.match(/\/topics\/([a-z0-9-]+)/)?.[1]
  const href = topic && !topics[topic] ? getCatalogReturnHref("", locale) : candidate
  const label = topic && topics[topic] ? t("Back to {topic}", { topic: topics[topic] }) : t(new URLSearchParams(search).has("returnTo") ? "Back to results" : "Back to recipes")
  return <Button asChild variant="ghost" size="sm" className="detail-back"><Link href={href} prefetch={false}><ArrowLeft aria-hidden="true" />{label}</Link></Button>
}
