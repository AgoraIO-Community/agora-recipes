"use client"

import { useI18n } from "@/components/locale-provider"
import { localePath } from "@/lib/locales"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  const { t, locale } = useI18n()
  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-24 text-center flex flex-col items-center gap-4">
      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
        404
      </p>
      <h1 className="hero-title">
        {t("We couldn’t find that recipe.")}
      </h1>
      <p className="text-muted-foreground max-w-md text-pretty">
        {t("This recipe may have moved. Browse the list to find the right sample.")}
      </p>
      <Button asChild className="mt-3 gap-2">
        <Link href={`${localePath("/", locale)}#recipes`}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("Back to recipes")}
        </Link>
      </Button>
    </section>
  )
}
