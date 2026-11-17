import { StructuredData } from "@/components/structured-data"
import { breadcrumbSchema } from "@/lib/structured-data"
import { siteUrl } from "@/lib/site"
import { pageAlternates } from "@/lib/seo"
import { socialMetadata } from "@/lib/social"
import type { Metadata } from "next"
import { getAllTopics, topicStatus } from "@/lib/topics"
import { getT } from "@/lib/i18n"
import { localePath, type Locale } from "@/lib/locales"
import { TopicDirectory } from "@/components/topic-directory"

export async function generateMetadata({ params }: { params: Promise<{ locale?: Locale }> }): Promise<Metadata> {
  const { locale = "en" } = await params
  const t = getT(locale)
  return { ...socialMetadata({ title: t("Topics"), description: t("Explore collections, activities, and community work."), path: localePath("/topics", locale), locale }), title: t("Topics"), description: t("Explore collections, activities, and community work."), alternates: pageAlternates("/topics", locale) }
}
export default async function TopicsPage({ params }: { params: Promise<{ locale?: Locale }> }) {
  const { locale = "en" } = await params
  const t = getT(locale)
  const topics = [...getAllTopics()].sort((a, b) => Number(topicStatus(a) === "Completed") - Number(topicStatus(b) === "Completed")).map(topic => ({ slug: topic.slug, title: t(topic.compactTitle ?? topic.title), summary: t(topic.compactSummary ?? topic.summary), cover: topic.cover ? { src: topic.cover.src, alt: t(topic.cover.alt) } : undefined, kind: topic.kind, status: topicStatus(topic), count: topic.members.length }))
  return <article className="recipe-detail"><StructuredData value={breadcrumbSchema(siteUrl.href, [{ name: t("Recipes"), path: localePath("/", locale) }, { name: t("Topics"), path: localePath("/topics", locale) }])} /><header className="detail-hero"><div className="shell"><h1 className="hero-title">{t("Topics")}</h1></div></header><TopicDirectory topics={topics} /></article>
}
