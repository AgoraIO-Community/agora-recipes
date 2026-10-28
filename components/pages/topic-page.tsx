import { socialMetadata } from "@/lib/social"
import { absoluteUrl } from "@/lib/site"
import { ShareActions } from "@/components/share-actions"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowUpRight } from "lucide-react"
import { getAllTopics, getTopic, topicStatus } from "@/lib/topics"
import { getRecipeSummaries } from "@/lib/showcase"
import { getT } from "@/lib/i18n"
import { locales, localePath, type Locale } from "@/lib/locales"
import { RecipeExplorer } from "@/components/recipe-explorer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TopicContributionLink, TopicEntryLink } from "@/components/topic-entry-link"

type Params = { slug: string; locale?: Locale }
export function generateStaticParams() { return getAllTopics().map(topic => ({ slug: topic.slug })) }
export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug, locale = "en" } = await params
  const topic = getTopic(slug)
  const t = getT(locale)
  return topic ? { ...socialMetadata({ title: t(topic.title), description: t(topic.summary), path: localePath(`/topics/${slug}`, locale), locale, image: getRecipeSummaries(locale).find(entry => topic.members.some(member => member.slug === entry.slug) && entry.showcase?.thumbnail)?.showcase?.thumbnail }), title: t(topic.title), description: t(topic.summary), alternates: { canonical: localePath(`/topics/${slug}`, locale), languages: Object.fromEntries(locales.map(value => [value, localePath(`/topics/${slug}`, value)])) } } : { title: t("Topic not found") }
}
export default async function TopicPage({ params }: { params: Promise<Params> }) {
  const { slug, locale = "en" } = await params
  const topic = getTopic(slug)
  if (!topic) notFound()
  const t = getT(locale)
  const allEntries = getRecipeSummaries(locale)
  const entries = topic.members.map((member, index) => ({ ...allEntries.find(entry => entry.slug === member.slug)!, recommendedOrder: index }))
  const awards = topic.members.filter(member => member.award)
  return <article className="recipe-detail topic-detail">
    <header className="detail-hero"><div className="shell">
      <Button asChild variant="ghost" size="sm" className="detail-back"><Link href={localePath("/topics", locale)}><ArrowLeft aria-hidden="true" />{t("All Topics")}</Link></Button>
      {topic.kind === "activity" && <div className="detail-meta"><Badge variant="outline">{t(topicStatus(topic))}</Badge>{topic.starts && <span>{topic.starts}{topic.ends && ` – ${topic.ends}`}</span>}</div>}
      <h1 className="hero-title">{t(topic.title)}</h1><p className="detail-description">{t(topic.summary)}</p>
      <div className="detail-actions"><TopicContributionLink slug={topic.slug}>{t(topic.kind === "activity" && topicStatus(topic) === "Completed" ? "Share related work" : "Contribute to this Topic")}</TopicContributionLink>
        {topic.actions?.map(action => <Button asChild variant="outline" key={action.url}><a href={action.url} target="_blank" rel="noreferrer" data-topic-action={action.type} data-placement="topic_page">{t(action.label)}<ArrowUpRight aria-hidden="true" /></a></Button>)}
        <ShareActions url={absoluteUrl(localePath(`/topics/${slug}`, locale))} title={t(topic.title)} />
      </div>
      {topicStatus(topic) === "Completed" && <p className="recipe-source-note">{t("This activity has ended. Its materials remain available; general catalog submissions are still open.")}</p>}
    </div></header>
    {(topic.sections?.length || awards.length) ? <div className="shell topic-sections">
      {topic.sections?.map(section => <section key={section.title} className="recipe-about"><h2>{t(section.title)}</h2><p lang={section.language}>{section.language ? section.body : t(section.body)}</p>{section.language && <p className="recipe-source-note">{t("Source material language: {language}", { language: section.language })}</p>}{section.sourceUrl && <a href={section.sourceUrl} target="_blank" rel="noreferrer" data-topic-action="source">{t("Read the original material")}<ArrowUpRight size={14} aria-hidden="true" /></a>}</section>)}
      {awards.length > 0 && <section className="recipe-about"><h2>{t("Results & awards")}</h2><p className="recipe-source-note">{t("Awards belong to this activity edition. Follow each source for its original credit.")}</p><ul className="topic-awards">{awards.map(member => <li key={member.slug}><TopicEntryLink slug={member.slug} title={entries.find(entry => entry.slug === member.slug)!.title} /><span>{t(member.award!.label)}</span><a href={member.award!.sourceUrl} target="_blank" rel="noreferrer" data-topic-action="source">{t("Award source")}<ArrowUpRight size={14} aria-hidden="true" /></a></li>)}</ul></section>}
    </div> : null}
    <RecipeExplorer recipes={entries} embedded topicSlug={slug} />
  </article>
}
