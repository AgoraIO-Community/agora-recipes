"use client"

import { ArrowUpRight, Github } from "lucide-react"
import { useCatalogSearch } from "@/hooks/use-catalog-location"
import { localePath } from "@/lib/locales"
import { useI18n } from "./locale-provider"
import { Button } from "./ui/button"

export function GitHubFormLink({ topics, siteOrigin }: { topics: Record<string, string>; siteOrigin: string }) {
  const { t, locale } = useI18n()
  const candidate = new URLSearchParams(useCatalogSearch()).get("topic") ?? ""
  const topic = Object.hasOwn(topics, candidate) ? candidate : undefined
  const params = new URLSearchParams({ template: "submission.yml" })
  if (topic) params.set("topic", `${new URL(localePath(`/topics/${topic}`, locale), siteOrigin).href} — ${topics[topic]}`)
  return <div className="github-form-action">{topic && <p className="contribution-topic-context">{t("Submitting to Topic: {topic}", { topic: topics[topic] })}</p>}<Button asChild><a href={`https://github.com/AgoraIO-Community/agora-recipes/issues/new?${params}`} target="_blank" rel="noreferrer" data-contribution="github_form"><Github aria-hidden="true" />{t("Open GitHub form")}<ArrowUpRight aria-hidden="true" /></a></Button></div>
}
