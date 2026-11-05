"use client"

import { useI18n } from "@/components/locale-provider"
import { localePath } from "@/lib/locales"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyHeader, EmptyTitle } from "@/components/ui/empty"

export default function NotFound() {
  const { t, locale } = useI18n()
  return (
    <section className="shell"><Empty className="page-empty"><EmptyHeader>
      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
        404
      </p>
      <EmptyTitle><h1 className="hero-title">
        {t("We couldn’t find that recipe.")}
      </h1></EmptyTitle>
</EmptyHeader><EmptyContent>
      <Button asChild wrap>
        <Link href={`${localePath("/", locale)}#recipes`}>
          <ArrowLeft aria-hidden="true" />
          {t("Back to recipes")}
        </Link>
      </Button></EmptyContent></Empty></section>
  )
}
