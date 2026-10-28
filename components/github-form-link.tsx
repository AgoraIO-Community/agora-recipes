"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowUpRight, ChevronDown, Github } from "lucide-react"
import { replaceLocationSearch, useCatalogSearch } from "@/hooks/use-catalog-location"
import { contributionMaterials, contributionTopic } from "@/lib/contributions"
import { localePath } from "@/lib/locales"
import { useI18n } from "./locale-provider"
import { CopyTextButton } from "./code-panel"
import { Button } from "./ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"

export function GitHubFormLink({ topics, completedTopics, siteOrigin }: { topics: Record<string, string>; completedTopics: string[]; siteOrigin: string }) {
  const { t, locale } = useI18n()
  const search = useCatalogSearch()
  const topic = contributionTopic(search, topics)
  const completed = Object.entries(topics).filter(([slug]) => completedTopics.includes(slug))
  const current = Object.entries(topics).filter(([slug]) => !completedTopics.includes(slug))
  const selectedCompleted = Boolean(topic && completedTopics.includes(topic))
  const [showCompleted, setShowCompleted] = useState(false)
  const { formUrl, fallbackUrl, prompt } = contributionMaterials(locale, siteOrigin, topic)
  function selectTopic(value: string) {
    const params = new URLSearchParams(search)
    if (Object.hasOwn(topics, value)) params.set("topic", value)
    else params.delete("topic")
    replaceLocationSearch(params)
  }
  return <>
    <div className="contribute-topic">
      <label id="contribution-topic-label" htmlFor="contribution-topic">{t("Topic or activity (optional)")}</label>
      <DropdownMenu onOpenChange={open => setShowCompleted(open && selectedCompleted)}>
        <DropdownMenuTrigger asChild><Button id="contribution-topic" variant="outline" className="ag-select" aria-labelledby="contribution-topic-label contribution-topic-value" aria-describedby="contribution-topic-hint"><span id="contribution-topic-value" className="contribute-topic-value"><span className="contribute-topic-name">{topic ? topics[topic] : t("General catalog submission")}</span>{selectedCompleted && <span className="contribute-topic-status">{t("Completed")}</span>}</span><ChevronDown data-slot="select-icon" aria-hidden="true" /></Button></DropdownMenuTrigger>
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
      <p id="contribution-topic-hint">{topic ? <>{selectedCompleted ? t("This activity has ended. You can still share related work for its archive.") : t("Included in both the prompt and GitHub submission.")} <Link href={localePath(`/topics/${topic}`, locale)}>{t("View this Topic")}<ArrowUpRight size={13} aria-hidden="true" /></Link></> : t("No matching Topic? You can still share your project.")}</p>
    </div>
    <h2 className="detail-title">{t("Prepare your submission with AI")}</h2>
    <p className="contribute-instructions">{t("Paste the prompt into Codex, Cursor, or Claude Code in your project. It will use your README and public links to prepare an English submission for you to review.")}</p>
    <div className="contribute-actions">
      <CopyTextButton text={prompt} label="Copy submission prompt" subject="Submission prompt" primary />
      <Button asChild variant="outline"><a href={formUrl} target="_blank" rel="noreferrer" data-contribution="github_form"><Github aria-hidden="true" />{t("Fill it in on GitHub")}<ArrowUpRight aria-hidden="true" /></a></Button>
    </div>
    <p className="contribute-account">{t("Ready to write it yourself? Use the GitHub form. A GitHub account is required to submit; your Issue will be public.")}</p>
    <details className="contribute-prompt ag-disclosure"><summary>{t("View the submission prompt")}<ChevronDown size={15} aria-hidden="true" /></summary><pre tabIndex={0} aria-label={t("Submission prompt")} lang="en">{prompt}</pre></details>
    <details className="contribute-recovery ag-disclosure"><summary>{t("GitHub form not opening?")}<ChevronDown size={15} aria-hidden="true" /></summary><p>{t("Use a regular GitHub Issue with the same fields already filled in. Review and replace the instructions before submitting.")}</p><Button asChild variant="link"><a href={fallbackUrl} target="_blank" rel="noreferrer" data-contribution="github_issue">{t("Open a submission draft")}<ArrowUpRight aria-hidden="true" /></a></Button></details>
  </>
}
