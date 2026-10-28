"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { useI18n } from "./locale-provider"
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group"
import { Badge } from "./ui/badge"
import { localePath } from "@/lib/locales"

export function TopicDirectory({ topics }: { topics: { slug: string; title: string; summary: string; status: string; kind: string; count: number }[] }) {
  const { locale, t } = useI18n()
  const [filter, setFilter] = useState("all")
  const visible = topics.filter(topic => filter === "all" || (filter === "past" ? topic.status === "Completed" : topic.kind === filter))
  return <section className="shell topic-directory">
    <ToggleGroup type="single" value={filter} onValueChange={value => setFilter(value || "all")} className="ag-selection-group topic-directory__filters" aria-label={t("Filter Topics")}>
      {[["all", "All"], ["collection", "Collections"], ["activity", "Activities"], ["past", "Past activities"]].map(([value, label]) => <ToggleGroupItem key={value} value={value}>{t(label)}</ToggleGroupItem>)}
    </ToggleGroup>
    <p role="status" className="recipe-source-note">{t("{count} Topics", { count: visible.length })}</p>
    <div className="topic-directory__grid">{visible.map(topic => <article key={topic.slug} className="topic-directory__card">
      <div className="topic-directory__meta"><Badge variant="outline">{t(topic.status)}</Badge><span>{t("{count} entries", { count: topic.count })}</span></div>
      <h2><Link href={localePath(`/topics/${topic.slug}`, locale)}>{topic.title}<ArrowUpRight size={18} aria-hidden="true" /></Link></h2>
      <p>{topic.summary}</p>
    </article>)}</div>
    {!visible.length && <p className="recipe-source-note">{t("No Topics in this view yet.")}</p>}
  </section>
}
