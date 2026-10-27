"use client"

import { useSyncExternalStore } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getCatalogReturnHref } from "@/hooks/use-catalog-location"
import { Button } from "@/components/ui/button"

const subscribe = () => () => {}

export function RecipeBackLink() {
  const href = useSyncExternalStore(subscribe, getCatalogReturnHref, () => "/#recipes")
  return <Button asChild variant="ghost" size="sm" className="detail-back"><Link href={href} prefetch={false}><ArrowLeft aria-hidden="true" />Back to recipes</Link></Button>
}
