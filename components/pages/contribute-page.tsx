import { absoluteUrl } from "@/lib/site"
import { ContributionPrompt } from "@/components/contribution-prompt"
import { RecipeBackLink } from "@/components/recipe-back-link"
import { contributionRepository } from "@/lib/contributions"
import { getAllTopics, topicNames, topicStatus } from "@/lib/topics"
import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { getT } from "@/lib/i18n"
import { locales, localePath, type Locale } from "@/lib/locales"

export async function generateMetadata({ params }: { params: Promise<{ locale?: Locale }> }): Promise<Metadata> {
  const { locale = "en" } = await params
  return { title: getT(locale)("Share your Agora project"), alternates: { canonical: localePath("/contribute", locale), languages: Object.fromEntries(locales.map(value => [value, localePath("/contribute", value)])) } }
}
export default async function ContributePage({ params }: { params: Promise<{ locale?: Locale }> }) {
  const { locale = "en" } = await params
  const t = getT(locale)
  const topics = topicNames(locale)
  const completedTopics = getAllTopics().filter(topic => topicStatus(topic) === "Completed").map(topic => topic.slug)
  return <article className="recipe-detail contribute-page">
    <header className="detail-hero"><div className="shell"><RecipeBackLink topics={topics} /><h1 className="hero-title">{t("Share your Agora project")}</h1></div></header>
    <div className="shell contribute-content">
      <div className="contribute-workspace">
        <section className="contribute-start" aria-label={t("Prepare your submission")}><ContributionPrompt topics={topics} completedTopics={completedTopics} siteOrigin={absoluteUrl("/")} /></section>
        <aside className="contribute-checklist" aria-labelledby="contribute-prepare-heading">
          <h2 id="contribute-prepare-heading" className="detail-title">{t("What to bring")}</h2>
          <ul>
            <li><h3>{t("A name and an English introduction")}</h3></li>
            <li><h3>{t("At least one public link")}</h3><p>{t("A working demo, video, source repository, or guide. You do not need all four.")}</p></li>
            <li><h3>{t("Your public author credit")}</h3></li>
          </ul>
          <Button asChild variant="link"><a href={localePath("/recipes/agora-rotary-dial-phone", locale)}>{t("See a published example")}</a></Button>
        </aside>
      </div>
      <section className="contribute-followup"><p className="recipe-source-note">{t("Submit a PR to staging and follow review in the PR.")}</p><Button asChild variant="link"><a href={`${contributionRepository}/issues/new/choose`} target="_blank" rel="noreferrer">{t("Report a bug or ask a question")}</a></Button></section>
      <p className="contribute-privacy recipe-source-note">{t("Submit only public materials. Do not include private email addresses, credentials, or other private information.")}</p>
    </div>
  </article>
}
