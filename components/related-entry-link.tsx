"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { useCatalogSearch } from "@/hooks/use-catalog-location"
import { useI18n } from "@/components/locale-provider"
import { catalogReturnPath, localePath } from "@/lib/locales"

export function RelatedEntryLink({ slug, title }: { slug: string; title: string }) {
  const { locale } = useI18n()
  const source = new URLSearchParams(useCatalogSearch()).get("returnTo")
  const href = localePath(`/recipes/${slug}`, locale) + (source ? `?returnTo=${encodeURIComponent(catalogReturnPath(source, locale))}` : "")
  return <Link prefetch={false} href={href}>{title}<ArrowUpRight size={14} aria-hidden="true" /></Link>
}
