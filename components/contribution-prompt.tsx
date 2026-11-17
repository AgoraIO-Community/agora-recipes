"use client"

import { Disclosure, DisclosureTrigger, DisclosureContent } from "@/components/ui/disclosure"

import Link from "next/link"
import { useState } from "react"
import { ChevronDown, GitPullRequest } from "lucide-react"
import { replaceLocationSearch, useCatalogSearch } from "@/hooks/use-catalog-location"
import { contributionMaterials, contributionTopic } from "@/lib/contributions"
import { localePath } from "@/lib/locales"
import { useI18n } from "./locale-provider"
import { CopyTextButton } from "./code-panel"
import { CodePanel } from "@/components/code-panel"
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Button } from "./ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"

export function ContributionPrompt({ topics, completedTopics, siteOrigin }: { topics: Record<string, string>; completedTopics: string[]; siteOrigin: string }) {
  const { t, locale } = useI18n()
  const search = useCatalogSearch()
  const topic = contributionTopic(search, topics)
  const completed = Object.entries(topics).filter(([slug]) => completedTopics.includes(slug))
  const current = Object.entries(topics).filter(([slug]) => !completedTopics.includes(slug))
  const selectedCompleted = Boolean(topic && completedTopics.includes(topic))
  const [showCompleted, setShowCompleted] = useState(false)
  const { guideUrl, prompt } = contributionMaterials(locale, siteOrigin, topic)
  function selectTopic(value: string) {
    const params = new URLSearchParams(search)
    if (Object.hasOwn(topics, value)) params.set("topic", value)
    else params.delete("topic")
    replaceLocationSearch(params)
  }
  return <>
    <h2 className="detail-title">{t("Prepare your PR with AI")}</h2>
    <p className="contribute-instructions">{t("Paste the prompt into Codex, Cursor, or Claude Code in your project.")}</p>
    <Field className="contribute-topic">
      <FieldLabel id="contribution-topic-label" htmlFor="contribution-topic">{t("Topic or activity (optional)")}</FieldLabel>
      <DropdownMenu onOpenChange={open => setShowCompleted(open && selectedCompleted)}>
        <DropdownMenuTrigger asChild><Button id="contribution-topic" variant="field" aria-labelledby="contribution-topic-label contribution-topic-value" aria-describedby={topic ? "contribution-topic-hint" : undefined}><span id="contribution-topic-value" className="contribute-topic-value"><span className="contribute-topic-name">{topic ? topics[topic] : t("General catalog submission")}</span>{selectedCompleted && <span className="contribute-topic-status">{t("Completed")}</span>}</span><ChevronDown data-slot="select-icon" aria-hidden="true" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent className="contribute-topic-menu" align="start" collisionPadding={16}>
          <DropdownMenuRadioGroup value={topic ?? "__general"} onValueChange={selectTopic}>
            <DropdownMenuRadioItem value="__general">{t("General catalog submission")}</DropdownMenuRadioItem>
            {current.map(([slug, title]) => <DropdownMenuRadioItem key={slug} value={slug}>{title}</DropdownMenuRadioItem>)}
          </DropdownMenuRadioGroup>
          {completed.length > 0 && <><DropdownMenuSeparator />
            <DropdownMenuItem className="contribute-topic-history" aria-expanded={showCompleted} aria-controls="completed-contribution-topics" onSelect={event => { event.preventDefault(); setShowCompleted(value => !value) }}>{t("Ended activities ({count})", { count: completed.length })}<ChevronDown aria-hidden="true" /></DropdownMenuItem>
            {showCompleted && <DropdownMenuRadioGroup id="completed-contribution-topics" aria-label={t("Ended activities ({count})", { count: completed.length })} value={topic ?? "__general"} onValueChange={selectTopic}>{completed.map(([slug, title]) => <DropdownMenuRadioItem key={slug} value={slug}>{title}</DropdownMenuRadioItem>)}</DropdownMenuRadioGroup>}
          </>}
        </DropdownMenuContent>
      </DropdownMenu>
      {topic && <FieldDescription id="contribution-topic-hint"><Link href={localePath(`/topics/${topic}`, locale)}>{t("View this Topic")}</Link></FieldDescription>}
    </Field>
    <div className="contribute-actions">
      <CopyTextButton text={prompt} label="Copy PR prompt" subject="PR prompt" primary />
      <Button asChild variant="outline"><a href={guideUrl} target="_blank" rel="noreferrer" data-contribution="pr_instructions"><GitPullRequest aria-hidden="true" />{t("Read the PR contribution guide")}</a></Button>
    </div>
    <p className="contribute-account">{t("Requires a GitHub account. Submissions are public.")}</p>
    <Disclosure className="contribute-prompt"><DisclosureTrigger>{t("View the PR prompt")}</DisclosureTrigger><DisclosureContent><CodePanel code={prompt} label="PR prompt" wrap copyable={false} /></DisclosureContent></Disclosure>
  </>
}
