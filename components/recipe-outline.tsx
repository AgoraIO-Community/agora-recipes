"use client"

import { useI18n } from "@/components/locale-provider"
import { useEffect, useState } from "react"
import { SelectionIndicator } from "@/components/ui/selection-indicator"

type Section = { title: string; id: string }

export function RecipeOutline({ sections }: { sections: Section[] }) {
  const { t } = useI18n()
  const [current, setCurrent] = useState("build")
  useEffect(() => {
    let frame = 0
    const measure = () => {
      frame = 0
      const offset = (document.querySelector(".site-header")?.getBoundingClientRect().height ?? 64) + 96
      let active = "build"
      for (const section of sections) {
        const heading = document.getElementById(section.id)
        if (heading && heading.getClientRects().length && heading.getBoundingClientRect().top <= offset) active = section.id
      }
      setCurrent(previous => previous === active ? previous : active)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure) }
    schedule()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [sections])
  const entries = [{ title: t("Build with agent"), id: "build" }, ...sections]
  return <nav className="guide-outline ag-selection-group" aria-labelledby="guide-outline-heading">
    <h2 id="guide-outline-heading">{t("In this guide")}</h2><SelectionIndicator value={current} />
    {entries.map(section => <a key={section.id} href={`#${section.id}`} data-state={current === section.id ? "active" : "inactive"} aria-current={current === section.id ? "location" : undefined}>{section.title}</a>)}
  </nav>
}
