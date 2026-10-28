"use client"

import Link from "next/link"
import { ArrowUpRight, ChevronDown, Github } from "lucide-react"
import { replaceLocationSearch, useCatalogSearch } from "@/hooks/use-catalog-location"
import { contributionMaterials, contributionTopic } from "@/lib/contributions"
import { localePath } from "@/lib/locales"
import { useI18n } from "./locale-provider"
import { CopyTextButton } from "./code-panel"
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

export function GitHubFormLink({ topics, siteOrigin }: { topics: Record<string, string>; siteOrigin: string }) {
  const { t, locale } = useI18n()
  const search = useCatalogSearch()
  const topic = contributionTopic(search, topics)
  const { formUrl, fallbackUrl, prompt } = contributionMaterials(locale, siteOrigin, topic)
  function selectTopic(value: string) {
    const params = new URLSearchParams(search)
    if (Object.hasOwn(topics, value)) params.set("topic", value)
    else params.delete("topic")
    replaceLocationSearch(params)
  }
  return <>
    <div className="contribute-topic">
      <label htmlFor="contribution-topic">{t("Topic or activity (optional)")}</label>
      <Select value={topic ?? "__general"} onValueChange={selectTopic}>
        <SelectTrigger id="contribution-topic" aria-describedby="contribution-topic-hint"><SelectValue /></SelectTrigger>
        <SelectContent position="popper" align="start" collisionPadding={16}>
          <SelectItem value="__general">{t("General catalog submission")}</SelectItem>
          {Object.entries(topics).map(([slug, title]) => <SelectItem key={slug} value={slug}>{title}</SelectItem>)}
        </SelectContent>
      </Select>
      <p id="contribution-topic-hint">{topic ? <>{t("Included in both the prompt and GitHub submission.")} <Link href={localePath(`/topics/${topic}`, locale)}>{t("View this Topic")}<ArrowUpRight size={13} aria-hidden="true" /></Link></> : t("No matching Topic? You can still share your project.")}</p>
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
