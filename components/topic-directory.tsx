"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import { useI18n } from "./locale-provider"
import { SelectionIndicator } from "./ui/selection-indicator"
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group"
import { localePath } from "@/lib/locales"

export function TopicDirectory({ topics }: { topics: { slug: string; title: string; summary: string; cover?: { src: string; alt: string }; status: string; kind: string; count: number }[] }) {
  const { locale, t } = useI18n()
  const [filter, setFilter] = useState("all")
  const [failedCovers, setFailedCovers] = useState<string[]>([])
  const visible = topics.filter(topic => filter === "all" || (filter === "past" ? topic.status === "Completed" : topic.kind === filter))
  return <section className="shell topic-directory">
    <ToggleGroup spacing={1} type="single" value={filter} onValueChange={value => setFilter(value || "all")} className="ag-selection-group topic-directory__filters" aria-label={t("Filter Topics")}>
      <SelectionIndicator value={filter} />
      {[["all", "All"], ["collection", "Collections"], ["activity", "Activities"], ["past", "Past activities"]].map(([value, label]) => <ToggleGroupItem key={value} value={value}>{t(label)}</ToggleGroupItem>)}
    </ToggleGroup>
    <p role="status" className="recipe-source-note">{t("{count} Topics", { count: visible.length })}</p>
    <div className="topic-directory__grid">{visible.map(topic => <article key={topic.slug} className="topic-directory__card">
      <Link className="topic-directory__link" aria-labelledby={`topic-${topic.slug}-title`} href={localePath(`/topics/${topic.slug}`, locale)}>
        <div className="topic-directory__cover"><Image src={topic.cover && !failedCovers.includes(topic.slug) ? topic.cover.src : "/social-card.png"} alt={topic.cover && !failedCovers.includes(topic.slug) ? topic.cover.alt : ""} fill sizes="(max-width: 640px) 50vw, (max-width: 1504px) 50vw, 700px" onError={() => setFailedCovers(previous => previous.includes(topic.slug) ? previous : [...previous, topic.slug])} /></div>
        <div className="topic-directory__body">
          <h2 id={`topic-${topic.slug}-title`}>{topic.title}<ArrowUpRight size={18} aria-hidden="true" /></h2>
          <p className="topic-directory__summary">{topic.summary}</p>
          <div className="topic-directory__meta"><span>{t(topic.count === 1 ? "1 entry" : "{count} entries", { count: topic.count })}</span><span>{t(topic.status)}</span></div>
        </div>
      </Link>
    </article>)}</div>
    {!visible.length && <p className="recipe-source-note">{t("No Topics in this view yet.")}</p>}
  </section>
}
