"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useI18n } from "./locale-provider"
import { useCatalogSearch, rememberCatalogPosition } from "@/hooks/use-catalog-location"
import { localePath } from "@/lib/locales"

export function TopicEntryLink({ slug, title }: { slug: string; title: string }) {
  const { locale } = useI18n()
  const pathname = usePathname()
  const search = useCatalogSearch()
  return <Link prefetch={false} onClick={rememberCatalogPosition} onAuxClick={rememberCatalogPosition} href={`${localePath(`/recipes/${slug}`, locale)}?returnTo=${encodeURIComponent(`${pathname}${search}#recipes`)}`}>{title}</Link>
}
