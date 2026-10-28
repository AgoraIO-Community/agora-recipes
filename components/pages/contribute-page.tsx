import { absoluteUrl } from "@/lib/site"
import { GitHubFormLink } from "@/components/github-form-link"
import { RecipeBackLink } from "@/components/recipe-back-link"
import { contributionRepository } from "@/lib/contributions"
import { getAllTopics, topicNames, topicStatus } from "@/lib/topics"
import type { Metadata } from "next"
import { ArrowUpRight, GitPullRequest, ChevronDown } from "lucide-react"
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
    <header className="detail-hero"><div className="shell"><RecipeBackLink topics={topics} /><h1 className="hero-title">{t("Share your Agora project")}</h1><p className="detail-description">{t("A demo, video, source repository, or guide is enough. Bring what you already have.")}</p></div></header>
    <div className="shell contribute-content">
      <div className="contribute-workspace">
        <section className="contribute-start" aria-label={t("Prepare your submission")}><GitHubFormLink topics={topics} completedTopics={completedTopics} siteOrigin={absoluteUrl("/")} /></section>
        <aside className="contribute-checklist" aria-labelledby="contribute-prepare-heading">
          <h2 id="contribute-prepare-heading" className="detail-title">{t("What to bring")}</h2>
          <ul>
            <li><h3>{t("A name and a short introduction")}</h3><p>{t("What does it do, and who can use it?")}</p></li>
            <li><h3>{t("At least one public link")}</h3><p>{t("A working demo, video, source repository, or guide. You do not need all four.")}</p></li>
            <li><h3>{t("Your public author credit")}</h3><p>{t("The name or team you want shown on the site.")}</p></li>
          </ul>
          <p className="recipe-source-note">{t("Add device or account requirements if needed. Keep your original materials; four translations are not required.")}</p>
          <Button asChild variant="link"><a href={localePath("/recipes/agora-rotary-dial-phone", locale)}>{t("See a published example")}<ArrowUpRight aria-hidden="true" /></a></Button>
        </aside>
      </div>
      <section className="contribute-followup" aria-labelledby="contribute-followup-heading"><h2 id="contribute-followup-heading" className="detail-title">{t("What happens after submission?")}</h2><ol>
        <li><h3>{t("Follow the review in your Issue")}</h3><p>{t("Maintainers ask for any missing details in the same GitHub conversation.")}</p></li>
        <li><h3>{t("We prepare the catalog entry")}</h3><p>{t("Maintainers review the materials and Topic association, keeping your original submission and author credit.")}</p></li>
        <li><h3>{t("Get the published link")}</h3><p>{t("After review and release, maintainers add the site link to your Issue. Submitting does not publish automatically.")}</p></li>
      </ol><Button asChild variant="link"><a href={`${contributionRepository}/blob/staging/CONTRIBUTING.md#contribution-sop`} target="_blank" rel="noreferrer">{t("Read the contribution SOP")}<ArrowUpRight aria-hidden="true" /></a></Button></section>
      <details className="contribute-pr ag-disclosure"><summary>{t("Prefer to contribute with a pull request?")}<ChevronDown size={15} aria-hidden="true" /></summary><p>{t("Fork the catalog, create a branch from staging, and add content/recipes/<your-slug>/recipe.json. Use templates/demo.json for a demo or templates/recipe.json for a guide. Build and open a PR to staging; no submission Issue is required.")}</p><Button asChild variant="link"><a href={`${contributionRepository}/blob/staging/CONTRIBUTING.md`} data-contribution="pr_instructions" target="_blank" rel="noreferrer"><GitPullRequest aria-hidden="true" />{t("Read the PR contribution guide")}<ArrowUpRight aria-hidden="true" /></a></Button></details>
      <p className="contribute-privacy recipe-source-note">{t("Submit only public materials. Do not include private email addresses, credentials, or other private information.")}</p>
    </div>
  </article>
}
