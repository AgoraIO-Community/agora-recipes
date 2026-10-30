import { socialMetadata } from "@/lib/social"
import type { Metadata } from "next"
import { getAllTopics, topicStatus } from "@/lib/topics"
import { getT } from "@/lib/i18n"
import { locales, localePath, type Locale } from "@/lib/locales"
import { TopicDirectory } from "@/components/topic-directory"

export async function generateMetadata({ params }: { params: Promise<{ locale?: Locale }> }): Promise<Metadata> {
  const { locale = "en" } = await params
  const t = getT(locale)
  return { ...socialMetadata({ title: t("Topics"), description: t("Explore collections, activities, and community work."), path: localePath("/topics", locale), locale }), title: t("Topics"), description: t("Explore collections, activities, and community work."), alternates: { canonical: localePath("/topics", locale), languages: Object.fromEntries(locales.map(value => [value, localePath("/topics", value)])) } }
}
export default async function TopicsPage({ params }: { params: Promise<{ locale?: Locale }> }) {
  const { locale = "en" } = await params
  const t = getT(locale)
  const topics = [...getAllTopics()].sort((a, b) => Number(topicStatus(a) === "Completed") - Number(topicStatus(b) === "Completed")).map(topic => ({ slug: topic.slug, title: t(topic.compactTitle ?? topic.title), summary: t(topic.compactSummary ?? topic.summary), cover: topic.cover ? { src: topic.cover.src, alt: t(topic.cover.alt) } : undefined, kind: topic.kind, status: topicStatus(topic), count: topic.members.length }))
  return <article className="recipe-detail"><header className="detail-hero"><div className="shell"><h1 className="hero-title">{t("Topics")}</h1><p className="detail-description">{t("Explore collections, activities, and community work.")}</p></div></header><TopicDirectory topics={topics} /></article>
}
